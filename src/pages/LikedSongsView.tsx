// LikedSongsView.tsx
import { TrackItem } from "@/components/TrackItem";
// SİLİNDİ: import { mockTracks } from "@/data/tracks";
import { useLanguage } from "@/context/language-context";
import { Heart } from "lucide-react";
// SİLİNDİ: import { useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
// YENİ: "Like" məlumatını çəkmək üçün usePlayer import edildi
import { usePlayer } from "@/context/player-context"; 

export default function LikedSongsView() {
  const { t } = useLanguage();
  // YENİ: Statik data əvəzinə, real bəyənilən mahnılar context-dən gəlir
  const { likedTracks } = usePlayer(); 

  // SİLİNDİ: useMemo bloku (artıq ehtiyac yoxdur)
  // const likedTracks = useMemo(...)

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Heart className="h-8 w-8 text-white fill-white" />}
        title={t("likedSongs")}
        // Məntiq olduğu kimi işləyir, çünki "likedTracks" dəyişənini istifadə edir
        subtitle={`${likedTracks.length} ${t("songs") || "songs"}`}
        iconBgClass="bg-gradient-to-br from-primary to-blue-600"
      />

      <div className="space-y-1">
        {likedTracks.length > 0 ? (
          // Bu hissə də olduğu kimi işləyir
          likedTracks.map((track, index) => (
            <TrackItem key={track.id} track={track} index={index} />
          ))
        ) : (
          <p className="text-muted-foreground text-center py-10">
            {t("noLikedSongs") || "You haven't liked any songs yet."}
          </p>
        )}
      </div>
    </div>
  );
}