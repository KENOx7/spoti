import { usePlayer } from "@/context/player-context";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, Repeat, Shuffle, Loader2, Maximize2 } from "lucide-react";
import ReactPlayer from "react-player/youtube";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Player() {
  const {
    currentTrack,
    isPlaying,
    youtubeUrl,
    volume,
    isLoading,
    togglePlayPause,
    playNext,
    playPrevious,
    setVolume,
    setIsPlaying,
    likedTracks,
    toggleLike,
    toggleRepeat,
    toggleShuffle,
    repeatMode,
    isShuffled
  } = usePlayer();

  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [isVideoVisible, setIsVideoVisible] = useState(false); // Videonu göstər/gizlət

  if (!currentTrack) return null;

  const isLiked = likedTracks.some((t) => t.id === currentTrack.id);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border p-2 sm:p-3 z-50">
      
      {/* GİZLİ YOUTUBE PLAYER (Mühərrik) */}
      <div className={cn("fixed bottom-24 right-4 w-64 h-36 rounded-lg overflow-hidden shadow-2xl border border-white/10 transition-all duration-300", 
          isVideoVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none h-0 w-0"
      )}>
        {youtubeUrl && (
          <ReactPlayer
            url={youtubeUrl}
            playing={isPlaying}
            volume={volume}
            width="100%"
            height="100%"
            onProgress={(state) => {
              if (!isSeeking) {
                setProgress(state.played * 100);
                setPlayedSeconds(state.playedSeconds);
              }
            }}
            onDuration={setDuration}
            onEnded={playNext}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            config={{
              playerVars: { showinfo: 0, controls: 0, modestbranding: 1 }
            }}
          />
        )}
      </div>

      <div className="max-w-screen-xl mx-auto flex items-center justify-between gap-4">
        
        {/* 1. MAHNı MƏLUMATI (Sol) */}
        <div className="flex items-center gap-3 w-1/3 min-w-0">
          {/* Videonu açmaq üçün şəkilə klikləmə imkanı */}
          <div 
            className="relative group cursor-pointer"
            onClick={() => setIsVideoVisible(!isVideoVisible)}
          >
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className="h-12 w-12 rounded-md object-cover shadow-md group-hover:opacity-80 transition-opacity"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Maximize2 className="w-4 h-4 text-white drop-shadow-md" />
            </div>
          </div>
          
          <div className="min-w-0 overflow-hidden">
            <h3 className="font-semibold text-sm truncate">{currentTrack.title}</h3>
            <p className="text-xs text-muted-foreground truncate">{currentTrack.artist}</p>
          </div>
          
          <Button variant="ghost" size="icon" onClick={() => toggleLike(currentTrack)} className={isLiked ? "text-primary" : "text-muted-foreground"}>
            <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
          </Button>
        </div>

        {/* 2. İDARƏETMƏ (Orta) */}
        <div className="flex flex-col items-center w-1/3 max-w-md">
          <div className="flex items-center gap-2 mb-1">
            <Button variant="ghost" size="icon" onClick={toggleShuffle} className={isShuffled ? "text-primary" : "text-muted-foreground"}>
              <Shuffle className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={playPrevious}>
              <SkipBack className="h-5 w-5 fill-current" />
            </Button>
            
            <Button size="icon" className="h-10 w-10 rounded-full" onClick={togglePlayPause} disabled={!youtubeUrl && isLoading}>
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
            </Button>

            <Button variant="ghost" size="icon" onClick={playNext}>
              <SkipForward className="h-5 w-5 fill-current" />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleRepeat} className={repeatMode !== "off" ? "text-primary" : "text-muted-foreground"}>
              <Repeat className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2 w-full">
            <span className="text-xs text-muted-foreground w-8 text-right">{formatTime(playedSeconds)}</span>
            <Slider
              value={[progress]}
              max={100}
              step={0.1}
              className="flex-1 h-1.5"
              onValueChange={(val) => { setIsSeeking(true); setProgress(val[0]); }}
              onValueCommit={(val) => {
                 // ReactPlayer üçün seek funksiyası burada mürəkkəb ola bilər
                 // Sadəlik üçün yalnız vizual dəyişir, amma player obyektinə çatmaq üçün ref lazımdır.
                 // Hələlik buranı sadə saxlayırıq.
                 setIsSeeking(false);
              }}
            />
            <span className="text-xs text-muted-foreground w-8">{formatTime(duration)}</span>
          </div>
        </div>

        {/* 3. SƏS (Sağ) */}
        <div className="hidden md:flex items-center justify-end gap-2 w-1/3">
          <Volume2 className="h-4 w-4 text-muted-foreground" />
          <Slider
            value={[volume * 100]}
            max={100}
            step={1}
            className="w-24"
            onValueChange={(val) => setVolume(val[0] / 100)}
          />
        </div>
      </div>
    </div>
  );
}
