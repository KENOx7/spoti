import { useLanguage } from "@/context/language-context";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Play, Import, RefreshCw } from "lucide-react";
import { storage } from "@/lib/storage";
import { Playlist } from "@/types";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { fetchSpotifyPlaylists } from "@/lib/spotify";

export default function CollectionsView() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session } = useAuth();
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
        title: "Xəta",
        description: "Spotify bağlantısı yoxdur. Yenidən giriş edin.",
      });
      return;
    }

    setIsImporting(true);
    try {
      const spotifyPlaylists = await fetchSpotifyPlaylists(accessToken);
      
      if (spotifyPlaylists.length === 0) {
        toast({ title: "Məlumat", description: "Spotify-da playlist tapılmadı." });
      } else {
        const currentPlaylists = storage.getPlaylists();
        const uniqueNewPlaylists = spotifyPlaylists.filter(
          newP => !currentPlaylists.some(currP => currP.id === newP.id)
        );
        const newAllPlaylists = [...currentPlaylists, ...uniqueNewPlaylists];
        
        storage.savePlaylists(newAllPlaylists);
        setPlaylists(newAllPlaylists);
        
        toast({
          title: "Uğurlu!",
          description: `${uniqueNewPlaylists.length} yeni playlist yükləndi!`,
        });
      }
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Xəta", description: "Import xətası." });
    } finally {
      setIsImporting(false);
    }
  };

  const handleDeletePlaylist = (playlistId: string) => {
    try {
      const updated = playlists.filter((p) => p.id !== playlistId);
      storage.savePlaylists(updated);
      setPlaylists(updated);
      toast({ title: t("playlistDeleted"), description: t("playlistDeleted") });
    } catch (error) {
      toast({ title: t("error"), variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">{t("collections")}</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            variant="secondary" 
            onClick={handleImportSpotify} 
            disabled={isImporting}
            className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white"
          >
            {isImporting ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Import className="mr-2 h-4 w-4" />}
            {isImporting ? "Yüklənir..." : "Spotify İdxal"}
          </Button>
          <Button onClick={() => navigate("/make-playlist")} className="flex-1 sm:flex-none">
            <Plus className="mr-2 h-4 w-4" />
            {t("createPlaylist")}
          </Button>
        </div>
      </div>

      {playlists.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {playlists.map((playlist) => (
            <Card 
              key={playlist.id} 
              className="group cursor-pointer hover:bg-accent/50 transition-colors overflow-hidden border-border/50"
              onClick={() => navigate(`/playlist/${playlist.id}`)}
            >
              <CardHeader className="p-0">
                <div className="aspect-square w-full relative overflow-hidden">
                  <img 
                    src={playlist.coverUrl || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=60"} 
                    alt={playlist.name}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* MOBİL DÜZƏLİŞ: opacity-100 (mobildə görünür), sm:opacity-0 (PC-də gizli) */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 
                                  opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                    <Button
                      size="icon"
                      className="h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/playlist/${playlist.id}`);
                      }}
                    >
                      <Play className="h-5 w-5 ml-0.5" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePlaylist(playlist.id);
                      }}
                      className="h-10 w-10 rounded-full shadow-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="text-base truncate mb-1">{playlist.name}</CardTitle>
                <CardDescription className="text-xs">
                  {playlist.tracks?.length || 0} {playlist.tracks?.length === 1 ? t("track") : t("tracks")}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-muted-foreground mb-4">{t("emptyPlaylist")}</p>
          <Button onClick={() => navigate("/make-playlist")}>
            <Plus className="mr-2 h-4 w-4" />
            {t("createPlaylist")}
          </Button>
        </div>
      )}
    </div>
  );
}