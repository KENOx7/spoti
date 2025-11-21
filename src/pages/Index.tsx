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
    // DÜZƏLİŞ: w-full və overflow-x-hidden (ekrandan çıxmanın qarşısını alır)
    <div className="w-full overflow-x-hidden space-y-6 pb-32 px-4 sm:px-6 md:px-8 animate-in fade-in duration-500">
      
      {/* Salamlama */}
      <section className="pt-6">
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent leading-tight">
          {t("welcomeUser")}, {isGuest ? t("guest") : displayName} 👋
        </h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-lg">
          {t("enterMusicWorld")}
        </p>
      </section>

      {/* Liked Songs */}
      {!isGuest && (
        <section className="min-w-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg sm:text-2xl font-bold truncate">{t("likedSongs")}</h2>
          </div>
          <PlaylistCarousel
            playlists={[likedSongsPlaylist]}
            // DÜZƏLİŞ: maxDesktopItems={1} olanda grid layout tək kartı böyüdürdü.
            // Bunu ləğv etdik, artıq həmişə normal ölçüdə olacaq.
            showGridOnDesktop={false} 
            onPlaylistClick={() => navigate("/liked")}
          />
        </section>
      )}

      {/* My Playlists */}
      {playlists.length > 0 && (
        <section className="min-w-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg sm:text-2xl font-bold truncate">{t("myPlaylists")}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/collections")}
              className="text-xs sm:text-sm"
            >
              {t("collections")}
            </Button>
          </div>
          <PlaylistCarousel
            playlists={playlists}
            onPlaylistClick={(p) => navigate(`/playlist/${p.id}`)}
          />
        </section>
      )}

      {/* Trending Songs */}
      <section className="min-w-0">
        <h2 className="text-lg sm:text-2xl font-bold mb-3 truncate">{t("trending")}</h2>
        {/* DÜZƏLİŞ: min-w-0 container */}
        <div className="space-y-1 w-full min-w-0">
          {allTracks.map((track, index) => (
            // TrackItem-ə style vermək lazım deyil, əsas odur ki, container onu sıxsın
            <div key={track.id} className="w-full min-w-0">
               <TrackItem track={track} index={index} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
