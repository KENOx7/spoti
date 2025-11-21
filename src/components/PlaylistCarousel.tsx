import { Playlist } from "@/types";
import { PlaylistCard } from "./PlaylistCard"; // Bu fayl eyni qovluqda olmalıdır
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
  
  const useGrid = !isMobile && playlists.length <= maxDesktopItems && showGridOnDesktop;

  if (playlists.length === 0) return null;

  // Desktop Grid
  if (useGrid) {
    return (
      <div className={cn("space-y-3", className)}>
        {title && <h2 className="text-xl sm:text-3xl font-bold px-1">{title}</h2>}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
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

  // Carousel
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
                // TELEFONDA 3 KART GÖRÜNMƏSİ ÜÇÜN: basis-[33%]
                className={cn(
                  "pl-2 sm:pl-4",
                  "basis-[33%] sm:basis-[25%] md:basis-[20%] lg:basis-[16%]"
                )}
              >
                <PlaylistCard
                  playlist={playlist}
                  onClick={onPlaylistClick ? () => onPlaylistClick(playlist) : undefined}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          
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
