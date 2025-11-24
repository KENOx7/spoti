// src/pages/CollectionsView.tsx
import { useLanguage } from "@/context/language-context";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Play, Import } from "lucide-react";
import { storage } from "@/lib/storage";
import { Playlist } from "@/types";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { fetchSpotifyPlaylists } from "@/lib/spotify";
import { usePlayer } from "@/context/player-context"; // YENİ: import etdik

export default function CollectionsView() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session } = useAuth();
  
  // Player context-dən bunları götürürük
  const { playTrack, setQueue } = usePlayer();

  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    setPlaylists(storage.getPlaylists());
  }, []);

  const handleImportSpotify = async () => {
    const accessToken = session?.provider_token;

    if (!accessToken) {
      toast({
        variant: "destructive",
        title: t("error"),
        description: "Spotify account not connected. Please login again.",
      });
      return;
    }

    setIsImporting(true);
    try {
      const spotifyPlaylists = await fetchSpotifyPlaylists(accessToken);
      
      if (spotifyPlaylists.length === 0) {
        toast({ title: t("info"), description: "No playlists found." });
      } else {
        const currentPlaylists = storage.getPlaylists();
        const newPlaylists = [...currentPlaylists, ...spotifyPlaylists];
        // Dublikatları təmizlə
        const uniquePlaylists = newPlaylists.filter((v,i,a)=>a.findIndex(v2=>(v2.id===v.id))===i);
        
        storage.savePlaylists(uniquePlaylists);
        setPlaylists(uniquePlaylists);
        toast({ title: t("success"), description: `${spotifyPlaylists.length} playlists imported.` });
      }
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: t("error"), description: "Import failed." });
    } finally {
      setIsImporting(false);
    }
  };

  const handleDeletePlaylist = (id: string) => {
    const updated = playlists.filter(p => p.id !== id);
    storage.savePlaylists(updated);
    setPlaylists(updated);
  };

  // --- VACİB: PLAYLIST PLAY FUNKSİYASI ---
  const handlePlayPlaylist = (e: React.MouseEvent, playlist: Playlist) => {
    e.stopPropagation(); // Karta kliklənməsinin qarşısını al
    if (playlist.tracks && playlist.tracks.length > 0) {
        // 1. Queue-nu yenilə ki, next/prev işləsin
        setQueue(playlist.tracks);
        // 2. İlk mahnını çal
        playTrack(playlist.tracks[0]);
    } else {
        toast({ description: "This playlist is empty." });
    }
  };

  return (
    <div className="pb-32 px-4 animate-in fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{t("collections")}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleImportSpotify} disabled={isImporting}>
            <Import className="mr-2 h-4 w-4" />
            {isImporting ? "..." : "Import Spotify"}
          </Button>
          <Button onClick={() => navigate("/make-playlist")}>
            <Plus className="mr-2 h-4 w-4" />
            {t("createPlaylist")}
          </Button>
        </div>
      </div>

      {playlists.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {playlists.map((playlist) => (
            <Card 
              key={playlist.id} 
              className="group cursor-pointer hover:bg-white/5 transition-all border-white/10"
              onClick={() => navigate(`/playlist/${playlist.id}`)}
            >
              <CardHeader className="p-0 relative aspect-square">
                 <img 
                   src={playlist.coverUrl || "/placeholder.svg"} 
                   alt={playlist.name} 
                   className="w-full h-full object-cover rounded-t-lg"
                 />
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {/* Play Button */}
                    <Button
                      size="icon"
                      className="rounded-full h-12 w-12 bg-primary hover:bg-primary/90 shadow-xl"
                      onClick={(e) => handlePlayPlaylist(e, playlist)}
                    >
                      <Play className="h-5 w-5 ml-0.5 fill-current" />
                    </Button>
                    
                    {/* Delete Button */}
                    <Button
                      variant="destructive"
                      size="icon"
                      className="rounded-full h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePlaylist(playlist.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                 </div>
              </CardHeader>
              <CardContent className="p-3">
                <CardTitle className="truncate text-sm font-medium">{playlist.name}</CardTitle>
                <CardDescription className="text-xs">
                  {playlist.tracks?.length || 0} {t("tracks")}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-muted-foreground mb-4">{t("emptyPlaylist")}</p>
        </div>
      )}
    </div>
  );
}