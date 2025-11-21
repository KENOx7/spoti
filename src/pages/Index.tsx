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
  const { setQueue, likedTracks } = usePlayer(); // DÜZƏLİŞ: likedTracks buradan gəlir
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

  // DÜZƏLİŞ: tracks hissəsinə real likedTracks verildi
  const likedSongsPlaylist: Playlist = {
    id: "liked-songs",
    name: t("likedSongs"),
    description: t("likedSongs"), // Sadə təsvir
    coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    tracks: likedTracks || [], // CANLI DATA
    createdAt: new Date()
  };

  return (
    <div className="space-y-8 pb-8 animate-in fade-in duration-500">
      
      {/* Salamlama */}
      <section className="py-8 px-2">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent pb-2 leading-tight">
          {t("welcomeUser")}, {isGuest ? t("guest") : displayName} 👋
        </h1>
        <p className="text-muted-foreground mt-3 text-lg">
          {t("enterMusicWorld")}
        </p>
      </section>

      {/* Liked Songs (Yalnız Qonaq deyilsə və ya Qonaq olsa da göstərmək istəyirsinizsə məntiqi dəyişə bilərik) */}
      {!isGuest && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl sm:text-3xl font-bold">{t("likedSongs")}</h2>
          </div>
          <PlaylistCarousel
            playlists={[likedSongsPlaylist]}
            showGridOnDesktop={true}
            maxDesktopItems={1}
            onPlaylistClick={() => navigate("/liked")}
          />
        </section>
      )}

      {/* My Playlists */}
      {playlists.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl sm:text-3xl font-bold">{t("myPlaylists")}</h2>
            <Button
              variant="outline"
              onClick={() => navigate("/collections")}
              className="hidden sm:flex"
            >
              {t("collections")}
            </Button>
          </div>
          <PlaylistCarousel
            playlists={playlists}
            showGridOnDesktop={true}
            maxDesktopItems={6}
          />
          {playlists.length > 6 && (
            <div className="mt-4 text-center">
              <Button variant="ghost" onClick={() => navigate("/collections")}>
                {t("collections")} ({playlists.length})
              </Button>
            </div>
          )}
        </section>
      )}

      {/* Trending Songs */}
      <section>
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">{t("trending")}</h2>
        <div className="space-y-1">
          {allTracks.map((track, index) => (
            <TrackItem key={track.id} track={track} index={index} />
          ))}
        </div>
      </section>
    </div>
  );
}
