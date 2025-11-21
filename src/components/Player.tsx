// src/components/Player.tsx
import { usePlayer } from "@/context/player-context";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, Shuffle, Repeat, Repeat1, Loader2, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Track } from "@/types"; 
import { cn } from "@/lib/utils"; 

export function Player() {
  const {
    currentTrack,
    isPlaying,
    volume,
    currentTime,
    duration,
    isLoading,
    isLoadingStream,
    repeatMode,
    isShuffled,
    togglePlayPause,
    setVolume,
    seekTo,
    playNext,
    playPrevious,
    toggleRepeat,
    toggleShuffle,
    likedTracks, 
    toggleLike, 
  } = usePlayer();

  const [localTime, setLocalTime] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  // Progress Bar Məntiqi
  useEffect(() => {
    if (!isSeeking) {
      setLocalTime(currentTime);
    }
  }, [currentTime, isSeeking]);

  const handleSeek = (value: number[]) => {
    setLocalTime(value[0]);
    setIsSeeking(true);
  };

  const handleSeekCommit = (value: number[]) => {
    seekTo(value[0]);
    setIsSeeking(false);
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!currentTrack) return null;

  const isLiked = likedTracks.some((t: Track) => t.id === currentTrack.id);
  const isBuffering = isLoading || isLoadingStream;

  return (
    // DÜZƏLİŞ: padding azaldıldı, hündürlük tənzimləndi
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl border-t border-white/10 z-50 pb-[env(safe-area-inset-bottom)]">
      
      {/* Mobil üçün Progress Bar (Ən üstdə, nazik xətt) */}
      <div className="sm:hidden w-full h-1 bg-secondary absolute top-0 left-0">
         <div 
            className="h-full bg-primary transition-all duration-100" 
            style={{ width: `${(localTime / (duration || 1)) * 100}%` }}
         />
      </div>

      <div className="max-w-screen-2xl mx-auto flex items-center justify-between px-3 py-2 sm:px-4 sm:py-3 h-16 sm:h-20 gap-2">
        
        {/* 1. SOL TƏRƏF: Mahnı Məlumatı */}
        {/* min-w-0 vacibdir ki, mətn daşmasın */}
        <div className="flex items-center gap-3 flex-1 min-w-0 mr-2">
          <div className="relative group shrink-0">
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className={cn(
                "h-10 w-10 sm:h-14 sm:w-14 rounded-md object-cover shadow-md",
                isPlaying && !isBuffering ? "animate-pulse-slow" : ""
              )}
            />
          </div>
          <div className="min-w-0 flex-col flex justify-center overflow-hidden">
            <h3 className="font-semibold text-sm truncate leading-tight text-foreground">
              {currentTrack.title}
            </h3>
            <p className="text-xs text-muted-foreground truncate">
              {currentTrack.artist}
            </p>
          </div>
        </div>

        {/* 2. MƏRKƏZ: İdarəetmə (Desktopda mərkəzdə, Mobildə sağda) */}
        <div className="flex items-center gap-2 sm:absolute sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:flex-col sm:w-auto">
          
          {/* Düymələr Qrupu */}
          <div className="flex items-center gap-1 sm:gap-4">
            {/* Shuffle & Previous - Yalnız Desktop */}
            <Button variant="ghost" size="icon" onClick={toggleShuffle} className={cn("hidden sm:flex h-8 w-8", isShuffled && "text-primary")}>
              <Shuffle className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={playPrevious} className="hidden sm:flex h-8 w-8 text-foreground/80 hover:text-foreground">
              <SkipBack className="h-5 w-5 fill-current" />
            </Button>

            {/* Play/Pause - Həmişə Görünür */}
            <Button
              size="icon"
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-full shadow-sm bg-primary text-primary-foreground hover:scale-105 transition-transform"
              onClick={togglePlayPause}
              disabled={isBuffering}
            >
              {isBuffering ? (
                <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
              ) : isPlaying ? (
                <Pause className="h-4 w-4 sm:h-5 sm:w-5 fill-current" />
              ) : (
                <Play className="h-4 w-4 sm:h-5 sm:w-5 fill-current ml-0.5" />
              )}
            </Button>

            {/* Next - Həmişə Görünür (Mobildə Play yanındadır) */}
             <Button variant="ghost" size="icon" onClick={playNext} className="flex sm:hidden h-9 w-9 text-foreground/80">
              <SkipForward className="h-5 w-5 fill-current" />
            </Button>
             <Button variant="ghost" size="icon" onClick={playNext} className="hidden sm:flex h-8 w-8 text-foreground/80 hover:text-foreground">
              <SkipForward className="h-5 w-5 fill-current" />
            </Button>

            {/* Repeat - Yalnız Desktop */}
            <Button variant="ghost" size="icon" onClick={toggleRepeat} className={cn("hidden sm:flex h-8 w-8", repeatMode !== "off" && "text-primary")}>
              {repeatMode === "one" ? <Repeat1 className="h-4 w-4" /> : <Repeat className="h-4 w-4" />}
            </Button>
          </div>

          {/* Desktop Progress Bar */}
          <div className="hidden sm:flex items-center gap-2 w-80 md:w-96 mt-1">
            <span className="text-[10px] text-muted-foreground w-8 text-right">{formatTime(localTime)}</span>
            <Slider
              value={[localTime]}
              max={duration || 100}
              step={1}
              className="flex-1 cursor-pointer h-1.5"
              onValueChange={handleSeek}
              onValueCommit={handleSeekCommit}
            />
            <span className="text-[10px] text-muted-foreground w-8">{formatTime(duration)}</span>
          </div>
        </div>

        {/* 3. SAĞ TƏRƏF: Səs və Like */}
        <div className="flex items-center justify-end gap-2 sm:w-1/3 pl-2">
            {/* Like Button (Həm mobil, həm desktop) */}
            <Button
                variant="ghost"
                size="icon"
                className={cn("h-9 w-9", isLiked ? "text-primary" : "text-muted-foreground")}
                onClick={() => toggleLike(currentTrack)}
            >
                <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
            </Button>
            
            {/* Volume - Yalnız Desktop */}
            <div className="hidden sm:flex items-center gap-2 w-24 ml-2">
                <Volume2 className="h-4 w-4 text-muted-foreground" />
                <Slider
                value={[volume * 100]}
                max={100}
                step={1}
                className="flex-1"
                onValueChange={([value]) => setVolume(value / 100)}
                />
            </div>
        </div>

      </div>
    </div>
  );
}
