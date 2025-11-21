// src/components/PlaylistCarousel.tsx
import { Playlist } from "@/types";
import { PlaylistCard } from "./PlaylistCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";

interface PlaylistCarouselProps {
  playlists: Playlist[];
  title?: string;
  showGridOnDesktop?: boolean;
  maxDesktopItems?: number;
  className?: string;
  onPlaylistClick?: (playlist: Playlist) => void;
}

export function PlaylistCarousel({
  playlists,
  title,
  showGridOnDesktop = true,
  maxDesktopItems = 6,
  className,
  onPlaylistClick,
}: PlaylistCarouselProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // Məntiqi sadələşdirdim:
  // Mobildirsə -> Həmişə Carousel
  // Desktopdursa -> Əgər kart sayı azdırsa Grid, çoxdursa Carousel
  const useGrid = !isMobile && playlists.length <= maxDesktopItems && showGridOnDesktop;

  if (playlists.length === 0) return null;

  // GRID Layout (Yalnız Desktop)
  if (useGrid) {
    return (
      <div className={cn("space-y-3", className)}>
        {title && <h2 className="text-xl sm:text-3xl font-bold px-1">{title}</h2>}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {playlists.map((playlist) => (
            <PlaylistCard
              key={playlist.id}
              playlist={playlist}
              onClick={onPlaylistClick ? () => onPlaylistClick(playlist) : undefined}
            />
          ))}
        </div>
      </div>
    );
  }

  // CAROUSEL Layout (Mobil və ya çoxlu kartlar)
  return (
    <div className={cn("space-y-3", className)}>
      {title && <h2 className="text-xl sm:text-3xl font-bold px-1">{title}</h2>}
      <div className="relative w-full">
        <Carousel
          opts={{
            align: "start",
            loop: false,
            dragFree: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 sm:-ml-4">
            {playlists.map((playlist) => (
              <CarouselItem
                key={playlist.id}
                // DÜZƏLİŞ: Mobildə kartlar çox böyük idi. 
                // basis-[35%] -> Ekrana ~2.5 kart sığır.
                // basis-[45%] -> Ekrana ~2 kart sığır.
                className={cn(
                  "pl-2 sm:pl-4",
                  "basis-[40%] sm:basis-[30%] md:basis-[20%] lg:basis-[16%]"
                )}
              >
                <PlaylistCard
                  playlist={playlist}
                  onClick={onPlaylistClick ? () => onPlaylistClick(playlist) : undefined}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          
          {/* Desktop oxları */}
          {!isMobile && (
             <>
               <CarouselPrevious className="-left-3" />
               <CarouselNext className="-right-3" />
             </>
          )}
        </Carousel>
      </div>
    </div>
  );
}
