import { TrackItem } from "@/components/TrackItem";
import { useLanguage } from "@/context/language-context";
import { Clock, Play } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { usePlayer } from "@/context/player-context";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Track } from "@/types";
import { storage } from "@/lib/storage";

export default function RecentlyAddedView() {
  const { t } = useLanguage();
  const { setQueue, playTrack, likedTracks } = usePlayer(); // DÜZƏLİŞ: likedTracks buradan gəlir
  const [recentTracks, setRecentTracks] = useState<Track[]>([]);

  useEffect(() => {
    // DÜZƏLİŞ: storage.getLikedTracks() yerinə kontekstdən gələn likedTracks istifadə edirik
    const playlists = storage.getPlaylists();
    const allPlaylistTracks = playlists.flatMap((p) => p.tracks || []); // Null check
    
    // Birləşdir və təkrarları sil
    const combined = [...likedTracks, ...allPlaylistTracks];
    const unique = Array.from(
      new Map(combined.map((track) => [track.id, track])).values()
    );
    
    // Tərsinə çevir (ən yenilər yuxarıda)
    const sorted = unique.reverse().slice(0, 50);
    setRecentTracks(sorted);
  }, [likedTracks]); // likedTracks dəyişəndə yenilənəcək

  const handlePlayAll = () => {
    if (recentTracks.length > 0) {
      setQueue(recentTracks);
      playTrack(recentTracks[0]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          icon={<Clock className="h-8 w-8 text-primary" />}
          title={t("recentlyAdded")}
          subtitle={`${recentTracks.length} ${recentTracks.length === 1 ? t("song") : t("songs")}`}
          iconBgClass="bg-primary/10"
        />
        {recentTracks.length > 0 && (
          <Button
            onClick={handlePlayAll}
            size="lg"
            className="rounded-full hidden sm:flex"
          >
            <Play className="mr-2 h-5 w-5" />
            {t("playAll")}
          </Button>
        )}
      </div>

      {recentTracks.length > 0 ? (
        <div className="space-y-1">
          {recentTracks.map((track, index) => (
            <TrackItem key={track.id} track={track} index={index} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
          <div className="p-6 rounded-full bg-muted/50">
            <Clock className="h-16 w-16 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">{t("noRecentSongs") || "Mahnı yoxdur"}</h2>
            <p className="text-muted-foreground">Mahnı dinlədikcə burada görünəcək.</p>
          </div>
        </div>
      )}
    </div>
  );
}
