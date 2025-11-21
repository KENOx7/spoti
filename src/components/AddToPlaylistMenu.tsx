import { useState, useEffect } from "react";
import { Track } from "@/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Music, Play } from "lucide-react";
import { storage } from "@/lib/storage";
import { Playlist } from "@/types";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/language-context";

interface AddToPlaylistMenuProps {
  track: Track;
}

export function AddToPlaylistMenu({ track }: AddToPlaylistMenuProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    setPlaylists(storage.getPlaylists());
  }, []);

  const handleAddToPlaylist = (playlistId: string) => {
    const playlist = playlists.find((p) => p.id === playlistId);
    if (!playlist) return;

    // Check if track already exists
    const trackExists = playlist.tracks.some((t) => t.id === track.id);
    if (trackExists) {
      toast({
        title: t("trackAlreadyInPlaylist"),
        description: `"${track.title}" ${t("trackAlreadyInPlaylist")}`,
      });
      return;
    }

    // Optimistic update - immediately update UI
    const previousPlaylists = [...playlists];
    const updatedPlaylists = playlists.map((p) => {
      if (p.id === playlistId) {
        return {
          ...p,
          tracks: [...p.tracks, track],
        };
      }
      return p;
    });

    setPlaylists(updatedPlaylists);

    try {
      // Persist to storage
      storage.savePlaylists(updatedPlaylists);
      toast({
        title: t("trackAdded"),
        description: `"${track.title}" ${t("trackAdded")}`,
      });
    } catch (error) {
      console.error("Error adding track to playlist:", error);
      // Rollback on error
      setPlaylists(previousPlaylists);
      toast({
        title: t("error"),
        description: t("error") + " " + t("tryAgain"),
        variant: "destructive",
      });
    }
  };

  if (playlists.length === 0) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
            <Plus className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>{t("addToPlaylist")}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate("/make-playlist")} className="cursor-pointer">
            <Plus className="mr-2 h-4 w-4" />
            {t("createPlaylist")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-start">
          <Plus className="mr-2 h-4 w-4" />
          Playlistə Əlavə Et
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{t("addToPlaylist")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {playlists.map((playlist) => {
          const trackInPlaylist = playlist.tracks.some((t) => t.id === track.id);
          return (
            <DropdownMenuItem
              key={playlist.id}
              onClick={() => handleAddToPlaylist(playlist.id)}
              disabled={trackInPlaylist}
              className="cursor-pointer"
            >
              <Music className="mr-2 h-4 w-4" />
              <span className="truncate flex-1">{playlist.name}</span>
              {trackInPlaylist && (
                <span className="ml-auto text-xs text-primary">✓</span>
              )}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => navigate("/make-playlist")}
          className="cursor-pointer"
        >
          <Plus className="mr-2 h-4 w-4" />
          {t("createPlaylist")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

