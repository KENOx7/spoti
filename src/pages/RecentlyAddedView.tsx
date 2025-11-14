// RecentlyAddedView.tsx
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
  const { setQueue, playTrack } = usePlayer();
  const [recentTracks, setRecentTracks] = useState<Track[]>([]);

  useEffect(() => {
    // Get recently added tracks from storage
    // In a real app, this would come from an API with timestamps
    // For now, we'll use a combination of liked tracks and all tracks
    const likedTracks = storage.getLikedTracks();
    const playlists = storage.getPlaylists();
    const allPlaylistTracks = playlists.flatMap((p) => p.tracks);
    
    // Combine and deduplicate, prioritizing recently liked tracks
    const combined = [...likedTracks, ...allPlaylistTracks];
    const unique = Array.from(
      new Map(combined.map((track) => [track.id, track])).values()
    );
    
    // Sort by most recently added (in a real app, use timestamps)
    // For now, reverse to show newest first
    setRecentTracks(unique.reverse().slice(0, 20));
    
    // Set queue
    if (unique.length > 0) {
      setQueue(unique);
    }
  }, [setQueue]);

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
          subtitle={`${recentTracks.length} ${recentTracks.length === 1 ? t("track") : t("tracks")} • ${t("recentlyAddedDescription")}`}
          iconBgClass="bg-primary/10"
        />
        {recentTracks.length > 0 && (
          <Button
            onClick={handlePlayAll}
            size="lg"
            className="rounded-full hidden sm:flex"
          >
            <Play className="mr-2 h-5 w-5" />
            Hamısını Oxut
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
          <h2 className="text-2xl font-bold">{t("noTracks")}</h2>
          <p className="text-muted-foreground max-w-md">
            {t("recentlyAddedDescription")}
          </p>
          </div>
        </div>
      )}
    </div>
  );
}

