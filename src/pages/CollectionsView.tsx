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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Play } from "lucide-react";

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

      {/* Liked Songs - Bu tək olduğu üçün Carousel-də qala bilər və ya bunu da grid edə bilərik. 
          Hələlik standart saxladım. */}
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

      {/* My Playlists - BURADA DÜZƏLİŞ EDİLDİ */}
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

          {/* Grid Sistemi: Mobildə 3 sütun (grid-cols-3), Desktopda daha çox */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-4">
            {playlists.slice(0, 6).map((playlist) => (
              <Card 
                key={playlist.id} 
                className="group cursor-pointer hover:bg-accent/50 transition-colors overflow-hidden border-border/50"
                onClick={() => navigate(`/playlist/${playlist.id}`)}
              >
                <CardHeader className="p-0">
                  <div className="aspect-square w-full relative overflow-hidden">
                    <img 
                      src={playlist.coverUrl || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=60"} 
                      alt={playlist.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Düymə ölçüləri mobildə kiçildildi */}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                      <Button
                        size="icon"
                        className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/playlist/${playlist.id}`);
                        }}
                      >
                        <Play className="h-4 w-4 sm:h-5 sm:w-5 ml-0.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-2 sm:p-4">
                  <CardTitle className="text-xs sm:text-base truncate mb-1 font-medium">
                    {playlist.name}
                  </CardTitle>
                  <CardDescription className="text-[10px] sm:text-xs text-muted-foreground truncate">
                    {playlist.tracks?.length || 0} {playlist.tracks?.length === 1 ? t("track") : t("tracks")}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* "Hamısına bax" düyməsi mobildə */}
          {playlists.length > 6 && (
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
