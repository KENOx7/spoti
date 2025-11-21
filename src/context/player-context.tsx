import { createContext, useContext, useState, useRef, ReactNode, useEffect, useCallback } from "react";
import { Track } from "@/types";
import { storage } from "@/lib/storage";
import { useAuth } from "./auth-context";

const SPOTIFY_API_BASE = "https://api.spotify.com/v1";
let spotifySDKPromise: Promise<void> | null = null;

const loadSpotifySDK = (): Promise<void> => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Spotify SDK only works in the browser"));
  }

  if (window.Spotify) {
    return Promise.resolve();
  }

  if (spotifySDKPromise) {
    return spotifySDKPromise;
  }

  spotifySDKPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById("spotify-player-sdk");
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", (event) => reject(event), { once: true });
      return;
    }

    window.onSpotifyWebPlaybackSDKReady = () => {
      resolve();
      window.onSpotifyWebPlaybackSDKReady = undefined;
    };

    const script = document.createElement("script");
    script.id = "spotify-player-sdk";
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    script.onerror = (event) => reject(event);
    document.body.appendChild(script);
  });

  return spotifySDKPromise;
};

export type RepeatMode = "off" | "all" | "one";

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
  const { session } = useAuth();
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
  const [spotifyDeviceId, setSpotifyDeviceId] = useState<string | null>(null);
  const [isSpotifyReady, setIsSpotifyReady] = useState(false);
  const [isUsingSpotifyPlayback, setIsUsingSpotifyPlayback] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const spotifyPlayerRef = useRef<any>(null);
  const spotifyTokenRef = useRef<string | null>(null);
  const isUsingSpotifyRef = useRef(false);

  useEffect(() => {
    spotifyTokenRef.current = session?.provider_token ?? null;
  }, [session?.provider_token]);

  useEffect(() => {
    isUsingSpotifyRef.current = isUsingSpotifyPlayback;
  }, [isUsingSpotifyPlayback]);

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
    };
  }, []);

  // Save liked tracks to localStorage
  useEffect(() => {
    storage.saveLikedTracks(likedTracks);
  }, [likedTracks]);

  // Save volume to localStorage
  useEffect(() => {
    storage.saveVolume(volume);
  }, [volume]);

  // Save queue to localStorage
  useEffect(() => {
    if (queue.length > 0) {
      storage.saveQueue(queue);
    }
  }, [queue]);

  // Save current track to localStorage
  useEffect(() => {
    storage.saveCurrentTrack(currentTrack);
  }, [currentTrack]);

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

  const cleanupSpotifyPlayer = useCallback(() => {
    if (spotifyPlayerRef.current) {
      spotifyPlayerRef.current.removeListener?.("player_state_changed");
      spotifyPlayerRef.current.disconnect();
      spotifyPlayerRef.current = null;
    }
    setSpotifyDeviceId(null);
    setIsSpotifyReady(false);
    setIsUsingSpotifyPlayback(false);
    isUsingSpotifyRef.current = false;
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const initSpotifyPlayer = async () => {
      if (!spotifyTokenRef.current) {
        cleanupSpotifyPlayer();
        return;
      }

      try {
        await loadSpotifySDK();
        if (isCancelled || !window.Spotify) return;

        if (spotifyPlayerRef.current) {
          spotifyPlayerRef.current.disconnect();
          spotifyPlayerRef.current = null;
        }

        const player = new window.Spotify.Player({
          name: "Spoti Web Player",
          getOAuthToken: (cb: (token: string) => void) => {
            if (spotifyTokenRef.current) {
              cb(spotifyTokenRef.current);
            }
          },
        });

        const handleStateChange = (state: any) => {
          if (!state || !isUsingSpotifyRef.current) return;
          setCurrentTime((state.position || 0) / 1000);
          setDuration((state.duration || 0) / 1000);
          setIsPlaying(!state.paused);
        };

        player.addListener("ready", ({ device_id }: { device_id: string }) => {
          if (isCancelled) return;
          setSpotifyDeviceId(device_id);
          setIsSpotifyReady(true);
        });

        player.addListener("not_ready", () => {
          if (isCancelled) return;
          setIsSpotifyReady(false);
        });

        player.addListener("player_state_changed", handleStateChange);
        player.addListener("authentication_error", ({ message }: { message: string }) => {
          console.error("Spotify auth error:", message);
          setError("Spotify auth error. Please login again.");
          setIsSpotifyReady(false);
        });
        player.addListener("initialization_error", ({ message }: { message: string }) => {
          console.error("Spotify init error:", message);
          setError("Spotify player initialization failed.");
        });
        player.addListener("account_error", ({ message }: { message: string }) => {
          console.error("Spotify account error:", message);
          setError("Spotify Premium account is required for playback.");
        });
        player.addListener("playback_error", ({ message }: { message: string }) => {
          console.error("Spotify playback error:", message);
          setError("Spotify playback error. Try again.");
        });

        const connected = await player.connect();
        if (!connected) {
          console.error("Failed to connect Spotify player");
          setError("Spotify player could not connect. Refresh the page.");
          return;
        }

        spotifyPlayerRef.current = player;
      } catch (error) {
        console.error("Spotify SDK init error:", error);
        setError("Failed to initialize Spotify playback. Refresh and try again.");
      }
    };

    initSpotifyPlayer();

    return () => {
      isCancelled = true;
      cleanupSpotifyPlayer();
    };
  }, [cleanupSpotifyPlayer, session?.provider_token]);

  const spotifyApiFetch = useCallback(
    async (path: string, init?: RequestInit) => {
      if (!session?.provider_token) {
        throw new Error("Spotify token not found. Please login again.");
      }

      const response = await fetch(`${SPOTIFY_API_BASE}${path}`, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.provider_token}`,
          ...(init?.headers || {}),
        },
      });

      if (response.status === 401) {
        throw new Error("Spotify token expired. Please login again.");
      }

      return response;
    },
    [session?.provider_token]
  );

  const playTrack = useCallback(
    async (track: Track) => {
      if (!track) {
        setError("Track not found.");
        return;
      }

      cleanupAudio();
      setError(null);
      setIsLoading(true);

      const canUseSpotify =
        Boolean(
          track.spotifyUri &&
            spotifyDeviceId &&
            spotifyPlayerRef.current &&
            session?.provider_token &&
            isSpotifyReady
        );

      if (canUseSpotify) {
        setIsUsingSpotifyPlayback(true);
        try {
          if (spotifyPlayerRef.current?.activateElement) {
            await spotifyPlayerRef.current.activateElement();
          }
          const response = await spotifyApiFetch(
            `/me/player/play?device_id=${spotifyDeviceId}`,
            {
              method: "PUT",
              body: JSON.stringify({ uris: [track.spotifyUri] }),
            }
          );

          if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            throw new Error(errorBody?.error?.message || "Spotify playback failed.");
          }

          setCurrentTrack(track);
          setDuration(track.duration);
          setCurrentTime(0);
          setIsPlaying(true);
          setIsLoading(false);
          return;
        } catch (error) {
          console.error("Spotify playback error:", error);
          setError(
            error instanceof Error
              ? error.message
              : "Spotify playback failed. Premium account required."
          );
          setIsUsingSpotifyPlayback(false);
          isUsingSpotifyRef.current = false;
          setIsLoading(false);
          if (!track.audioUrl) {
            return;
          }
        }
      }

      setIsUsingSpotifyPlayback(false);
      isUsingSpotifyRef.current = false;

      if (!track.audioUrl) {
        setIsLoading(false);
        setError("This track has no preview URL available.");
        return;
      }

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
          void playNext();
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
    [
      cleanupAudio,
      spotifyDeviceId,
      session?.provider_token,
      isSpotifyReady,
      spotifyApiFetch,
      volume,
      repeatMode,
      queue,
      playNext,
    ]
  );

  const pauseTrack = useCallback(() => {
    if (isUsingSpotifyPlayback) {
      spotifyApiFetch("/me/player/pause", { method: "PUT" }).catch((error) => {
        console.error("Spotify pause error:", error);
      });
      setIsPlaying(false);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [isUsingSpotifyPlayback, spotifyApiFetch]);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pauseTrack();
      return;
    }

    if (isUsingSpotifyPlayback && currentTrack?.spotifyUri) {
      const deviceQuery = spotifyDeviceId ? `?device_id=${spotifyDeviceId}` : "";
      setIsLoading(true);
      spotifyApiFetch(`/me/player/play${deviceQuery}`, { method: "PUT" })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Spotify resume failed");
          }
          setIsPlaying(true);
        })
        .catch((error) => {
          console.error("Spotify resume error:", error);
          setError("Failed to resume Spotify playback. Try pressing Play again.");
        })
        .finally(() => setIsLoading(false));
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
  }, [
    isPlaying,
    pauseTrack,
    isUsingSpotifyPlayback,
    currentTrack,
    spotifyDeviceId,
    spotifyApiFetch,
    playTrack,
  ]);

  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
    if (spotifyPlayerRef.current) {
      spotifyPlayerRef.current.setVolume(clampedVolume).catch((error: any) => {
        console.error("Spotify volume error:", error);
      });
    }
  }, []);

  const seekTo = useCallback(
    (time: number) => {
      const clampedTime = Math.max(0, Math.min(duration, time));
      if (isUsingSpotifyPlayback) {
        const positionMs = Math.floor(clampedTime * 1000);
        spotifyApiFetch(`/me/player/seek?position_ms=${positionMs}`, { method: "PUT" }).catch(
          (error) => {
            console.error("Spotify seek error:", error);
            setError("Failed to seek on Spotify player.");
          }
        );
        setCurrentTime(clampedTime);
        return;
      }

      if (audioRef.current) {
        audioRef.current.currentTime = clampedTime;
        setCurrentTime(clampedTime);
      }
    },
    [duration, isUsingSpotifyPlayback, spotifyApiFetch]
  );

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

    if (spotifyPlayerRef.current) {
      spotifyPlayerRef.current.setVolume(volume).catch((error: any) => {
        console.error("Spotify volume sync error:", error);
      });
    }
  }, [volume]);

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
