// src/pages/Index.tsx
import { TrackItem } from "@/components/TrackItem";
import { mockTracks } from "@/data/tracks";
import { useLanguage } from "@/context/language-context";
import { usePlayer } from "@/context/player-context";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Play, Heart, Music } from "lucide-react";
import { useEffect, useState } from "react";
import { PlaylistCarousel } from "@/components/PlaylistCarousel";
import { storage } from "@/lib/storage";
import { Playlist } from "@/types";
import { useNavigate } from "react-router-dom";

export default function Index() {
  const { t } = useLanguage();
  const { setQueue, playTrack, likedTracks } = usePlayer();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  // Get playlists
  useEffect(() => {
    setPlaylists(storage.getPlaylists());
  }, []);

  // Set queue when component mounts
  useEffect(() => {
    if (mockTracks.length > 0) {
      setQueue(mockTracks);
    }
  }, [setQueue]);

  // All tracks - show all 25 songs
  const allTracks = mockTracks;

  // Create Liked Songs as a virtual playlist
  const likedSongsPlaylist: Playlist = {
    id: "liked-songs",
    name: t("likedSongs"),
    description: t("likedSongsDescription"),
    coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
    tracks: likedTracks,
    createdAt: new Date(),
  };

  const handlePlayAll = () => {
    setQueue(mockTracks);
    if (mockTracks.length > 0) {
      playTrack(mockTracks[0]);
    }
  };

  const handlePlayLikedSongs = () => {
    if (likedTracks.length > 0) {
      setQueue(likedTracks);
      playTrack(likedTracks[0]);
    }
  };

  return (
    <div className="space-y-8 sm:space-y-10 w-full min-w-0">
      {/* Welcome Section */}
      <section className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 via-blue-600/10 to-purple-600/10 p-6 sm:p-8 md:p-12 lg:p-16 border border-primary/20 shadow-xl w-full min-w-0">
        <div className="relative z-10 animate-in">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Welcome
          </h1>
          <p className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-2 text-foreground">
            {user?.username || "Guest"}
          </p>
          <p className="text-muted-foreground text-base sm:text-lg md:text-xl mb-6 sm:mb-8">
            Enjoy your music!
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl" />
      </section>

      {/* Additional content appears below on scroll */}
      <div className="space-y-8 sm:space-y-10">
        {/* Liked Songs Card */}
        {likedTracks.length > 0 && (
          <section>
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
                <Button
                  variant="ghost"
                  onClick={() => navigate("/collections")}
                >
                  {t("collections")} ({playlists.length})
                </Button>
              </div>
            )}
          </section>
        )}

        {/* All Songs */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">{t("trending")}</h2>
          <div className="space-y-1">
            {allTracks.map((track, index) => (
              <TrackItem key={track.id} track={track} index={index} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}