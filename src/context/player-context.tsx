// src/context/player-context.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Track } from "@/types";
import { storage } from "@/lib/storage";
import { getYoutubeId } from "@/lib/youtube"; // Youtube ID tapan funksiya

export type RepeatMode = "off" | "all" | "one";

interface PlayerContextType {
  // State (Vəziyyət)
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;       // 0 - 1 arası
  currentTime: number;  // cari saniyə
  duration: number;     // ümumi saniyə
  isBuffering: boolean;
  
  // Seek (İrəli/Geri çəkmə) üçün xüsusi siqnal
  seekToTime: number | null; 
  setSeekToTime: (time: number | null) => void;

  // Queue (Növbə)
  queue: Track[];
  isShuffled: boolean;
  repeatMode: RepeatMode;

  // Actions (Hərəkətlər)
  playTrack: (track: Track) => Promise<void>;
  pauseTrack: () => void;
  togglePlayPause: () => void;
  setVolume: (volume: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  
  // Player-dən gələn hesabatlar (ReactPlayer bura məlumat göndərir)
  handleSeek: (time: number) => void; // İstifadəçi slideri çəkəndə
  reportProgress: (playedSeconds: number, loadedSeconds?: number) => void;
  reportDuration: (duration: number) => void;
  reportEnded: () => void;

  // Likes
  likedTracks: Track[];
  toggleLike: (track: Track) => void;
  setQueue: (tracks: Track[]) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  // --- States ---
  const [currentTrack, setCurrentTrack] = useState<Track | null>(storage.getCurrentTrack());
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [seekToTime, setSeekToTime] = useState<number | null>(null);

  // Queue States
  const [queue, setQueueState] = useState<Track[]>([]);
  const [originalQueue, setOriginalQueue] = useState<Track[]>([]); // Shuffle bağlayanda geri qayıtmaq üçün
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");

  // Likes
  const [likedTracks, setLikedTracks] = useState<Track[]>(storage.getLikedTracks());

  // --- Effects ---
  // Liked tracks yaddaşa yaz
  useEffect(() => {
    storage.saveLikedTracks(likedTracks);
  }, [likedTracks]);

  // Cari mahnını yaddaşa yaz
  useEffect(() => {
    if (currentTrack) {
      storage.saveCurrentTrack(currentTrack);
    }
  }, [currentTrack]);

  // --- Main Logic ---

  // src/context/player-context.tsx faylının playTrack funksiyasını tapın və belə dəyişin:

// ... (yuxarıdakı kodlar eynidir)

const playTrack = async (track: Track) => {
  setIsPlaying(false);
  setIsBuffering(true);

  let trackToPlay = { ...track };

  // Əgər videoUrl yoxdursa, tapmağa çalışırıq
  if (!trackToPlay.videoUrl) {
    try {
      // 1. API vasitəsilə ID almağa çalış
      const videoId = await getYoutubeId(track);
      
      if (videoId) {
        // Əgər tapılsa, birbaşa link qoyuruq (Daha sürətlidir)
        trackToPlay.videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      } else {
         // 2. FALLBACK: Əgər API-lər işləməsə (CORS/502), ReactPlayer-in öz axtarışını işlət
         // Bu halda brauzer xəta versə də, musiqi çalınacaq.
         console.log("YouTube API xətası: 'ytsearch' rejiminə keçildi.");
         trackToPlay.videoUrl = `ytsearch:${track.artist} - ${track.title} audio`;
      }
    } catch (error) {
      // Hər ehtimala qarşı fallback
      trackToPlay.videoUrl = `ytsearch:${track.artist} - ${track.title} audio`;
    }
  }

  setCurrentTrack(trackToPlay);
  // isBuffering-i ReactPlayer özü onReady olanda false edəcək, amma biz burada da edə bilərik
  // setIsBuffering(false); 
  setIsPlaying(true);
};

// ... (aşağıdakı kodlar eynidir)
  const pauseTrack = () => setIsPlaying(false);
  
  const togglePlayPause = () => setIsPlaying((prev) => !prev);

  const setVolume = (val: number) => setVolumeState(val);

  // --- Queue Logic (Next/Prev) ---

  const playNext = useCallback(() => {
    if (!currentTrack || queue.length === 0) return;

    // "One" rejimi: eyni mahnını başa sar
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
      // Queue bitdi
      if (repeatMode === "all") {
        playTrack(queue[0]); // Başa qayıt
      } else {
        setIsPlaying(false); // Dayan
      }
    }
  }, [currentTrack, queue, repeatMode]);

  const playPrevious = useCallback(() => {
    if (!currentTrack || queue.length === 0) return;

    // Əgər mahnının 3-cü saniyəsindən çoxdursa, mahnını başa sar
    if (currentTime > 3) {
      setSeekToTime(0);
      return;
    }

    const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
    const prevIndex = currentIndex - 1;

    if (prevIndex >= 0) {
      playTrack(queue[prevIndex]);
    } else {
      // Siyahının əvvəlindəyik
      playTrack(queue[queue.length - 1]); // Sonuncuya get (və ya dayandır)
    }
  }, [currentTrack, queue, currentTime]);

  // --- Shuffle & Repeat ---

  const toggleRepeat = () => {
    setRepeatMode((prev) => (prev === "off" ? "all" : prev === "all" ? "one" : "off"));
  };

  const setQueue = useCallback((newQueue: Track[]) => {
    setOriginalQueue(newQueue);
    if (isShuffled) {
      // Shuffle varsa qarışdıraraq əlavə et
      setQueueState([...newQueue].sort(() => Math.random() - 0.5));
    } else {
      setQueueState(newQueue);
    }
  }, [isShuffled]);

  const toggleShuffle = () => {
    setIsShuffled((prev) => !prev);
  };

  // Shuffle dəyişəndə queue-nu yenilə
  useEffect(() => {
    if (isShuffled) {
      setQueueState((prev) => [...prev].sort(() => Math.random() - 0.5));
    } else {
      setQueueState(originalQueue);
    }
  }, [isShuffled, originalQueue]);


  // --- Player Reports (From ReactPlayer to Context) ---
  
  // UI-dan (Sliderdən) gələn seek əmri
  const handleSeek = (time: number) => {
    setCurrentTime(time);
    setSeekToTime(time); // Player.tsx bunu görüb videonu çəkəcək
  };

  // ReactPlayer hər saniyə bunu çağırır
  const reportProgress = (playedSeconds: number, loadedSeconds: number = 0) => {
    setCurrentTime(playedSeconds);
  };

  const reportDuration = (dur: number) => {
    setDuration(dur);
  };

  const reportEnded = () => {
    playNext();
  };

  // --- Likes ---
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
