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

  // DAHA KİÇİK KART KOMPONENTİ
  const PlaylistCardItem = ({ playlist }: { playlist: Playlist }) => (
    <Card 
      className="group cursor-pointer hover:bg-accent/50 transition-colors overflow-hidden border-border/50 shadow-sm h-full"
      onClick={() => navigate(`/playlist/${playlist.id}`)}
    >
      <CardHeader className="p-0">
        <div className="aspect-square w-full relative overflow-hidden">
          <img 
            src={playlist.coverUrl || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=60"} 
            alt={playlist.name}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Düyməni də kiçiltdik (h-7 w-7) */}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
            <Button
              size="icon"
              className="h-7 w-7 sm:h-10 sm:w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg transform scale-100 hover:scale-110 transition-transform"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/playlist/${playlist.id}`);
              }}
            >
              <Play className="h-3.5 w-3.5 sm:h-5 sm:w-5 ml-0.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {/* Padding (p-1.5) və Şriftlər (text-[10px]) azaldıldı */}
      <CardContent className="p-1.5 sm:p-3">
        <CardTitle className="text-[11px] sm:text-sm truncate mb-0.5 font-medium leading-tight">
          {playlist.name}
        </CardTitle>
        <CardDescription className="text-[9px] sm:text-xs text-muted-foreground truncate">
          {playlist.tracks?.length || 0} {playlist.tracks?.length === 1 ? t("track") : t("tracks")}
        </CardDescription>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500">
      
      <section className="py-4 px-3">
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent pb-1 leading-tight">
          {t("welcomeUser")}, {isGuest ? t("guest") : displayName} 👋
        </h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          {t("enterMusicWorld")}
        </p>
      </section>

      {/* Liked Songs */}
      {!isGuest && (
        <section className="px-2">
          <div className="flex items-center justify-between mb-2 px-1">
            <h2 className="text-lg sm:text-2xl font-bold">{t("likedSongs")}</h2>
          </div>
          <Carousel opts={{ align: "start", dragFree: true }} className="w-full">
            <CarouselContent className="-ml-2">
               {/* basis-[28%] -> Ekranda təxminən 3.5 dənə yerləşir (çox yığcam) */}
               <CarouselItem className="pl-2 basis-[28%] sm:basis-[22%] md:basis-[18%] lg:basis-[14%]">
                  <PlaylistCardItem playlist={likedSongsPlaylist} />
               </CarouselItem>
            </CarouselContent>
          </Carousel>
        </section>
      )}

      {/* My Playlists */}
      {playlists.length > 0 && (
        <section className="px-2">
          <div className="flex items-center justify-between mb-2 px-1">
            <h2 className="text-lg sm:text-2xl font-bold">{t("myPlaylists")}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/collections")}
              className="hidden sm:flex h-8 text-xs"
            >
              {t("collections")}
            </Button>
          </div>

          <Carousel opts={{ align: "start", dragFree: true }} className="w-full">
            <CarouselContent className="-ml-2">
              {playlists.map((playlist) => (
                // DÜZƏLİŞ: basis-[28%] -> Mobildə daha kiçik görünməsi üçün
                <CarouselItem key={playlist.id} className="pl-2 basis-[28%] sm:basis-[22%] md:basis-[18%] lg:basis-[14%]">
                  <PlaylistCardItem playlist={playlist} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex -left-2 h-8 w-8" />
            <CarouselNext className="hidden sm:flex -right-2 h-8 w-8" />
          </Carousel>

          {playlists.length > 6 && (
            <div className="mt-2 text-center sm:hidden">
              <Button variant="ghost" size="sm" onClick={() => navigate("/collections")} className="text-[10px] h-7">
                {t("collections")} ({playlists.length})
              </Button>
            </div>
          )}
        </section>
      )}

      {/* Trending Songs */}
      <section className="px-3">
        <h2 className="text-lg sm:text-2xl font-bold mb-2">{t("trending")}</h2>
        <div className="space-y-0.5">
          {allTracks.map((track, index) => (
            <TrackItem key={track.id} track={track} index={index} />
          ))}
        </div>
      </section>
    </div>
  );
}
