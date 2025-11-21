// src/components/Player.tsx
import { usePlayer } from "@/context/player-context";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, Shuffle, Repeat, Repeat1 } from "lucide-react";
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
    error,
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

  useEffect(() => {
    if (!isSeeking) {
      setLocalTime(currentTime);
    }
  }, [currentTime, isSeeking]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!currentTrack) return null;

  const isLiked = likedTracks.find((t: Track) => t.id === currentTrack.id) !== undefined;

  const handleSeekChange = ([value]: number[]) => {
    setLocalTime(value);
    seekTo(value);
  };

  return (
    <footer className="fixed bottom-0 left-0 md:left-60 right-0 w-full md:w-[calc(100%-15rem)] border-t border-border bg-card/95 backdrop-blur-xl z-50 shadow-2xl">
      {error && (
        <div className="px-2 sm:px-4 py-1 bg-destructive/20 text-destructive text-xs text-center animate-in">
          {error}
        </div>
      )}

      <div className="px-2 sm:px-4 py-2 sm:py-3 md:py-3">
        {/* Progress bar */}
        <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
          <span className="text-xs text-muted-foreground w-8 sm:w-10 text-right shrink-0">
            {formatTime(localTime)}
          </span>
          <Slider
            value={[localTime]}
            max={duration || 300}
            step={1}
            className="flex-1 min-w-0"
            onValueChange={handleSeekChange}
            disabled={isLoading || !duration}
          />
          <span className="text-xs text-muted-foreground w-8 sm:w-10 shrink-0">
            {formatTime(duration)}
          </span>
        </div>

        {/* Player Controls */}
        <div className="flex flex-col gap-2 sm:gap-0">
          <div className="flex items-center justify-between gap-1 sm:gap-2 w-full min-w-0">
            
            {/* Track info & Like */}
            <div className="flex items-center gap-1 sm:gap-2 md:gap-3 min-w-0 flex-1 md:flex-none md:w-1/3">
              <div className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 rounded-md overflow-hidden bg-muted shrink-0">
                <img
                  src={currentTrack.coverUrl || "/placeholder.svg"}
                  alt={currentTrack.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold truncate text-sm sm:text-base">
                  {currentTrack.title}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  {currentTrack.artist}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 sm:h-10 sm:w-10 hover:bg-accent/50 active:bg-accent shrink-0 transition-all touch-manipulation",
                  isLiked && "text-primary"
                )}
                onClick={() => toggleLike(currentTrack)}
                aria-label={isLiked ? "Unlike track" : "Like track"}
              >
                <Heart className={cn(
                  "h-3 w-3 sm:h-4 sm:w-4 transition-all",
                  isLiked 
                    ? "fill-primary text-primary scale-110 stroke-primary stroke-2" 
                    : "text-muted-foreground hover:text-primary active:text-primary stroke-2"
                )} />
              </Button>
            </div>

            {/* Playback controls */}
            <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleShuffle}
                className={cn(
                  "h-8 w-8 sm:h-10 sm:w-10 hover:bg-accent/50 active:bg-accent touch-manipulation",
                  isShuffled && "text-primary"
                )}
                title="Shuffle"
              >
                <Shuffle className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={playPrevious}
                className="h-8 w-8 sm:h-10 sm:w-10 hover:bg-accent/50 active:bg-accent touch-manipulation"
                title="Previous"
              >
                <SkipBack className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
              </Button>
              <Button
                size="icon"
                onClick={togglePlayPause}
                disabled={isLoading}
                className="h-9 w-9 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full bg-primary hover:bg-primary/90 active:bg-primary/80 shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200 disabled:opacity-50 touch-manipulation"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isLoading ? (
                  <div className="h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                ) : (
                  <Play className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 ml-0.5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={playNext}
                className="h-8 w-8 sm:h-10 sm:w-10 hover:bg-accent/50 active:bg-accent touch-manipulation"
                title="Next"
              >
                <SkipForward className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleRepeat}
                className={cn(
                  "h-8 w-8 sm:h-10 sm:w-10 hover:bg-accent/50 active:bg-accent touch-manipulation",
                  repeatMode !== "off" && "text-primary"
                )}
                title={`Repeat: ${repeatMode === "off" ? "Off" : repeatMode === "all" ? "All" : "One"}`}
              >
                {repeatMode === "one" ? (
                  <Repeat1 className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                ) : (
                  <Repeat className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                )}
              </Button>
            </div>

            {/* Desktop volume */}
            <div className="hidden md:flex items-center gap-2 w-1/3 justify-end">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <Slider
                value={[volume * 100]}
                max={100}
                step={1}
                className="w-24"
                onValueChange={([value]) => setVolume(value / 100)}
              />
            </div>
          </div>

          {/* Mobile volume */}
          <div className="flex md:hidden items-center gap-2 w-full px-1">
            <Volume2 className="h-4 w-4 text-muted-foreground shrink-0" />
            <Slider
              value={[volume * 100]}
              max={100}
              step={1}
              className="flex-1 min-w-0"
              onValueChange={([value]) => setVolume(value / 100)}
            />
            <span className="text-xs text-muted-foreground w-8 text-right shrink-0">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
