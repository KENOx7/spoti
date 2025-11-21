import { createContext, useContext, useState, useRef, ReactNode, useEffect, useCallback } from "react";
import { Track } from "@/types";
import { storage } from "@/lib/storage";
import { useAuth } from "@/context/auth-context";

export type RepeatMode = "off" | "all" | "one";
type PlaybackSource = "html" | "spotify";

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  isLoading: boolean;
  error: string | null;
  repeatMode: RepeatMode;
  isShuffled: boolean;
  playTrack: (track: Track) => Promise<void>;
  pauseTrack: () => void;
  togglePlayPause: () => void;
  setVolume: (volume: number) => void;
  seekTo: (time: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  queue: Track[];
  originalQueue: Track[];
  setQueue: (tracks: Track[]) => void;
  likedTracks: Track[];
  toggleLike: (track: Track) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(storage.getCurrentTrack());
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(storage.getVolume());
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");
  const [isShuffled, setIsShuffled] = useState(false);
  const [queue, setQueue] = useState<Track[]>(storage.getQueue());
  const [originalQueue, setOriginalQueue] = useState<Track[]>([]);
  const [likedTracks, setLikedTracks] = useState<Track[]>(storage.getLikedTracks());
  const [playbackSource, setPlaybackSource] = useState<PlaybackSource>("html");
  const [spotifyDeviceId, setSpotifyDeviceId] = useState<string | null>(null);
  const [isSpotifyReady, setIsSpotifyReady] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const spotifyPlayerRef = useRef<Spotify.Player | null>(null);
  const sdkLoadingRef = useRef<Promise<void> | null>(null);
  const previousSpotifyStateRef = useRef<Spotify.PlaybackState | null>(null);
  const queueRef = useRef<Track[]>(queue);
  const currentTrackRef = useRef<Track | null>(currentTrack);
  const repeatModeRef = useRef<RepeatMode>(repeatMode);
  const volumeRef = useRef<number>(volume);
  const playNextRef = useRef<() => void>(() => {});
  const playSpotifyTrackRef = useRef<((track: Track) => Promise<void>) | null>(null);

  const { spotifyAuth, getSpotifyAccessToken } = useAuth();

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
      if (cleanupRef.current) {
        cleanupRef.current();
      }
      if (spotifyPlayerRef.current) {
        spotifyPlayerRef.current.disconnect();
        spotifyPlayerRef.current = null;
      }
    };
  }, []);

  // Save liked tracks to localStorage
  useEffect(() => {
    storage.saveLikedTracks(likedTracks);
  }, [likedTracks]);

  // Save volume to localStorage
  useEffect(() => {
    storage.saveVolume(volume);
    volumeRef.current = volume;
  }, [volume]);

  // Save queue to localStorage
  useEffect(() => {
    if (queue.length > 0) {
      storage.saveQueue(queue);
    }
    queueRef.current = queue;
  }, [queue]);

  // Save current track to localStorage
  useEffect(() => {
    storage.saveCurrentTrack(currentTrack);
    currentTrackRef.current = currentTrack;
  }, [currentTrack]);

  useEffect(() => {
    repeatModeRef.current = repeatMode;
  }, [repeatMode]);

  // Cleanup previous audio and setup new one
  const cleanupAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeEventListener("loadedmetadata", () => {});
      audioRef.current.removeEventListener("timeupdate", () => {});
      audioRef.current.removeEventListener("ended", () => {});
      audioRef.current.removeEventListener("error", () => {});
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
  }, []);

  const loadSpotifySdk = useCallback(() => {
    if (typeof window === "undefined") {
      return Promise.reject(new Error("Spotify SDK yalnız brauzerdə mövcuddur"));
    }

    if ((window as any).Spotify) {
      return Promise.resolve();
    }

    if (sdkLoadingRef.current) {
      return sdkLoadingRef.current;
    }

    sdkLoadingRef.current = new Promise<void>((resolve, reject) => {
      const existingScript = document.getElementById("spotify-player");
      if (existingScript) {
        window.onSpotifyWebPlaybackSDKReady = () => resolve();
        return;
      }

      const script = document.createElement("script");
      script.id = "spotify-player";
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;
      window.onSpotifyWebPlaybackSDKReady = () => resolve();
      script.onerror = () => reject(new Error("Spotify Web Playback SDK yüklənmədi"));
      document.body.appendChild(script);
    }).finally(() => {
      sdkLoadingRef.current = null;
    });

    return sdkLoadingRef.current;
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const initSpotifyPlayer = async () => {
      if (!spotifyAuth.accessToken) {
        setSpotifyDeviceId(null);
        setIsSpotifyReady(false);
        if (spotifyPlayerRef.current) {
          spotifyPlayerRef.current.disconnect();
          spotifyPlayerRef.current = null;
        }
        return;
      }

      try {
        await loadSpotifySdk();
        if (isCancelled) return;

        if (spotifyPlayerRef.current) {
          return;
        }

        const player = new (window as any).Spotify.Player({
          name: "Spoti Web Player",
          getOAuthToken: async (cb: (token: string) => void) => {
            const token = await getSpotifyAccessToken();
            if (token) {
              cb(token);
            } else {
              setError("Spotify token tapılmadı. Yenidən giriş edin.");
            }
          },
          volume: volumeRef.current,
        });

        player.addListener("ready", ({ device_id }) => {
          setSpotifyDeviceId(device_id);
          setIsSpotifyReady(true);
        });

        player.addListener("not_ready", ({ device_id }) => {
          if (device_id === spotifyDeviceId) {
            setIsSpotifyReady(false);
          }
        });

        player.addListener("player_state_changed", (state: Spotify.PlaybackState | null) => {
          if (!state) return;
          setPlaybackSource("spotify");
          setCurrentTime((state.position || 0) / 1000);
          setDuration((state.duration || 0) / 1000);
          setIsPlaying(!state.paused);

          const currentUri = state.track_window?.current_track?.uri;
          if (currentUri) {
            const match = queueRef.current.find((track) => track.spotifyUri === currentUri);
            if (match) {
              setCurrentTrack(match);
            }
          }

          const previousState = previousSpotifyStateRef.current;
          const ended =
            previousState &&
            previousState.track_window?.current_track?.uri === currentUri &&
            !previousState.paused &&
            state.paused &&
            state.position === 0;

          if (ended) {
            if (repeatModeRef.current === "one" && currentTrackRef.current) {
              void playSpotifyTrackRef.current?.(currentTrackRef.current);
            } else if (repeatModeRef.current === "all" || queueRef.current.length > 0) {
              playNextRef.current?.();
            } else {
              setIsPlaying(false);
              setCurrentTime(0);
            }
          }

          previousSpotifyStateRef.current = state;
        });

        player.addListener("initialization_error", ({ message }) => {
          console.error("Spotify initialization error:", message);
          setError("Spotify player açıla bilmədi.");
        });
        player.addListener("authentication_error", ({ message }) => {
          console.error("Spotify authentication error:", message);
          setError("Spotify auth xətası. Yenidən giriş edin.");
        });
        player.addListener("account_error", ({ message }) => {
          console.error("Spotify account error:", message);
          setError("Spotify Premium hesabı tələb olunur.");
        });

        const connected = await player.connect();
        if (connected) {
          spotifyPlayerRef.current = player;
        } else {
          setError("Spotify player qoşulmadı.");
        }
      } catch (error) {
        console.error("Spotify player init error:", error);
        if (!isCancelled) {
          setError("Spotify Web Playback SDK aktivləşmədi.");
        }
      }
    };

    initSpotifyPlayer();

    return () => {
      isCancelled = true;
    };
  }, [spotifyAuth.accessToken, getSpotifyAccessToken, loadSpotifySdk, spotifyDeviceId]);

  const playHtmlTrack = useCallback(
    (track: Track) => {
      if (!track || !track.audioUrl) {
        setError("Mahnının audio linki tapılmadı.");
        return;
      }

      if (spotifyPlayerRef.current) {
        spotifyPlayerRef.current.pause().catch(() => {});
      }

      setPlaybackSource("html");
      cleanupAudio();
      setError(null);
      setIsLoading(true);
      setCurrentTrack(track);
      setIsPlaying(false);

      const audio = new Audio(track.audioUrl);
      audio.volume = volume;
      audio.preload = "metadata";

      const handleLoadedMetadata = () => {
        setDuration(audio.duration || 0);
        setIsLoading(false);
      };

      const handleTimeUpdate = () => {
        setCurrentTime(audio.currentTime);
      };

      const handleEnded = () => {
        if (repeatMode === "one") {
          audio.currentTime = 0;
          audio.play().catch((err) => {
            console.error("Error replaying track:", err);
            setError("Failed to replay track");
          });
        } else if (repeatMode === "all" || queue.length > 0) {
          playNext();
        } else {
          setIsPlaying(false);
          setCurrentTime(0);
        }
      };

      const handleError = (e: Event) => {
        console.error("Audio error:", e);
        setIsLoading(false);
        setIsPlaying(false);
        setError("Failed to load audio. Please try another track.");
      };

      const handleCanPlay = () => {
        setIsLoading(false);
      };

      audio.addEventListener("loadedmetadata", handleLoadedMetadata);
      audio.addEventListener("timeupdate", handleTimeUpdate);
      audio.addEventListener("ended", handleEnded);
      audio.addEventListener("error", handleError);
      audio.addEventListener("canplay", handleCanPlay);

      cleanupRef.current = () => {
        audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
        audio.removeEventListener("timeupdate", handleTimeUpdate);
        audio.removeEventListener("ended", handleEnded);
        audio.removeEventListener("error", handleError);
        audio.removeEventListener("canplay", handleCanPlay);
      };

      audioRef.current = audio;

      audio.play().catch((err) => {
        console.error("Error playing audio:", err);
        setIsLoading(false);
        setError("Failed to play audio. User interaction may be required.");
      });

      setIsPlaying(true);
    },
    [volume, repeatMode, queue, cleanupAudio]
  );

  const playSpotifyTrack = useCallback(
    async (track: Track) => {
      if (!track.spotifyUri) {
        setError("Spotify URI tapılmadı.");
        return;
      }

      const token = await getSpotifyAccessToken();
      if (!token) {
        setError("Spotify token tapılmadı. Yenidən giriş edin.");
        return;
      }

      if (!spotifyPlayerRef.current || !spotifyDeviceId || !isSpotifyReady) {
        setError("Spotify player hazır deyil. Bir neçə saniyə sonra yenidən cəhd edin.");
        return;
      }

      cleanupAudio();
      setError(null);
      setIsLoading(true);
      setPlaybackSource("spotify");
      setCurrentTrack(track);
      setDuration(track.duration || 0);
      setCurrentTime(0);

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      try {
        const transferResponse = await fetch("https://api.spotify.com/v1/me/player", {
          method: "PUT",
          headers,
          body: JSON.stringify({ device_ids: [spotifyDeviceId], play: false }),
        });

        if (!transferResponse.ok && transferResponse.status !== 204) {
          console.error("Spotify transfer playback error:", await transferResponse.text());
        }

        const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${spotifyDeviceId}`, {
          method: "PUT",
          headers,
          body: JSON.stringify({
            uris: [track.spotifyUri],
            position_ms: 0,
          }),
        });

        if (!response.ok) {
          if (response.status === 403) {
            setError("Spotify Premium hesabı tələb olunur.");
          } else if (response.status === 404) {
            setError("Spotify player tapılmadı. Safari/Chrome tab aktiv olmalıdır.");
          } else {
            setError("Spotify playback zamanı xəta baş verdi.");
          }
          throw new Error(`Spotify playback failed: ${response.status}`);
        }

        setIsPlaying(true);
      } catch (error) {
        console.error("Spotify playback error:", error);
        setIsPlaying(false);
      } finally {
        setIsLoading(false);
      }
    },
    [cleanupAudio, getSpotifyAccessToken, spotifyDeviceId, isSpotifyReady]
  );

  const playTrack = useCallback(
    async (track: Track) => {
      if (track.source === "spotify") {
        await playSpotifyTrack(track);
        return;
      }
      playHtmlTrack(track);
    },
    [playSpotifyTrack, playHtmlTrack]
  );

  const pauseTrack = useCallback(() => {
    if (playbackSource === "spotify" && spotifyPlayerRef.current) {
      spotifyPlayerRef.current.pause().catch((err: unknown) => {
        console.error("Spotify pause error:", err);
      });
      setIsPlaying(false);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [playbackSource]);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pauseTrack();
    } else {
      if (playbackSource === "spotify" && spotifyPlayerRef.current) {
        spotifyPlayerRef.current.togglePlay().catch((err: unknown) => {
          console.error("Spotify toggle error:", err);
          setError("Spotify playback bərpa olunmadı.");
        });
        return;
      }

      if (currentTrack && audioRef.current) {
        audioRef.current.play().catch((err) => {
          console.error("Error resuming playback:", err);
          setError("Failed to resume playback");
        });
        setIsPlaying(true);
      } else if (currentTrack) {
        void playTrack(currentTrack);
      }
    }
  }, [isPlaying, currentTrack, pauseTrack, playTrack, playbackSource]);

  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
    if (spotifyPlayerRef.current) {
      spotifyPlayerRef.current.setVolume(clampedVolume).catch(() => {});
    }
  }, []);

  const seekTo = useCallback((time: number) => {
    const clampedTime = Math.max(0, Math.min(duration, time));
    if (playbackSource === "spotify" && spotifyPlayerRef.current) {
      spotifyPlayerRef.current.seek(clampedTime * 1000).catch((err: unknown) => {
        console.error("Spotify seek error:", err);
      });
      return;
    }
    if (audioRef.current) {
      audioRef.current.currentTime = clampedTime;
      setCurrentTime(clampedTime);
    }
  }, [duration, playbackSource]);

  const shuffleQueue = useCallback((tracks: Track[]): Track[] => {
    const shuffled = [...tracks];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  const playNext = useCallback(() => {
    if (!currentTrack || queue.length === 0) return;

    const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
    if (currentIndex === -1) return;

    let nextIndex: number;
    if (isShuffled) {
      // In shuffle mode, pick random next track
      const remainingTracks = queue.filter((_, idx) => idx !== currentIndex);
      if (remainingTracks.length === 0) {
        if (repeatMode === "all") {
          nextIndex = Math.floor(Math.random() * queue.length);
        } else {
          return;
        }
      } else {
        const randomTrack = remainingTracks[Math.floor(Math.random() * remainingTracks.length)];
        nextIndex = queue.findIndex((t) => t.id === randomTrack.id);
      }
    } else {
      nextIndex = (currentIndex + 1) % queue.length;
    }

    void playTrack(queue[nextIndex]);
  }, [currentTrack, queue, isShuffled, repeatMode, playTrack]);

  const playPrevious = useCallback(() => {
    if (!currentTrack || queue.length === 0) return;

    const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
    if (currentIndex === -1) return;

    let prevIndex: number;
    if (isShuffled) {
      // In shuffle mode, pick random previous track
      const remainingTracks = queue.filter((_, idx) => idx !== currentIndex);
      if (remainingTracks.length === 0) {
        if (repeatMode === "all") {
          prevIndex = Math.floor(Math.random() * queue.length);
        } else {
          return;
        }
      } else {
        const randomTrack = remainingTracks[Math.floor(Math.random() * remainingTracks.length)];
        prevIndex = queue.findIndex((t) => t.id === randomTrack.id);
      }
    } else {
      prevIndex = currentIndex === 0 ? queue.length - 1 : currentIndex - 1;
    }

    void playTrack(queue[prevIndex]);
  }, [currentTrack, queue, isShuffled, repeatMode, playTrack]);

  const toggleRepeat = useCallback(() => {
    setRepeatMode((prev) => {
      if (prev === "off") return "all";
      if (prev === "all") return "one";
      return "off";
    });
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffled((prev) => {
      const newShuffled = !prev;
      if (newShuffled && queue.length > 0) {
        // Shuffle the queue
        const shuffled = shuffleQueue(queue);
        setQueue(shuffled);
      } else if (!newShuffled && originalQueue.length > 0) {
        // Restore original order
        setQueue(originalQueue);
      }
      return newShuffled;
    });
  }, [queue, originalQueue, shuffleQueue]);

  const setQueueWithShuffle = useCallback((tracks: Track[]) => {
    setOriginalQueue(tracks);
    if (isShuffled) {
      setQueue(shuffleQueue(tracks));
    } else {
      setQueue(tracks);
    }
  }, [isShuffled, shuffleQueue]);

  const toggleLike = useCallback((track: Track) => {
    // Optimistic update - immediately update UI
    setLikedTracks((prevLiked) => {
      const isLiked = prevLiked.some((t) => t.id === track.id);
      if (isLiked) {
        return prevLiked.filter((t) => t.id !== track.id);
      } else {
        return [...prevLiked, track];
      }
    });
    
    // Note: In a real app, you'd make an API call here and rollback on error
    // For now, localStorage persistence happens automatically via useEffect
  }, []);

  // Update audio volume when volume state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    playNextRef.current = playNext;
  }, [playNext]);

  useEffect(() => {
    playSpotifyTrackRef.current = playSpotifyTrack;
  }, [playSpotifyTrack]);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        volume,
        currentTime,
        duration,
        isLoading,
        error,
        repeatMode,
        isShuffled,
        playTrack,
        pauseTrack,
        togglePlayPause,
        setVolume,
        seekTo,
        playNext,
        playPrevious,
        toggleRepeat,
        toggleShuffle,
        queue,
        originalQueue,
        setQueue: setQueueWithShuffle,
        likedTracks,
        toggleLike,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}
