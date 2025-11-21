// ChartView.tsx
import { TrackItem } from "@/components/TrackItem";
import { chartTracks } from "@/data/tracks";
import { useLanguage } from "@/context/language-context";
import { Trophy, Play } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { usePlayer } from "@/context/player-context";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function ChartView() {
  const { t } = useLanguage();
  const { setQueue, playTrack } = usePlayer();

  // Set queue to chart tracks when component mounts
  useEffect(() => {
    if (chartTracks.length > 0) {
      setQueue(chartTracks);
    }
  }, [setQueue]);

  const handlePlayAll = () => {
    if (chartTracks.length > 0) {
      setQueue(chartTracks);
      playTrack(chartTracks[0]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          icon={<Trophy className="h-8 w-8 text-primary" />}
          title={t("charts")}
          subtitle="Top trending tracks this week"
          iconBgClass="bg-primary/10"
        />
        {chartTracks.length > 0 && (
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

      <div className="space-y-1">
        {chartTracks.map((track, index) => (
          <TrackItem key={track.id} track={track} index={index} />
        ))}
      </div>
    </div>
  );
}