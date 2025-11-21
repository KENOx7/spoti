import { useLanguage } from "@/context/language-context";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Play } from "lucide-react";
import { storage } from "@/lib/storage";
import { Playlist } from "@/types";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaylistCarousel } from "@/components/PlaylistCarousel";

export default function CollectionsView() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  useEffect(() => {
    setPlaylists(storage.getPlaylists());
  }, []);

  const handleDeletePlaylist = (playlistId: string) => {
    try {
      const updated = playlists.filter((p) => p.id !== playlistId);
      storage.savePlaylists(updated);
      setPlaylists(updated);
      toast({
        title: t("playlistDeleted") || "Pleylist silindi",
        description: t("playlistDeleted") || "Uğurla silindi",
      });
    } catch (error) {
      console.error("Error deleting playlist:", error);
      toast({
        title: t("error") || "Xəta",
        description: t("error") + " " + t("tryAgain"),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{t("collections")}</h1>
        <Button onClick={() => navigate("/make-playlist")} className="hidden sm:flex">
          <Plus className="mr-2 h-4 w-4" />
          {t("createPlaylist")}
        </Button>
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
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="icon"
                      className="h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
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
                      className="h-10 w-10 rounded-full shadow-lg translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="text-base truncate mb-1">{playlist.name}</CardTitle>
                <CardDescription className="text-xs">
                  {/* DÜZƏLİŞ: tracks.length üçün yoxlama */}
                  {playlist.tracks?.length || 0} {playlist.tracks?.length === 1 ? t("track") : t("tracks")}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-muted-foreground mb-4">{t("emptyPlaylist") || "Pleylist yoxdur"}</p>
          <Button onClick={() => navigate("/make-playlist")}>
            <Plus className="mr-2 h-4 w-4" />
            {t("createPlaylist")}
          </Button>
        </div>
      )}

      <div className="flex justify-center sm:hidden">
        <Button onClick={() => navigate("/make-playlist")} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          {t("createPlaylist")}
        </Button>
      </div>
    </div>
  );
}
