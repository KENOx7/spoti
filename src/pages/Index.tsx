// src/pages/Index.tsx
import { TrackItem } from "@/components/TrackItem";
import { mockTracks } from "@/data/tracks";
import { useLanguage } from "@/context/language-context";
import { usePlayer } from "@/context/player-context";
import { Button } from "@/components/ui/button";
import { Play, Heart, Music } from "lucide-react";
import { useEffect, useState } from "react";
import { PlaylistCard } from "@/components/PlaylistCard";
import { storage } from "@/lib/storage";
import { Playlist } from "@/types";
import { useNavigate } from "react-router-dom";

export default function Index() {
  const { t } = useLanguage();
  const { setQueue, playTrack, likedTracks } = usePlayer();
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
    <div className="space-y-8 sm:space-y-10">
      {/* Hero Section */}
      <section className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 via-blue-600/10 to-purple-600/10 p-4 sm:p-6 md:p-8 lg:p-12 border border-primary/20 shadow-xl">
        <div className="relative z-10 animate-in">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-primary via-blue-400 to-purple-400 bg-clip-text text-transparent">
            {t("trending")}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg mb-4 sm:mb-6 max-w-2xl">
            {t("discover")}
          </p>
          <Button 
            size="lg" 
            className="rounded-full text-sm sm:text-base hover:scale-105 transition-transform duration-200 shadow-lg hover:shadow-xl" 
            onClick={handlePlayAll}
          >
            <Play className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            {t("playAll")}
          </Button>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl" />
      </section>

      {/* Liked Songs Card */}
      {likedTracks.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl sm:text-3xl font-bold">{t("likedSongs")}</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            <PlaylistCard
              playlist={likedSongsPlaylist}
              onClick={() => navigate("/liked")}
            />
          </div>
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {playlists.slice(0, 6).map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </div>
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
  );
}