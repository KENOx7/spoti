// src/components/Player.tsx
import { usePlayer } from "@/context/player-context";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart } from "lucide-react";
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
    togglePlayPause,
    setVolume,
    seekTo,
    playNext,
    playPrevious,
    likedTracks, 
    toggleLike, 
  } = usePlayer();

  const [localTime, setLocalTime] = useState(0);
  // YENİ: Slider-i sürüşdürərkən mahnını dayandırmaq üçün
  const [isSeeking, setIsSeeking] = useState(false);

  useEffect(() => {
    // Əgər istifadəçi slideri çəkmirsə, mahnının vaxtını yenilə
    if (!isSeeking) {
      setLocalTime(currentTime);
    }
  }, [currentTime, isSeeking]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!currentTrack) {
    return null; 
  }

  const isLiked =
    likedTracks.find((t: Track) => t.id === currentTrack.id) !== undefined;

  // === DÜZƏLİŞ: Slider məntiqi ===
  const handleSeekChange = ([value]: number[]) => {
    setLocalTime(value); // Anında slideri yenilə
    seekTo(value); // Anında mahnını da dəyiş
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 md:ml-60 border-t border-border bg-card/95 backdrop-blur-lg z-50">
      <div className="px-4 py-3">
        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-muted-foreground w-10 text-right">
            {formatTime(localTime)}
          </span>
          {/* === DÜZƏLİŞ: 'onValueChangeCommitted' silindi === */}
          <Slider
            value={[localTime]}
            max={duration || 300}
            step={1}
            className="flex-1"
            onValueChange={handleSeekChange}
          />
          <span className="text-xs text-muted-foreground w-10">
            {formatTime(duration)}
          </span>
        </div>

        {/* Player Controls */}
        <div className="flex items-center justify-between">
          {/* Track info & Like */}
          <div className="flex items-center gap-3 w-1/3">
            <div className="h-14 w-14 rounded-md overflow-hidden bg-muted">
              {/* === DÜZƏLİŞ: 'albumCover' -> 'coverUrl' === */}
              <img
                src={currentTrack.coverUrl || "/placeholder.svg"}
                alt={currentTrack.title}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <p className="font-semibold truncate max-w-xs">
                {currentTrack.title}
              </p>
              <p className="text-sm text-muted-foreground truncate max-w-xs">
                {currentTrack.artist}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "hover:bg-accent/50",
                isLiked && "fill-primary text-primary"
              )}
              onClick={() => toggleLike(currentTrack)}
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>

          {/* Playback controls */}
          <div className="flex items-center gap-2 w-1/3 justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={playPrevious}
              className="hover:bg-accent/50"
            >
              <SkipBack className="h-5 w-5" />
            </Button>
            <Button
              size="icon"
              onClick={togglePlayPause}
              className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90 shadow-lg"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={playNext}
              className="hover:bg-accent/50"
            >
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>

          {/* Volume control */}
          <div className="flex items-center gap-2 w-1/3 justify-end">
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
      </div>
    </footer>
  );
}