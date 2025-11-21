// PlaylistCarousel.tsx
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
  maxDesktopItems?: number; // When to switch from grid to carousel on desktop
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
  const isTablet = useMediaQuery("(max-width: 1024px)");
  
  // On mobile: always use carousel
  // On desktop: use grid if few playlists, carousel if many
  const useCarousel = isMobile || (playlists.length > maxDesktopItems && !showGridOnDesktop);
  const useGrid = !isMobile && playlists.length <= maxDesktopItems && showGridOnDesktop;

  if (playlists.length === 0) {
    return null;
  }

  // Grid layout for desktop with few playlists
  if (useGrid) {
    return (
      <div className={cn("space-y-4", className)}>
        {title && (
          <h2 className="text-2xl sm:text-3xl font-bold">{title}</h2>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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

  // Carousel layout for mobile or desktop with many playlists
  return (
    <div className={cn("space-y-4", className)}>
      {title && (
        <h2 className="text-2xl sm:text-3xl font-bold">{title}</h2>
      )}
      <div className="relative group/carousel">
        <Carousel
          opts={{
            align: "start",
            loop: false,
            dragFree: true,
            containScroll: "trimSnaps",
            slidesToScroll: isMobile ? 1 : 2,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {playlists.map((playlist) => (
              <CarouselItem
                key={playlist.id}
                className={cn(
                  "pl-2 md:pl-4",
                  // Responsive card widths
                  isMobile ? "basis-[45%] sm:basis-[40%]" : "basis-[30%] md:basis-[25%] lg:basis-[20%] xl:basis-[16.666%]"
                )}
              >
                <PlaylistCard
                  playlist={playlist}
                  onClick={onPlaylistClick ? () => onPlaylistClick(playlist) : undefined}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          {/* Navigation buttons - only show on mobile if more than 3 playlists */}
          {(!isMobile || playlists.length > 3) && (
            <>
              <CarouselPrevious 
                className={cn(
                  "!h-10 !w-10 bg-background/90 backdrop-blur-sm border-2 shadow-lg z-10 rounded-full",
                  "hover:bg-background hover:scale-110 active:scale-95 transition-all",
                  "touch-manipulation", // Better touch handling
                  isMobile 
                    ? "!left-2 opacity-100" 
                    : "!left-4 opacity-0 group-hover/carousel:opacity-100"
                )}
              />
              <CarouselNext 
                className={cn(
                  "!h-10 !w-10 bg-background/90 backdrop-blur-sm border-2 shadow-lg z-10 rounded-full",
                  "hover:bg-background hover:scale-110 active:scale-95 transition-all",
                  "touch-manipulation", // Better touch handling
                  isMobile 
                    ? "!right-2 opacity-100" 
                    : "!right-4 opacity-0 group-hover/carousel:opacity-100"
                )}
              />
            </>
          )}
        </Carousel>
      </div>
    </div>
  );
}

