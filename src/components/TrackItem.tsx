import { Track } from "@/types";
import { Button } from "@/components/ui/button";
import { Heart, Play, Pause } from "lucide-react";
import { usePlayer } from "@/context/player-context";
import { cn } from "@/lib/utils";

interface TrackItemProps {
  track: Track;
  index?: number;
}

export function TrackItem({ track, index }: TrackItemProps) {
  // YENİ: likedTracks və toggleLike context-dən gəlir
  const { currentTrack, isPlaying, playTrack, pauseTrack, likedTracks, toggleLike } = usePlayer();
  
  const isCurrentTrack = currentTrack?.id === track.id;
  
  // YENİ: Bu mahnının bəyənilib-bəyənilmədiyini yoxla
  const isLiked = likedTracks.some((t) => t.id === track.id);

  const handlePlayClick = () => {
    if (isCurrentTrack && isPlaying) {
      pauseTrack();
    } else {
      playTrack(track);
    }
  };

  // YENİ: "Like" düyməsinə basıldıqda
  const handleLikeClick = () => {
    toggleLike(track);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={cn(
        "group flex items-center gap-4 p-3 rounded-lg transition-all hover:bg-muted/50",
        isCurrentTrack && "bg-muted"
      )}
    >
      {index !== undefined && (
        <div className="w-6 text-center text-sm text-muted-foreground group-hover:hidden">
          {index + 1}
        </div>
      )}
      
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity",
          index !== undefined && "absolute"
        )}
        onClick={handlePlayClick}
      >
        {isCurrentTrack && isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>

      <img
        src={track.coverUrl}
        alt={track.title}
        className="w-12 h-12 rounded object-cover"
      />

      <div className="flex-1 min-w-0">
        <p className={cn(
          "font-medium truncate",
          isCurrentTrack && "text-primary"
        )}>
          {track.title}
        </p>
        <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
      </div>

      <div className="hidden md:block text-sm text-muted-foreground truncate flex-1 min-w-0">
        {track.album}
      </div>

      {/* YENİ: "Like" düyməsi tam funksional oldu */}
      <Button
        variant="ghost"
        size="icon"
        // Həmişə görünən etmək üçün "opacity-0" klasını yığışdırdım
        className="transition-opacity" 
        onClick={handleLikeClick}
      >
        <Heart className={cn(
          "h-4 w-4",
          isLiked ? "fill-primary text-primary" : "text-muted-foreground"
        )} />
      </Button>

      <span className="text-sm text-muted-foreground w-10 text-right">
        {formatDuration(track.duration)}
      </span>
    </div>
  );
}