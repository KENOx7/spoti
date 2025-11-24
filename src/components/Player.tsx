import { usePlayer } from "@/context/player-context";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Volume2, Repeat, Repeat1, Shuffle, Heart, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function Player() {
  const {
    currentTrack,
    isPlaying,
    volume,
    currentTime,
    duration,
    isLoading, // Yüklənmə statusunu alırıq
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
    toggleLike
  } = usePlayer();

  const [localTime, setLocalTime] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  useEffect(() => {
    if (!isSeeking) {
      setLocalTime(currentTime);
    }
  }, [currentTime, isSeeking]);

  // Əgər mahnı seçilməyibsə, player görünmür
  if (!currentTrack) return null;

  const isLiked = likedTracks.some(t => t.id === currentTrack.id);

  return (
    <div className={cn(
      "fixed left-0 right-0 z-40 border-t border-primary/10 backdrop-blur-xl transition-all duration-300",
      "bg-background/80 supports-[backdrop-filter]:bg-background/60",
      "bottom-[58px] md:bottom-0", 
      "md:pl-64"
    )}>
      <div className="flex flex-col p-2 md:p-4 max-w-screen-2xl mx-auto">
        
        {/* Slider */}
        <div className="w-full px-2 mb-0 order-1 md:absolute md:top-0 md:left-0 md:right-0 md:px-0 md:-mt-1.5">
           <Slider
            value={[isSeeking ? localTime : currentTime]}
            max={duration || 100}
            step={1}
            className="w-full cursor-pointer [&>.relative>.absolute]:bg-primary [&>.relative]:bg-primary/20 h-1 md:h-1.5"
            onValueChange={([value]) => {
              setIsSeeking(true);
              setLocalTime(value);
            }}
            onValueCommit={([value]) => {
              seekTo(value);
              setIsSeeking(false);
            }}
          />
        </div>

        <div className="flex items-center justify-between gap-2 md:gap-4 order-2">
          {/* Track Info */}
          <div className="flex items-center gap-3 w-1/3 overflow-hidden">
            <div className="relative h-10 w-10 md:h-14 md:w-14 rounded-lg overflow-hidden bg-muted shrink-0 shadow-lg shadow-primary/10">
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className={cn("h-full w-full object-cover", isLoading && "opacity-50")}
              />
              {/* Şəkil üzərində kiçik spinner */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-medium text-sm md:text-base text-foreground">
                {currentTrack.title}
              </h3>
              <p className="truncate text-xs md:text-sm text-muted-foreground">
                {currentTrack.artist}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className={cn("hidden sm:flex h-8 w-8", isLiked && "text-primary")}
              onClick={() => toggleLike(currentTrack)}
            >
              <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
            </Button>
          </div>

          {/* Controls */}
          <div className="flex flex-col items-center gap-1 flex-1">
            <div className="flex items-center gap-2 md:gap-4">
              <Button
                variant="ghost"
                size="icon"
                className={cn("hidden md:flex h-8 w-8 text-muted-foreground hover:text-primary", isShuffled && "text-primary")}
                onClick={toggleShuffle}
              >
                <Shuffle className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={playPrevious}
                className="h-8 w-8 md:h-10 md:w-10 hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <SkipBack className="h-5 w-5 md:h-6 md:w-6" />
              </Button>

              <Button
                size="icon"
                onClick={togglePlayPause}
                className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:scale-105 transition-transform"
                disabled={isLoading} // Yüklənərkən düyməni deaktiv edirik
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 md:h-6 md:w-6 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="h-5 w-5 md:h-6 md:w-6" />
                ) : (
                  <Play className="h-5 w-5 md:h-6 md:w-6 ml-0.5" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={playNext}
                className="h-8 w-8 md:h-10 md:w-10 hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <SkipForward className="h-5 w-5 md:h-6 md:w-6" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className={cn("hidden md:flex h-8 w-8 text-muted-foreground hover:text-primary", repeatMode !== "off" && "text-primary")}
                onClick={toggleRepeat}
              >
                {repeatMode === "one" ? <Repeat1 className="h-4 w-4" /> : <Repeat className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Volume */}
          <div className="hidden md:flex items-center justify-end gap-2 w-1/3">
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <Slider
              value={[volume * 100]}
              max={100}
              step={1}
              className="w-24 cursor-pointer"
              onValueChange={([value]) => setVolume(value / 100)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}