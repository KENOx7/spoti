// src/pages/Index.tsx
import { TrackItem } from "@/components/TrackItem";
import { mockTracks } from "@/data/tracks";
import { useLanguage } from "@/context/language-context";
import { usePlayer } from "@/context/player-context";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

export default function Index() {
  const { t } = useLanguage();
  const { setQueue, playTrack } = usePlayer();

  // "Recently Played" üçün sadəcə ilk 5 trek-i göstərək
  const recentTracks = mockTracks.slice(0, 5);

  // "Play All" düyməsinə basıldıqda
  const handlePlayAll = () => {
    setQueue(mockTracks); // Bütün trekləri növbəyə əlavə et
    if (mockTracks.length > 0) {
      playTrack(mockTracks[0]); // Və ilkini oxutmağa başla
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="relative rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 via-blue-600/10 to-transparent p-8 md:p-12">
        <div className="relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            {t("trending")}
          </h1>
          <p className="text-muted-foreground text-lg mb-6 max-w-2xl">
            Discover the latest hits and timeless classics, all in one place.
          </p>
          <Button size="lg" className="rounded-full" onClick={handlePlayAll}>
            <Play className="mr-2 h-5 w-5" />
            Play All
          </Button>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </section>

      {/* Recently Played */}
      <section>
        <h2 className="text-2xl font-bold mb-4">{t("recentlyPlayed")}</h2>
        <div className="space-y-1">
          {recentTracks.map((track, index) => (
            <TrackItem key={track.id} track={track} index={index} />
          ))}
        </div>
      </section>
    </div>
  );
}