// src/components/Player.tsx
import { usePlayer } from "@/context/player-context";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, Shuffle, Repeat, Repeat1, Loader2 } from "lucide-react";
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

  // Ümumi yüklənmə vəziyyəti (Həm audio buffer, həm də YouTube axtarışı)
  const isBuffering = isLoading || isLoadingStream;

  return (
    // DƏYİŞİKLİK: md:left-64 (PC-də soldan sidebar qədər boşluq buraxır)
    // Əgər sidebarınızın ölçüsü fərqlidirsə (məsələn w-72), buranı md:left-72 edin.
    <div className="fixed bottom-0 right-0 left-0 md:left-64 bg-background/95 backdrop-blur-lg border-t border-border p-2 sm:p-4 z-50 safe-area-bottom transition-all duration-300">
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-2 sm:gap-4 h-full">
        
        {/* 1. Mahnı Məlumatı (Sol Tərəf) */}
        <div className="flex items-center gap-2 sm:gap-4 w-1/3 min-w-0">
          <div className="relative group shrink-0">
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className={cn(
                "h-10 w-10 sm:h-14 sm:w-14 rounded-md object-cover shadow-lg transition-transform",
                isPlaying && !isBuffering ? "animate-pulse-slow" : ""
              )}
            />
          </div>
          <div className="min-w-0 overflow-hidden">
            <h3 className="font-semibold text-xs sm:text-sm truncate leading-tight">
              {currentTrack.title}
            </h3>
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
              {currentTrack.artist}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "hidden sm:flex h-8 w-8",
              isLiked ? "text-primary" : "text-muted-foreground"
            )}
            onClick={() => toggleLike(currentTrack)}
          >
            <Heart className={cn("h-4 w-4 sm:h-5 sm:w-5", isLiked && "fill-current")} />
          </Button>
        </div>

        {/* 2. İdarəetmə (Orta) */}
        <div className="flex flex-col items-center w-auto sm:w-1/3 max-w-md absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 sm:relative sm:left-auto sm:top-auto sm:transform-none">
          
          {/* Düymələr */}
          <div className="flex items-center gap-2 sm:gap-4 mb-1 sm:mb-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleShuffle}
              className={cn(
                "hidden sm:flex h-8 w-8",
                isShuffled ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Shuffle className="h-4 w-4" />
            </Button>

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={playPrevious}
              className="h-8 w-8 sm:h-10 sm:w-10 text-foreground hover:text-primary transition-colors"
            >
              <SkipBack className="h-5 w-5 sm:h-6 sm:w-6 fill-current" />
            </Button>

            <Button
              size="icon"
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-full shadow-lg hover:scale-105 transition-transform bg-primary text-primary-foreground"
              onClick={togglePlayPause}
              disabled={isBuffering} 
            >
              {isBuffering ? (
                <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
              ) : isPlaying ? (
                <Pause className="h-5 w-5 sm:h-6 sm:w-6 fill-current" />
              ) : (
                <Play className="h-5 w-5 sm:h-6 sm:w-6 fill-current ml-0.5" />
              )}
            </Button>

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={playNext}
              className="h-8 w-8 sm:h-10 sm:w-10 text-foreground hover:text-primary transition-colors"
            >
              <SkipForward className="h-5 w-5 sm:h-6 sm:w-6 fill-current" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleRepeat}
              className={cn(
                "hidden sm:flex h-8 w-8",
                repeatMode !== "off" ? "text-primary" : "text-muted-foreground"
              )}
            >
              {repeatMode === "one" ? (
                <Repeat1 className="h-4 w-4" />
              ) : (
                <Repeat className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-2 w-full sm:w-80 md:w-96">
            <span className="text-[10px] text-muted-foreground w-8 text-right hidden sm:block">
              {formatTime(localTime)}
            </span>
            <Slider
              value={[localTime]}
              max={duration || 100}
              step={1}
              className="w-32 sm:flex-1 cursor-pointer h-1.5 sm:h-2"
              onValueChange={handleSeek}
              onValueCommit={handleSeekCommit}
            />
            <span className="text-[10px] text-muted-foreground w-8 hidden sm:block">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* 3. Səs (Sağ Tərəf) - Yalnız Desktop */}
        <div className="hidden sm:flex items-center justify-end gap-2 w-1/3">
          <Volume2 className="h-4 w-4 text-muted-foreground" />
          <Slider
            value={[volume * 100]}
            max={100}
            step={1}
            className="w-24"
            onValueChange={([value]) => setVolume(value / 100)}
          />
        </div>

        {/* Mobil üçün Like Düyməsi (Sağda) */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "flex sm:hidden h-8 w-8 ml-auto",
            isLiked ? "text-primary" : "text-muted-foreground"
          )}
          onClick={() => toggleLike(currentTrack)}
        >
          <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
        </Button>

      </div>
    </div>
  );
}
