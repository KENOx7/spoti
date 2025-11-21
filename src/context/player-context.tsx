import { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import { Track } from "@/types";
import { storage } from "@/lib/storage";
import { getYoutubeAudioUrl } from "@/lib/youtube"; // YENİ: YouTube funksiyası

export type RepeatMode = "off" | "all" | "one";

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  isLoading: boolean;
  isLoadingStream: boolean; // YENİ: YouTube axtarışı statusu
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

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(storage.getCurrentTrack());
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(storage.getVolume());
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStream, setIsLoadingStream] = useState(false); // YENİ
  const [error, setError] = useState<string | null>(null);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");
  const [isShuffled, setIsShuffled] = useState(false);
  const [queue, setQueueState] = useState<Track[]>([]);
  const [originalQueue, setOriginalQueue] = useState<Track[]>([]);
  const [likedTracks, setLikedTracks] = useState<Track[]>(storage.getLikedTracks());

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Audio Elementini Yaradılması
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume;

    // Event Listeners
    const audio = audioRef.current;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (repeatMode === "one") {
        audio.currentTime = 0;
        audio.play();
      } else {
        playNext();
      }
    };
    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleError = () => {
      setIsLoading(false);
      setError("Mahnı oxunarkən xəta baş verdi.");
      // Xəta olanda növbəti mahnıya keç (opsional)
      // setTimeout(() => playNext(), 2000); 
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("error", handleError);
      audio.pause();
    };
  }, [repeatMode]); // repeatMode asılılığı vacibdir

  // Storage Updates
  useEffect(() => {
    storage.saveCurrentTrack(currentTrack);
  }, [currentTrack]);

  useEffect(() => {
    storage.saveVolume(volume);
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    storage.saveLikedTracks(likedTracks);
  }, [likedTracks]);

  // --- PLAY TRACK (AĞILLI VERSİYA) ---
  const playTrack = async (track: Track) => {
    setError(null);
    setCurrentTrack(track);
    setIsPlaying(false); // Keçid zamanı dayandır

    if (!audioRef.current) return;

    // 1. Əgər mahnının linki varsa, dərhal oxu
    if (track.audioUrl && track.audioUrl !== "") {
      try {
        audioRef.current.src = track.audioUrl;
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        console.error("Play error:", err);
        setError("Oynatma xətası");
      }
    } 
    // 2. Əgər link yoxdursa, YouTube-dan axtar
    else {
      setIsLoadingStream(true);
      const ytUrl = await getYoutubeAudioUrl(track);
      
      if (ytUrl) {
        // Tapılan linki yadda saxla ki, növbəti dəfə axtarmasın
        track.audioUrl = ytUrl; 
        
        // Yoxla: İstifadəçi hələ də eyni mahnıdırmı?
        // (AudioRef-i yoxlamaq vacibdir)
        if (audioRef.current) {
           audioRef.current.src = ytUrl;
           try {
             await audioRef.current.play();
             setIsPlaying(true);
           } catch (err) {
             console.error("YouTube Play error:", err);
             setError("YouTube mənbəyi oxuna bilmədi");
           }
        }
      } else {
        setError("Musiqi mənbəyi tapılmadı");
      }
      setIsLoadingStream(false);
    }
  };

  const pauseTrack = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const setVolume = (val: number) => setVolumeState(val);

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const playNext = useCallback(() => {
    if (!currentTrack || queue.length === 0) return;
    const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
    
    // Əgər siyahının sonudursa və repeat all seçilibsə, başa qayıt
    if (currentIndex === queue.length - 1) {
        if (repeatMode === "all") {
            playTrack(queue[0]);
        } else {
            setIsPlaying(false); // Siyahı bitdi
        }
    } else {
        playTrack(queue[currentIndex + 1]);
    }
  }, [currentTrack, queue, repeatMode]);

  const playPrevious = useCallback(() => {
    if (!currentTrack || queue.length === 0) return;
    const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
    
    // Əgər mahnının 3-cü saniyəsindən çox keçibsə, başa qaytar
    if (currentTime > 3 && audioRef.current) {
        audioRef.current.currentTime = 0;
        return;
    }

    if (currentIndex > 0) {
      playTrack(queue[currentIndex - 1]);
    } else {
        // İlk mahnıdırsa, sadəcə başa sarı
        if (audioRef.current) audioRef.current.currentTime = 0;
    }
  }, [currentTrack, queue, currentTime]);

  const toggleRepeat = () => {
    setRepeatMode((prev) => (prev === "off" ? "all" : prev === "all" ? "one" : "off"));
  };

  const toggleShuffle = () => {
    setIsShuffled(!isShuffled);
  };

  // Queue Management (Shuffle məntiqi)
  const setQueueWithShuffle = useCallback((newQueue: Track[]) => {
    setOriginalQueue(newQueue);
    if (isShuffled) {
      const shuffled = [...newQueue].sort(() => Math.random() - 0.5);
      setQueueState(shuffled);
    } else {
      setQueueState(newQueue);
    }
  }, [isShuffled]);

  useEffect(() => {
    if (isShuffled) {
      const shuffled = [...originalQueue].sort(() => Math.random() - 0.5);
      setQueueState(shuffled);
    } else {
      setQueueState(originalQueue);
    }
  }, [isShuffled, originalQueue]);

  const toggleLike = useCallback((track: Track) => {
    setLikedTracks((prevLiked) => {
      const isLiked = prevLiked.some((t) => t.id === track.id);
      if (isLiked) {
        return prevLiked.filter((t) => t.id !== track.id);
      } else {
        return [...prevLiked, { ...track, liked: true }];
      }
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
        isLoading,
        isLoadingStream, // YENİ: Export edirik
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