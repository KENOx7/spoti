// src/context/player-context.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Track } from "@/types";
import { storage } from "@/lib/storage";

export type RepeatMode = "off" | "all" | "one";

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  isBuffering: boolean;
  seekToTime: number | null; 
  setSeekToTime: (time: number | null) => void;
  queue: Track[];
  isShuffled: boolean;
  repeatMode: RepeatMode;
  playTrack: (track: Track) => void;
  pauseTrack: () => void;
  togglePlayPause: () => void;
  setVolume: (volume: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  handleSeek: (time: number) => void;
  reportProgress: (playedSeconds: number, loadedSeconds?: number) => void;
  reportDuration: (duration: number) => void;
  reportEnded: () => void;
  reportReady: () => void; // Yeni: Player hazır olanda
  likedTracks: Track[];
  toggleLike: (track: Track) => void;
  setQueue: (tracks: Track[]) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(storage.getCurrentTrack());
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.5); // Səs səviyyəsi standart 50%
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [seekToTime, setSeekToTime] = useState<number | null>(null);

  const [queue, setQueueState] = useState<Track[]>([]);
  const [originalQueue, setOriginalQueue] = useState<Track[]>([]);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");
  const [likedTracks, setLikedTracks] = useState<Track[]>(storage.getLikedTracks());

  useEffect(() => {
    storage.saveLikedTracks(likedTracks);
  }, [likedTracks]);

  useEffect(() => {
    if (currentTrack) {
      storage.saveCurrentTrack(currentTrack);
    }
  }, [currentTrack]);

  // --- PLAY MƏNTİQİ (SADƏLƏŞDİRİLMİŞ) ---
  const playTrack = (track: Track) => {
    setIsPlaying(false); // Keçid edərkən qısa fasilə
    setIsBuffering(true); // Yüklənir işarəsini göstər

    // LAST.FM METODU:
    // API axtarışı yoxdur. Birbaşa "ytsearch:" əmrini formalaşdırırıq.
    // ReactPlayer bunu görəndə avtomatik arxa planda YouTube-da axtarır və ilkinə play basır.
    const searchCommand = `ytsearch:${track.artist} - ${track.title} official audio`;
    
    const trackToPlay = {
        ...track,
        videoUrl: searchCommand
    };

    setCurrentTrack(trackToPlay);
    // isPlaying dərhal true etmirik, "reportReady" gözləyirik (aşağıda)
  };

  const reportReady = () => {
    setIsBuffering(false);
    setIsPlaying(true);
  };

  const pauseTrack = () => setIsPlaying(false);
  
  const togglePlayPause = () => setIsPlaying((prev) => !prev);

  const setVolume = (val: number) => setVolumeState(val);

  const playNext = useCallback(() => {
    if (!currentTrack || queue.length === 0) return;
    if (repeatMode === "one") {
      setSeekToTime(0);
      setIsPlaying(true);
      return;
    }
    const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
    const nextIndex = currentIndex + 1;
    if (nextIndex < queue.length) {
      playTrack(queue[nextIndex]);
    } else {
      if (repeatMode === "all") {
        playTrack(queue[0]);
      } else {
        setIsPlaying(false);
      }
    }
  }, [currentTrack, queue, repeatMode]);

  const playPrevious = useCallback(() => {
    if (!currentTrack || queue.length === 0) return;
    if (currentTime > 3) {
      setSeekToTime(0);
      return;
    }
    const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      playTrack(queue[prevIndex]);
    } else {
      playTrack(queue[queue.length - 1]);
    }
  }, [currentTrack, queue, currentTime]);

  const toggleRepeat = () => {
    setRepeatMode((prev) => (prev === "off" ? "all" : prev === "all" ? "one" : "off"));
  };

  const setQueue = useCallback((newQueue: Track[]) => {
    setOriginalQueue(newQueue);
    if (isShuffled) {
      setQueueState([...newQueue].sort(() => Math.random() - 0.5));
    } else {
      setQueueState(newQueue);
    }
  }, [isShuffled]);

  const toggleShuffle = () => {
    setIsShuffled((prev) => !prev);
  };

  useEffect(() => {
    if (isShuffled) {
      setQueueState((prev) => [...prev].sort(() => Math.random() - 0.5));
    } else {
      setQueueState(originalQueue);
    }
  }, [isShuffled, originalQueue]);

  const handleSeek = (time: number) => {
    setCurrentTime(time);
    setSeekToTime(time);
  };

  const reportProgress = (playedSeconds: number, loadedSeconds: number = 0) => {
    setCurrentTime(playedSeconds);
  };

  const reportDuration = (dur: number) => {
    setDuration(dur);
  };

  const reportEnded = () => {
    playNext();
  };

  const toggleLike = useCallback((track: Track) => {
    setLikedTracks((prev) => {
      const exists = prev.some((t) => t.id === track.id);
      return exists 
        ? prev.filter((t) => t.id !== track.id)
        : [...prev, { ...track, liked: true }];
    });
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        volume,
        currentTime,
        duration,
        isBuffering,
        seekToTime,
        setSeekToTime,
        queue,
        isShuffled,
        repeatMode,
        playTrack,
        pauseTrack,
        togglePlayPause,
        setVolume,
        playNext,
        playPrevious,
        toggleShuffle,
        toggleRepeat,
        handleSeek,
        reportProgress,
        reportDuration,
        reportEnded,
        reportReady,
        likedTracks,
        toggleLike,
        setQueue
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}
