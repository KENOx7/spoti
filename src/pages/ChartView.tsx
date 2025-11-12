// ChartView.tsx
import { TrackItem } from "@/components/TrackItem";
import { chartTracks } from "@/data/tracks";
import { useLanguage } from "@/context/language-context";
import { Trophy } from "lucide-react";
import { PageHeader } from "@/components/PageHeader"; // YENİ: PageHeader import edildi

export default function ChartView() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      {/* YENİ: Köhnə başlıq kodu PageHeader ilə əvəz edildi */}
      <PageHeader
        icon={<Trophy className="h-8 w-8 text-primary" />}
        title={t("charts")}
        subtitle="Top trending tracks this week"
        iconBgClass="bg-primary/10"
      />

      <div className="space-y-1">
        {chartTracks.map((track, index) => (
          <TrackItem key={track.id} track={track} index={index} />
        ))}
      </div>
    </div>
  );
}