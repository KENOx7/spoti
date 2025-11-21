import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { Track } from "@/types";
import { getYoutubeVideoId } from "@/lib/youtube";
import { storage } from "@/lib/storage";

export type RepeatMode = "off" | "all" | "one";

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  youtubeUrl: string | null; // YENİ: YouTube URL-i saxlayır
  volume: number;
  repeatMode: RepeatMode;
  isShuffled: boolean;
  isLoading: boolean;
  playTrack: (track: Track) => void;
  togglePlayPause: () => void;
  setVolume: (val: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  setIsPlaying: (val: boolean) => void;
  queue: Track[];
  setQueue: (tracks: Track[]) => void;
  likedTracks: Track[];
  toggleLike: (track: Track) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(storage.getCurrentTrack());
  const [youtubeUrl, setYoutubeUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.5);
  const [isLoading, setIsLoading] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");
  const [isShuffled, setIsShuffled] = useState(false);
  const [queue, setQueue] = useState<Track[]>([]);
  const [likedTracks, setLikedTracks] = useState<Track[]>(storage.getLikedTracks());

  // Mahnı oxutma funksiyası
  const playTrack = async (track: Track) => {
    setIsPlaying(false);
    setCurrentTrack(track);
    setIsLoading(true);
    setYoutubeUrl(null); // Əvvəlki URL-i sıfırla

    // YouTube ID tapırıq
    const url = await getYoutubeVideoId(track);
    
    if (url) {
      setYoutubeUrl(url);
      setIsPlaying(true);
    } else {
      console.error("Video tapılmadı");
      // Avtomatik növbətiyə keçmək olar
    }
    setIsLoading(false);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const playNext = useCallback(() => {
    if (!currentTrack || queue.length === 0) return;
    const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
    if (currentIndex < queue.length - 1) {
      playTrack(queue[currentIndex + 1]);
    }
  }, [currentTrack, queue]);

  const playPrevious = useCallback(() => {
    if (!currentTrack || queue.length === 0) return;
    const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
    if (currentIndex > 0) {
      playTrack(queue[currentIndex - 1]);
    }
  }, [currentTrack, queue]);

  const toggleRepeat = () => setRepeatMode((p) => (p === "off" ? "all" : p === "all" ? "one" : "off"));
  const toggleShuffle = () => setIsShuffled(!isShuffled);
  
  const toggleLike = (track: Track) => {
    setLikedTracks((prev) => {
      const exists = prev.find((t) => t.id === track.id);
      if (exists) return prev.filter((t) => t.id !== track.id);
      return [...prev, track];
    });
  };

  useEffect(() => {
    storage.saveLikedTracks(likedTracks);
  }, [likedTracks]);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        youtubeUrl,
        volume,
        repeatMode,
        isShuffled,
        isLoading,
        playTrack,
        togglePlayPause,
        setVolume: setVolumeState,
        playNext,
        playPrevious,
        toggleRepeat,
        toggleShuffle,
        setIsPlaying,
        queue,
        setQueue,
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
  if (!context) throw new Error("usePlayer must be used within a PlayerProvider");
  return context;
}
