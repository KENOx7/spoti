import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { TrackItem } from "@/components/TrackItem";
import { usePlayer } from "@/context/player-context";
import { storage } from "@/lib/storage";
import { Playlist } from "@/types";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
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
        // Avtomatik queue-ya atmaq (opsional, indi deaktiv etdim ki, istifadəçi play basanda oxusun)
        // if (found.tracks && found.tracks.length > 0) {
        //   setQueue(found.tracks);
        // }
      } else {
        toast({
          title: t("error"),
          description: t("error") + " (Playlist not found)",
          variant: "destructive",
        });
        navigate("/collections");
      }
    }
  }, [id, navigate, t, toast]); // setQueue asılılığını sildim ki, sonsuz döngü olmasın

  const handlePlayAll = () => {
    if (playlist && playlist.tracks && playlist.tracks.length > 0) {
      setQueue(playlist.tracks);
      playTrack(playlist.tracks[0]);
    }
  };

  if (!playlist) return null;

  const trackCount = playlist.tracks?.length || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <PageHeader
            icon={<Play className="h-8 w-8 text-primary" />}
            title={playlist.name}
            subtitle={`${trackCount} ${trackCount === 1 ? t("track") : t("tracks")}${playlist.description ? ` • ${playlist.description}` : ""}`}
            iconBgClass="bg-primary/10"
          />
        </div>
        {trackCount > 0 && (
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

      {trackCount > 0 ? (
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
            <h2 className="text-xl font-semibold">{t("emptyPlaylist") || "Pleylist boşdur"}</h2>
            <p className="text-muted-foreground">{t("addSongsToPlaylist") || "Mahnı əlavə edin."}</p>
          </div>
        </div>
      )}
    </div>
  );
}