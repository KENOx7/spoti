import { TrackItem } from "@/components/TrackItem";
import { mockTracks } from "@/data/tracks";
import { useLanguage } from "@/context/language-context";
import { usePlayer } from "@/context/player-context";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { PlaylistCarousel } from "@/components/PlaylistCarousel";
import { storage } from "@/lib/storage";
import { Playlist } from "@/types";
import { useNavigate } from "react-router-dom";

export default function Index() {
  const { t } = useLanguage();
  const { user, isGuest } = useAuth();
  const { setQueue, likedTracks } = usePlayer();
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  useEffect(() => {
    setPlaylists(storage.getPlaylists());
  }, []);

  useEffect(() => {
    if (mockTracks.length > 0) {
      setQueue(mockTracks);
    }
  }, [setQueue]);

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || t("guest");
  const allTracks = mockTracks;

  const likedSongsPlaylist: Playlist = {
    id: "liked-songs",
    name: t("likedSongs"),
    description: t("likedSongs"),
    coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    tracks: likedTracks || [],
    createdAt: new Date()
  };

  return (
    // DÜZƏLİŞ: padding (px-4) və bottom-padding (pb-32) əlavə edildi
    <div className="space-y-6 pb-32 px-4 sm:px-6 md:px-8 animate-in fade-in duration-500">
      
      {/* Salamlama - Mobil üçün font kiçildildi (text-2xl) */}
      <section className="pt-6 pb-2">
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent pb-2 leading-tight">
          {t("welcomeUser")}, {isGuest ? t("guest") : displayName} 👋
        </h1>
        <p className="text-muted-foreground mt-1 sm:mt-3 text-sm sm:text-lg">
          {t("enterMusicWorld")}
        </p>
      </section>

      {/* Liked Songs */}
      {!isGuest && (
        <section>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-xl sm:text-3xl font-bold">{t("likedSongs")}</h2>
          </div>
          {/* DÜZƏLİŞ: maxDesktopItems=5 edildi (Əvvəl 1 idi və çox böyük görünürdü) */}
          <PlaylistCarousel
            playlists={[likedSongsPlaylist]}
            showGridOnDesktop={true}
            maxDesktopItems={5} 
            onPlaylistClick={() => navigate("/liked")}
          />
        </section>
      )}

      {/* My Playlists */}
      {playlists.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-xl sm:text-3xl font-bold">{t("myPlaylists")}</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/collections")}
              className="hidden sm:flex"
            >
              {t("collections")}
            </Button>
          </div>
          <PlaylistCarousel
            playlists={playlists}
            showGridOnDesktop={true}
            maxDesktopItems={5}
          />
          {playlists.length > 5 && (
            <div className="mt-4 text-center sm:hidden">
              <Button variant="ghost" size="sm" onClick={() => navigate("/collections")}>
                {t("collections")} ({playlists.length})
              </Button>
            </div>
          )}
        </section>
      )}

      {/* Trending Songs */}
      <section>
        <h2 className="text-xl sm:text-3xl font-bold mb-3 sm:mb-4">{t("trending")}</h2>
        <div className="space-y-1">
          {allTracks.map((track, index) => (
            <TrackItem key={track.id} track={track} index={index} />
          ))}
        </div>
      </section>
    </div>
  );
}
