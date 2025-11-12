import { createContext, useContext, useState, useRef, ReactNode, useEffect } from "react";
import { Track } from "@/types";

// YENİ: LocalStorage üçün köməkçi funksiyalar
const getInitialLikedTracks = (): Track[] => {
  const savedTracks = localStorage.getItem("likedTracks");
  return savedTracks ? JSON.parse(savedTracks) : [];
};

const saveLikedTracks = (tracks: Track[]) => {
  localStorage.setItem("likedTracks", JSON.stringify(tracks));
};

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  playTrack: (track: Track) => void;
  pauseTrack: () => void;
  togglePlayPause: () => void;
  setVolume: (volume: number) => void;
  seekTo: (time: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  queue: Track[];
  setQueue: (tracks: Track[]) => void;
  
  // YENİ: "Like" funksiyası üçün state və funksiya
  likedTracks: Track[];
  toggleLike: (track: Track) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [queue, setQueue] = useState<Track[]>([]);
  
  // YENİ: "Like" state-i localStorage-dən ilkin dəyəri götürür
  const [likedTracks, setLikedTracks] = useState<Track[]>(getInitialLikedTracks);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // YENİ: Bəyənilən mahnılar dəyişdikdə localStorage-i yenilə
  useEffect(() => {
    saveLikedTracks(likedTracks);
  }, [likedTracks]);

  // YENİ: "Like" funksiyasının məntiqi
  const toggleLike = (track: Track) => {
    setLikedTracks((prevLiked) => {
      const isLiked = prevLiked.some((t) => t.id === track.id);
      if (isLiked) {
        // Mahnı artıq bəyənilibsə, siyahıdan çıxar
        return prevLiked.filter((t) => t.id !== track.id);
      } else {
        // Əks halda, siyahıya əlavə et
        return [...prevLiked, track];
      }
    });
  };

  const playTrack = (track: Track) => {
    // ... (mövcud playTrack kodunuz)
    // ... (mövcud playTrack kodunuz)
    if (audioRef.current) {
      audioRef.current.pause();
    }

    setCurrentTrack(track);
    setIsPlaying(true);

    const audio = new Audio(track.audioUrl);
    audio.volume = volume;
    
    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration);
    });
    audio.addEventListener("timeupdate", () => {
      setCurrentTime(audio.currentTime);
    });
    audio.addEventListener("ended", playNext);
    
    audio.play();
    audioRef.current = audio;
  };
  
  // ... (digər funksiyalarınız: pauseTrack, togglePlayPause, setVolume, seekTo, playNext, playPrevious)
  // ...
  // ... (Bu funksiyaları sizin faylınızdan kopyalayıb bura əlavə edin)
  // ... (Mən onları görə bilmədim, amma sizdə olduqlarını güman edirəm)
  // ... Nümunə olaraq əlavə edirəm:
  
  const pauseTrack = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      pauseTrack();
    } else {
      if (currentTrack && audioRef.current) {
        audioRef.current.play();
        setIsPlaying(true);
      } else {
        playTrack(currentTrack!);
      }
    }
  };

  const setVolume = (newVolume: number) => {
    setVolumeState(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const playNext = () => {
    if (!currentTrack || queue.length === 0) return;
    const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % queue.length;
    playTrack(queue[nextIndex]);
  };

  const playPrevious = () => {
    if (!currentTrack || queue.length === 0) return;
    const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
    const prevIndex = currentIndex === 0 ? queue.length - 1 : currentIndex - 1;
    playTrack(queue[prevIndex]);
  };


  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        volume,
        currentTime,
        duration,
        playTrack,
        pauseTrack,
        togglePlayPause,
        setVolume,
        seekTo,
        playNext,
        playPrevious,
        queue,
        setQueue,
        // YENİ: Context-ə əlavə edildi
        likedTracks,
        toggleLike,
      }}
    >
      {children}
      {/* Audio elementini birbaşa DOM-da saxlamaq daha stabildir */}
      {/* <audio ref={audioRef} /> */}
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