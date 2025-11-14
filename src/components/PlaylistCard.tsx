// PlaylistCard.tsx
import { Playlist } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Music } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePlayer } from "@/context/player-context";
import { useLanguage } from "@/context/language-context";
import { cn } from "@/lib/utils";

interface PlaylistCardProps {
  playlist: Playlist;
  onClick?: () => void;
}

export function PlaylistCard({ playlist, onClick }: PlaylistCardProps) {
  const navigate = useNavigate();
  const { setQueue, playTrack } = usePlayer();
  const { t } = useLanguage();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/playlist/${playlist.id}`);
    }
  };

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (playlist.tracks.length > 0) {
      setQueue(playlist.tracks);
      playTrack(playlist.tracks[0]);
    }
  };

  return (
    <Card
      className={cn(
        "group cursor-pointer hover:shadow-lg transition-all duration-200",
        "hover:scale-[1.02] active:scale-[0.98]"
      )}
      onClick={handleClick}
    >
      <div className="relative aspect-square overflow-hidden rounded-t-lg bg-gradient-to-br from-primary/20 to-purple-500/20">
        {playlist.coverUrl ? (
          <img
            src={playlist.coverUrl}
            alt={playlist.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <Music className="h-16 w-16 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePlay}
            disabled={playlist.tracks.length === 0}
            className="h-12 w-12 text-white hover:bg-white/20 rounded-full flex items-center justify-center"
          >
            <Play className="h-6 w-6 fill-white" />
          </Button>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-base truncate mb-1">{playlist.name}</h3>
        <p className="text-sm text-muted-foreground">
          {playlist.tracks.length} {playlist.tracks.length === 1 ? t("track") : t("tracks")}
        </p>
      </CardContent>
    </Card>
  );
}

