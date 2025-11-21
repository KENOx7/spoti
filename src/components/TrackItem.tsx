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
      const trackInQueue = queue.some((t) => t.id === track.id);
      if (!trackInQueue) {
        setQueue((prev) => [...prev, track]);
      }
      playTrack(track);
    }
  }, [isCurrentTrack, isPlaying, track, queue, playTrack, pauseTrack, setQueue]);

  const handleLikeClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLike(track);
  }, [toggleLike, track]);

  // Saniyəni dəqiqəyə çevirən funksiya
  const formatDuration = (seconds?: number) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div 
      onClick={handlePlayClick}
      className={cn(
        "group flex items-center gap-3 p-2 rounded-lg transition-all duration-200 cursor-pointer w-full max-w-full overflow-hidden select-none",
        isCurrentTrack ? "bg-primary/10" : "hover:bg-accent/50"
      )}
    >
      {/* 1. ŞƏKİL (Sol tərəf - Sabit ölçü) */}
      <div className="relative shrink-0">
        <div className={cn(
          "w-10 h-10 sm:w-12 sm:h-12 rounded-md overflow-hidden shadow-sm relative",
          isCurrentTrack && isPlaying && "animate-pulse-slow"
        )}>
           <img 
             src={track.coverUrl || "/placeholder.svg"} 
             alt={track.title}
             className="w-full h-full object-cover"
             loading="lazy"
           />
           {/* Hover zamanı Play ikonunu göstər */}
           <div className={cn(
             "absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200",
             isCurrentTrack ? "opacity-100" : "opacity-0 group-hover:opacity-100"
           )}>
             {isCurrentTrack && isPlaying ? (
               <Pause className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-current" />
             ) : (
               <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-current ml-0.5" />
             )}
           </div>
        </div>
      </div>

      {/* 2. MƏTN HİSSƏSİ (Orta - Sıxıla bilən hissə) */}
      {/* min-w-0 vacibdir! Yoxsa text uzanar və sağ tərəfi atar */}
      <div className="flex-1 flex flex-col justify-center min-w-0 gap-0.5">
        <h4 className={cn(
          "font-medium text-sm sm:text-base truncate pr-2",
          isCurrentTrack ? "text-primary" : "text-foreground"
        )}>
          {track.title}
        </h4>
        <p className="text-xs sm:text-sm text-muted-foreground truncate">
          {track.artist}
        </p>
      </div>

      {/* 3. DÜYMƏLƏR (Sağ tərəf - Heç vaxt sıxılmasın) */}
      <div className="flex items-center gap-1 shrink-0">
        
        {/* Like Button - Mobildə gizlətmirik, yer varsa görünür */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLikeClick}
          className={cn(
            "h-8 w-8 sm:h-9 sm:w-9 hidden xs:flex", // Çox kiçik ekranda gizlənir
            isLiked ? "text-primary" : "text-muted-foreground opacity-70 hover:opacity-100"
          )}
        >
          <Heart className={cn("h-4 w-4 sm:h-5 sm:w-5", isLiked && "fill-current")} />
        </Button>

        {/* Duration - Mobildə gizlədirik, yer tutmasın */}
        <span className="text-xs text-muted-foreground w-[40px] text-right hidden sm:block">
          {formatDuration(track.duration)}
        </span>

        {/* More Menu - Həmişə görünür */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
              <MoreHorizontal className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
             <DropdownMenuItem onClick={handleLikeClick}>
                <Heart className={cn("mr-2 h-4 w-4", isLiked && "fill-primary text-primary")} />
                {isLiked ? t("unlike") : t("like")}
             </DropdownMenuItem>
             <DropdownMenuSeparator />
             <div className="p-1">
               <AddToPlaylistMenu track={track} />
             </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
});
