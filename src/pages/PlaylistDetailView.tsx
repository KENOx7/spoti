// PlaylistDetailView.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { TrackItem } from "@/components/TrackItem";
import { usePlayer } from "@/context/player-context";
import { storage } from "@/lib/storage";
import { Playlist } from "@/types";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Play, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/language-context";

export default function PlaylistDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { setQueue, playTrack } = usePlayer();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);

  useEffect(() => {
    if (id) {
      const playlists = storage.getPlaylists();
      const found = playlists.find((p) => p.id === id);
      if (found) {
        setPlaylist(found);
        // Set queue to playlist tracks when viewing
        if (found.tracks.length > 0) {
          setQueue(found.tracks);
        }
      } else {
        toast({
          title: t("error"),
          description: t("error"),
          variant: "destructive",
        });
        navigate("/collections");
      }
    }
  }, [id, setQueue, navigate, toast]);

  // Update playlist when storage changes (e.g., tracks added/removed)
  useEffect(() => {
    const handleStorageChange = () => {
      if (id) {
        const playlists = storage.getPlaylists();
        const found = playlists.find((p) => p.id === id);
        if (found) {
          setPlaylist(found);
          // Only update queue if we're currently viewing this playlist
          // and the track count changed
          if (found.tracks.length > 0 && found.tracks.length !== playlist?.tracks.length) {
            setQueue(found.tracks);
          }
        } else {
          // Playlist was deleted
          navigate("/collections");
        }
      }
    };

    // Listen for storage changes (in a real app, you'd use a proper event system)
    const interval = setInterval(handleStorageChange, 1000);
    return () => clearInterval(interval);
  }, [id, setQueue, navigate, playlist?.tracks.length]);

  const handlePlayAll = () => {
    if (playlist && playlist.tracks.length > 0) {
      setQueue(playlist.tracks);
      playTrack(playlist.tracks[0]);
    }
  };

  if (!playlist) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-muted-foreground">Playlist yüklənir...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/collections")}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <PageHeader
            icon={<Play className="h-8 w-8 text-primary" />}
            title={playlist.name}
            subtitle={`${playlist.tracks.length} ${playlist.tracks.length === 1 ? t("track") : t("tracks")}${playlist.description ? ` • ${playlist.description}` : ""}`}
            iconBgClass="bg-primary/10"
          />
        </div>
        {playlist.tracks.length > 0 && (
          <Button
            onClick={handlePlayAll}
            size="lg"
            className="rounded-full hidden sm:flex shrink-0"
          >
            <Play className="mr-2 h-5 w-5" />
            {t("playAll")}
          </Button>
        )}
      </div>

      {playlist.tracks.length > 0 ? (
        <div className="space-y-1">
          {playlist.tracks.map((track, index) => (
            <TrackItem key={track.id} track={track} index={index} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
          <div className="p-6 rounded-full bg-muted/50">
            <Play className="h-16 w-16 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">{t("emptyPlaylist")}</h2>
            <p className="text-muted-foreground max-w-md">
              {t("addSongsToPlaylist")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

