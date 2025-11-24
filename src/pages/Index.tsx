// src/pages/Index.tsx
import { TrackItem } from "@/components/TrackItem";
import { mockTracks } from "@/data/tracks";
import { useLanguage } from "@/context/language-context";
import { usePlayer } from "@/context/player-context";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { storage } from "@/lib/storage";
import { Playlist } from "@/types";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Play } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// Helper komponent: Playlist kartı
const PlaylistCardItem = ({ playlist }: { playlist: Playlist }) => {
  const navigate = useNavigate();
  const { playTrack, setQueue } = usePlayer();

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Karta kliklənməsinin qarşısını al
    if (playlist.tracks && playlist.tracks.length > 0) {
      setQueue(playlist.tracks); // 1. Bütün siyahını növbəyə əlavə et
      playTrack(playlist.tracks[0]); // 2. Birincini oxut
    }
  };

  return (
    <Card 
      className="group relative overflow-hidden border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer h-full"
      onClick={() => navigate(`/playlist/${playlist.id}`)}
    >
      <CardHeader className="p-0">
        <div className="aspect-square relative w-full h-full">
          <img 
            src={playlist.coverUrl || "/placeholder.svg"} 
            alt={playlist.name}
            className="object-cover w-full h-full transition-transform group-hover:scale-105" 
          />
          {/* Play Button Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <Button 
               size="icon" 
               className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 w-10 sm:h-12 sm:w-12 shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
               onClick={handlePlayClick}
             >
               <Play className="h-5 w-5 fill-current ml-1" />
             </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-2 sm:p-3">
        <CardTitle className="text-sm sm:text-base truncate font-medium">{playlist.name}</CardTitle>
        <CardDescription className="text-xs text-muted-foreground truncate">
           {playlist.description || "Playlist"}
        </CardDescription>
      </CardContent>
    </Card>
  );
};

export default function Index() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { likedTracks } = usePlayer(); 
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  useEffect(() => {
    setPlaylists(storage.getPlaylists());
  }, []);

  // --- VACİB DÜZƏLİŞ: BURADAKI useEffect SİLİNDİ ---
  // Əvvəl burada setQueue(mockTracks) var idi, o playeri pozurdu.
  // Artıq silinib.
  
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || t("guest");
  const allTracks = mockTracks;

  const likedSongsPlaylist: Playlist = {
    id: "liked-songs",
    name: t("likedSongs"),
    description: t("likedSongs"),
    coverUrl: likedTracks.length > 0 ? likedTracks[likedTracks.length - 1].coverUrl : "https://misc.scdn.co/liked-songs/liked-songs-640.png",
    tracks: likedTracks,
    createdAt: new Date()
  };

  return (
    <div className="pb-32 space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <section className="px-3 sticky top-0 bg-background/95 backdrop-blur-lg z-30 py-4 -mx-3 sm:mx-0 sm:static sm:bg-transparent sm:backdrop-blur-none sm:z-auto sm:p-0">
        <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
          {t("welcome")}, {displayName}
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base mt-1">
          {t("readyToListen")}
        </p>
      </section>

      {/* Liked Songs Shortcut */}
      {likedTracks.length > 0 && (
        <section className="px-3">
          <div className="flex items-center justify-between mb-4">
             <h2 className="text-lg sm:text-2xl font-bold">{t("yourLibrary")}</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
             <PlaylistCardItem playlist={likedSongsPlaylist} />
          </div>
        </section>
      )}

      {/* My Playlists Carousel */}
      {playlists.length > 0 && (
        <section className="px-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg sm:text-2xl font-bold">{t("myPlaylists")}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/collections")}
              className="text-primary hover:text-primary/80"
            >
              {t("collections")}
            </Button>
          </div>

          <Carousel opts={{ align: "start", dragFree: true }} className="w-full">
            <CarouselContent className="-ml-2">
              {playlists.map((playlist) => (
                <CarouselItem key={playlist.id} className="pl-2 basis-[45%] sm:basis-[30%] md:basis-[22%] lg:basis-[18%]">
                  <PlaylistCardItem playlist={playlist} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex -left-2 h-8 w-8" />
            <CarouselNext className="hidden sm:flex -right-2 h-8 w-8" />
          </Carousel>
        </section>
      )}

      {/* Trending Songs */}
      <section className="px-3">
        <h2 className="text-lg sm:text-2xl font-bold mb-2">{t("trending")}</h2>
        <div className="space-y-1">
          {allTracks.map((track, index) => (
            <TrackItem key={track.id} track={track} index={index} />
          ))}
        </div>
      </section>
    </div>
  );
}