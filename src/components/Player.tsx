// src/components/Player.tsx
import { usePlayer } from "@/context/player-context";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, Heart, 
  Shuffle, Repeat, Repeat1, Loader2, Maximize2 
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Track } from "@/types"; 
import { cn } from "@/lib/utils"; 
import ReactPlayer from "react-player"; // Standart import
import { useNavigate } from "react-router-dom";

// Typescript xətalarını keçmək üçün
const ReactPlayerCast = ReactPlayer as any;

export function Player() {
  const {
    currentTrack,
    isPlaying,
    volume,
    currentTime,
    duration,
    isBuffering,
    seekToTime,
    setSeekToTime,
    togglePlayPause,
    setVolume,
    handleSeek, 
    playNext,
    playPrevious,
    toggleRepeat,
    toggleShuffle,
    repeatMode,
    isShuffled,
    likedTracks, 
    toggleLike,
    reportProgress,
    reportDuration,
    reportEnded,
    reportReady
  } = usePlayer();

  const [localTime, setLocalTime] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [isVideoVisible, setIsVideoVisible] = useState(true); // Video default olaraq görünür
  
  const playerRef = useRef<any>(null);
  const navigate = useNavigate();

  // Seek əmri gələndə
  useEffect(() => {
    if (seekToTime !== null && playerRef.current) {
      playerRef.current.seekTo(seekToTime);
      setSeekToTime(null);
    }
  }, [seekToTime, setSeekToTime]);

  // UI Progress bar yenilənməsi
  useEffect(() => {
    if (!isSeeking) {
      setLocalTime(currentTime);
    }
  }, [currentTime, isSeeking]);

  const onSeekChange = (value: number[]) => {
    setLocalTime(value[0]);
    setIsSeeking(true);
  };

  const onSeekCommit = (value: number[]) => {
    handleSeek(value[0]);
    setIsSeeking(false);
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!currentTrack) return null;

  const isLiked = likedTracks.some((t: Track) => t.id === currentTrack.id);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border p-2 sm:p-3 z-50 safe-area-bottom shadow-2xl">
      
      <div className="max-w-screen-xl mx-auto flex items-center justify-between gap-2 sm:gap-4 h-full">
        
        {/* SOL TƏRƏF: VİDEO VƏ İNFO */}
        <div className="flex items-center gap-3 w-1/3 min-w-0">
          
          {/* Kiçik Video Pəncərəsi (Last.fm tərzi) */}
          <div className="relative group shrink-0 h-14 w-24 sm:h-16 sm:w-28 bg-black rounded-md overflow-hidden border border-white/10 shadow-lg">
            
            {/* ReactPlayer burada "gizli" deyil, kiçik iframe kimi görünür */}
            <ReactPlayerCast
              ref={playerRef}
              url={currentTrack.videoUrl || `ytsearch:${currentTrack.artist} ${currentTrack.title} audio`}
              playing={isPlaying}
              volume={volume}
              muted={false}
              width="100%"
              height="100%"
              style={{ 
                position: "absolute", 
                top: 0, 
                left: 0, 
                objectFit: "cover",
                visibility: isVideoVisible ? "visible" : "hidden",
                pointerEvents: "none" // Video üzərinə klikləməyi qadağan edir (UI-dan idarə etmək üçün)
              }}
              // Events
              onProgress={(state: any) => {
                if (!isSeeking && state.playedSeconds) {
                  reportProgress(state.playedSeconds, state.loadedSeconds || 0);
                }
              }}
              onDuration={reportDuration}
              onEnded={reportEnded}
              onReady={reportReady}
              onBuffer={() => console.log("Buffering...")}
              // Config
              config={{
                youtube: {
                  playerVars: { 
                    showinfo: 0, 
                    controls: 0, 
                    modestbranding: 1, 
                    origin: window.location.origin,
                    iv_load_policy: 3, // Annotasiyaları gizlət
                    rel: 0 // Oxşar videoları gizlət (qismən)
                  }
                }
              }}
            />
            
            {/* Videonu bağlasaq Cover şəkli görünsün */}
            {!isVideoVisible && (
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className={cn(
                  "absolute inset-0 h-full w-full object-cover z-10",
                  isPlaying ? "animate-pulse-slow" : ""
                )}
              />
            )}

            {/* Video/Cover dəyişmək üçün düymə (Hover edəndə) */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20 cursor-pointer" onClick={() => setIsVideoVisible(!isVideoVisible)}>
                 <Maximize2 className="text-white h-5 w-5" />
            </div>
          </div>

          <div className="min-w-0 overflow-hidden flex flex-col justify-center">
            <h3 
              className="font-semibold text-xs sm:text-sm truncate hover:underline cursor-pointer"
              onClick={() => navigate(`/playlist/album`)}
            >
              {currentTrack.title}
            </h3>
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
              {currentTrack.artist}
            </p>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "hidden md:flex h-8 w-8",
              isLiked ? "text-primary" : "text-muted-foreground"
            )}
            onClick={() => toggleLike(currentTrack)}
          >
            <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
          </Button>
        </div>

        {/* ORTA: İDARƏETMƏ (PLAY/PAUSE) */}
        <div className="flex flex-col items-center w-auto sm:w-1/3 max-w-md absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 sm:relative sm:left-auto sm:top-auto sm:transform-none">
          <div className="flex items-center gap-3 sm:gap-5 mb-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleShuffle}
              className={cn("hidden sm:flex h-8 w-8", isShuffled ? "text-primary" : "text-muted-foreground")}
            >
              <Shuffle className="h-4 w-4" />
            </Button>

            <Button variant="ghost" size="icon" onClick={playPrevious} className="h-9 w-9">
              <SkipBack className="h-5 w-5 fill-current" />
            </Button>

            <Button
              size="icon"
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-full shadow-xl bg-white text-black hover:bg-white/90 hover:scale-105 transition-all"
              onClick={togglePlayPause}
              disabled={isBuffering}
            >
              {isBuffering ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : isPlaying ? (
                <Pause className="h-5 w-5 fill-current" />
              ) : (
                <Play className="h-5 w-5 fill-current ml-0.5" />
              )}
            </Button>

            <Button variant="ghost" size="icon" onClick={playNext} className="h-9 w-9">
              <SkipForward className="h-5 w-5 fill-current" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleRepeat}
              className={cn("hidden sm:flex h-8 w-8", repeatMode !== "off" ? "text-primary" : "text-muted-foreground")}
            >
              {repeatMode === "one" ? <Repeat1 className="h-4 w-4" /> : <Repeat className="h-4 w-4" />}
            </Button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-96">
            <span className="text-[10px] text-muted-foreground w-9 text-right tabular-nums hidden sm:block">
              {formatTime(localTime)}
            </span>
            <Slider
              value={[localTime]}
              max={duration || 100}
              step={1}
              className="w-32 sm:flex-1 cursor-pointer h-1.5"
              onValueChange={onSeekChange}
              onValueCommit={onSeekCommit}
            />
            <span className="text-[10px] text-muted-foreground w-9 tabular-nums hidden sm:block">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* SAĞ: SƏS */}
        <div className="hidden sm:flex items-center justify-end gap-2 w-1/3">
          <Volume2 className="h-4 w-4 text-muted-foreground" />
          <Slider
            value={[volume * 100]}
            max={100}
            step={1}
            className="w-24"
            onValueChange={([value]) => setVolume(value / 100)}
          />
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          className={cn("flex sm:hidden h-8 w-8 ml-auto", isLiked ? "text-primary" : "text-muted-foreground")}
          onClick={() => toggleLike(currentTrack)}
        >
          <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
        </Button>

      </div>
    </div>
  );
}
