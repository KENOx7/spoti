import { TrackItem } from "@/components/TrackItem";
import { useLanguage } from "@/context/language-context";
import { Heart, Play } from "lucide-react";
import { useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { usePlayer } from "@/context/player-context";
import { Button } from "@/components/ui/button";

export default function LikedSongsView() {
  const { t } = useLanguage();
  const { likedTracks, setQueue, playTrack } = usePlayer();

  // Mahnı siyahısını queue-ya atmaq
  useEffect(() => {
    if (likedTracks && likedTracks.length > 0) {
      setQueue(likedTracks);
    }
  }, [likedTracks, setQueue]);

  const handlePlayAll = () => {
    if (likedTracks.length > 0) {
      setQueue(likedTracks);
      playTrack(likedTracks[0]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          icon={<Heart className="h-8 w-8 text-white fill-white" />}
          title={t("likedSongs")}
          subtitle={`${likedTracks.length} ${likedTracks.length === 1 ? t("song") : t("songs")}`}
          iconBgClass="bg-gradient-to-br from-primary to-blue-600"
        />
        {likedTracks.length > 0 && (
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

      {likedTracks.length > 0 ? (
        <div className="space-y-1">
          {likedTracks.map((track, index) => (
            <TrackItem key={track.id} track={track} index={index} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
          <div className="p-6 rounded-full bg-muted/50">
            <Heart className="h-16 w-16 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">{t("noLikedSongs") || "Bəyənilən mahnı yoxdur"}</h2>
            <p className="text-muted-foreground">{t("addSongsToLibrary") || "Mahnıları bəyənərək kitabxananıza əlavə edin."}</p>
          </div>
        </div>
      )}
    </div>
  );
}