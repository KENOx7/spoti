import { createContext, useContext, useState, useRef, ReactNode, useEffect, useCallback } from "react";
import { Track } from "@/types";
import { storage } from "@/lib/storage";

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
  playTrack: (track: Track) => void;
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

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

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

  const playTrack = useCallback((track: Track) => {
    if (!track || !track.audioUrl) {
      setError("Invalid track or audio URL");
      return;
    }

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

    // Store cleanup function
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
  }, [volume, repeatMode, queue, cleanupAudio]);

  const pauseTrack = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pauseTrack();
    } else {
      if (currentTrack && audioRef.current) {
        audioRef.current.play().catch((err) => {
          console.error("Error resuming playback:", err);
          setError("Failed to resume playback");
        });
        setIsPlaying(true);
      } else if (currentTrack) {
        playTrack(currentTrack);
      }
    }
  }, [isPlaying, currentTrack, pauseTrack, playTrack]);

  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
  }, []);

  const seekTo = useCallback((time: number) => {
    if (audioRef.current) {
      const clampedTime = Math.max(0, Math.min(duration, time));
      audioRef.current.currentTime = clampedTime;
      setCurrentTime(clampedTime);
    }
  }, [duration]);

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

    playTrack(queue[nextIndex]);
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

    playTrack(queue[prevIndex]);
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
