import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { Track } from "@/types";
import { getYoutubeAudioUrl } from "@/lib/youtube";
import { useToast } from "@/hooks/use-toast";

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  isLoading: boolean; // Yüklənmə statusu
  error: string | null;
  queue: Track[];
  likedTracks: Track[];
  repeatMode: "off" | "all" | "one";
  isShuffled: boolean;
  
  playTrack: (track: Track) => void;
  togglePlayPause: () => void;
  setVolume: (val: number) => void;
  seekTo: (time: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  setQueue: (tracks: Track[]) => void;
  toggleLike: (track: Track) => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queue, setQueueState] = useState<Track[]>([]);
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);
  const [repeatMode, setRepeatMode] = useState<"off" | "all" | "one">("off");
  const [isShuffled, setIsShuffled] = useState(false);
  const [originalQueue, setOriginalQueue] = useState<Track[]>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  // Audio elementini yaradırıq
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;
    }

    const audio = audioRef.current;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration || 0);
    const handleEnded = () => {
      if (repeatMode === "one") {
        audio.currentTime = 0;
        audio.play();
      } else {
        playNext();
      }
    };
    const handleCanPlay = () => setIsLoading(false); // Hazır olanda loading dayanır
    const handleError = () => {
      setIsLoading(false);
      console.error("Audio Error:", audio.error);
      // Avtomatik növbəti mahnıya keçmək olar
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("error", handleError);
    };
  }, [repeatMode]); // playNext asılılığına görə sonsuz dövrə düşməməsi üçün bura diqqət

  // Mahnını oynadan əsas funksiya
  const playTrack = async (track: Track) => {
    if (!track) return;

    // 1. DƏRHAL Player-i açırıq (URL hələ yoxdur)
    setCurrentTrack(track);
    setIsPlaying(true); 
    setIsLoading(true);
    setError(null);

    try {
      // 2. İndi URL-i axtarırıq (arxa planda)
      const url = await getYoutubeAudioUrl(track);

      if (!url) {
        throw new Error("Mahnı tapılmadı");
      }

      // Əgər istifadəçi bu vaxt ərzində başqa mahnıya keçməyibsə
      if (audioRef.current && currentTrack?.id === track.id) {
        audioRef.current.src = url;
        await audioRef.current.play();
      } else if (audioRef.current) {
        // Player dəyişməyib, sadəcə yeni URL yüklənir
        audioRef.current.src = url;
        await audioRef.current.play();
      }
    } catch (err) {
      console.error("Play error:", err);
      setIsLoading(false);
      setIsPlaying(false);
      toast({
        variant: "destructive",
        title: "Xəta",
        description: "Mahnını oxutmaq mümkün olmadı (iTunes-da tapılmadı).",
      });
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !currentTrack) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const setQueue = (tracks: Track[]) => {
    setQueueState(tracks);
    setOriginalQueue(tracks);
  };

  const playNext = () => {
    if (queue.length === 0 || !currentTrack) return;
    const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
    
    if (currentIndex < queue.length - 1) {
      playTrack(queue[currentIndex + 1]);
    } else if (repeatMode === "all") {
      playTrack(queue[0]); // Siyahı bitibsə başa qayıt
    } else {
      setIsPlaying(false);
    }
  };

  const playPrevious = () => {
    if (queue.length === 0 || !currentTrack) return;
    const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
    
    // Əgər mahnının 3-cü saniyəsindən çoxdursa, başa sarı
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }

    if (currentIndex > 0) {
      playTrack(queue[currentIndex - 1]);
    } else {
      playTrack(queue[queue.length - 1]); // Ən sona get
    }
  };

  const toggleShuffle = () => {
    if (isShuffled) {
      setQueueState([...originalQueue]);
    } else {
      const shuffled = [...queue].sort(() => Math.random() - 0.5);
      setQueueState(shuffled);
    }
    setIsShuffled(!isShuffled);
  };

  const toggleRepeat = () => {
    const modes: ("off" | "all" | "one")[] = ["off", "all", "one"];
    const nextIndex = (modes.indexOf(repeatMode) + 1) % modes.length;
    setRepeatMode(modes[nextIndex]);
  };

  const toggleLike = (track: Track) => {
    if (likedTracks.some((t) => t.id === track.id)) {
      setLikedTracks(likedTracks.filter((t) => t.id !== track.id));
    } else {
      setLikedTracks([...likedTracks, track]);
    }
  };

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
        queue,
        likedTracks,
        repeatMode,
        isShuffled,
        playTrack,
        togglePlayPause,
        setVolume: (val) => { setVolume(val); if (audioRef.current) audioRef.current.volume = val; },
        seekTo: (time) => { if (audioRef.current) audioRef.current.currentTime = time; setCurrentTime(time); },
        playNext,
        playPrevious,
        setQueue,
        toggleLike,
        toggleRepeat,
        toggleShuffle,
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