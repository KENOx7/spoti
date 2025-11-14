import { Track } from "@/types";
import { Button } from "@/components/ui/button";
import { Heart, Play, Pause, MoreHorizontal } from "lucide-react";
import { usePlayer } from "@/context/player-context";
import { cn } from "@/lib/utils";
import { memo, useCallback } from "react";
import { AddToPlaylistMenu } from "./AddToPlaylistMenu";
import { useLanguage } from "@/context/language-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TrackItemProps {
  track: Track;
  index?: number;
}

export const TrackItem = memo(function TrackItem({ track, index }: TrackItemProps) {
  const { t } = useLanguage();
  const { 
    currentTrack, 
    isPlaying, 
    playTrack, 
    pauseTrack, 
    likedTracks, 
    toggleLike,
    setQueue,
    queue
  } = usePlayer();
  
  const isCurrentTrack = currentTrack?.id === track.id;
  const isLiked = likedTracks.some((t) => t.id === track.id);

  const handlePlayClick = useCallback(() => {
    if (isCurrentTrack && isPlaying) {
      pauseTrack();
    } else {
      // Always ensure track is in queue before playing
      const trackInQueue = queue.some((t) => t.id === track.id);
      if (!trackInQueue) {
        // If queue is empty or track not in queue, add it
        if (queue.length === 0) {
          setQueue([track]);
        } else {
          setQueue([...queue, track]);
        }
      }
      playTrack(track);
    }
  }, [isCurrentTrack, isPlaying, pauseTrack, playTrack, track, queue, setQueue]);

  // Like button with immediate UI update
  const handleLikeClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLike(track);
  }, [toggleLike, track]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={cn(
        "group flex items-center gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 rounded-lg",
        "transition-all duration-200 ease-in-out",
        "hover:bg-muted/70 hover:scale-[1.01]",
        "active:scale-[0.99]",
        isCurrentTrack && "bg-muted/80 shadow-sm"
      )}
    >
      {/* Index vəya Play button - Mobil üçün kiçildilmiş */}
      <div className="relative w-6 sm:w-8 h-6 sm:h-8 shrink-0 flex items-center justify-center">
        {index !== undefined && (
          <div className="absolute inset-0 w-full h-full flex items-center justify-center text-xs sm:text-sm text-muted-foreground group-hover:hidden">
            {index + 1}
          </div>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "w-6 h-6 sm:w-8 sm:h-8 opacity-0 group-hover:opacity-100 transition-opacity absolute inset-0 flex items-center justify-center",
            index === undefined && "opacity-100"
          )}
          onClick={handlePlayClick}
        >
          {isCurrentTrack && isPlaying ? (
            <Pause className="h-3 w-3 sm:h-4 sm:w-4" />
          ) : (
            <Play className="h-3 w-3 sm:h-4 sm:w-4" />
          )}
        </Button>
      </div>

      {/* Cover image - Mobil üçün kiçildilmiş */}
      <img
        src={track.coverUrl}
        alt={track.title}
        className="w-10 h-10 sm:w-12 sm:h-12 rounded object-cover shrink-0"
      />

      {/* Track info - Mobil üçün əsas məzmun */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          "font-medium truncate text-sm sm:text-base",
          isCurrentTrack && "text-primary"
        )}>
          {track.title}
        </p>
        <p className="text-xs sm:text-sm text-muted-foreground truncate">{track.artist}</p>
      </div>

      {/* Album - Yalnız desktop üçün */}
      <div className="hidden lg:block text-sm text-muted-foreground truncate flex-1 min-w-0 max-w-[200px]">
        {track.album}
      </div>

      {/* Like button - Improved visibility with clear filled vs outline */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-8 w-8 sm:h-10 sm:w-10 shrink-0 transition-all",
          "opacity-0 group-hover:opacity-100 sm:opacity-100"
        )}
        onClick={handleLikeClick}
        aria-label={isLiked ? "Unlike track" : "Like track"}
      >
        <Heart className={cn(
          "h-3 w-3 sm:h-4 sm:w-4 transition-all",
          isLiked 
            ? "fill-primary text-primary scale-110 stroke-primary stroke-2" 
            : "text-muted-foreground hover:text-primary stroke-2"
        )} />
      </Button>

      {/* More options menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 sm:h-10 sm:w-10 shrink-0",
              "opacity-0 group-hover:opacity-100 transition-opacity"
            )}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={(e) => {
            e.stopPropagation();
            handleLikeClick(e);
          }}>
            <Heart className={cn(
              "mr-2 h-4 w-4",
              isLiked && "fill-primary text-primary"
            )} />
            {isLiked ? t("unlike") : t("like")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <div className="px-2 py-1.5">
            <AddToPlaylistMenu track={track} />
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Duration - Mobil üçün kiçildilmiş */}
      <span className="text-xs sm:text-sm text-muted-foreground w-10 sm:w-12 text-right shrink-0">
        {formatDuration(track.duration)}
      </span>
    </div>
  );
});