// CollectionsView.tsx
import { useLanguage } from "@/context/language-context";
import { Button } from "@/components/ui/button";
import { Library, Plus, Music, Trash2, Play } from "lucide-react";
import { storage } from "@/lib/storage";
import { Playlist } from "@/types";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
        title: t("playlistDeleted"),
        description: t("playlistDeleted"),
      });
    } catch (error) {
      console.error("Error deleting playlist:", error);
      toast({
        title: t("error"),
        description: t("error") + " " + t("tryAgain"),
        variant: "destructive",
      });
    }
  };

  if (playlists.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          icon={<Library className="h-8 w-8 text-primary" />}
          title={t("collections")}
          subtitle={t("myPlaylists")}
          iconBgClass="bg-primary/10"
        />
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
          <div className="p-6 rounded-full bg-muted/50">
            <Library className="h-16 w-16 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">{t("noPlaylists")}</h2>
            <p className="text-muted-foreground max-w-md">
              {t("noPlaylistsDescription")}
            </p>
          </div>
          <Button onClick={() => navigate("/make-playlist")}>
            <Plus className="mr-2 h-4 w-4" />
            {t("createPlaylist")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          icon={<Library className="h-8 w-8 text-primary" />}
          title={t("collections")}
          subtitle={`${playlists.length} ${playlists.length === 1 ? "playlist" : "playlists"}`}
          iconBgClass="bg-primary/10"
        />
        <Button onClick={() => navigate("/make-playlist")} className="hidden sm:flex">
          <Plus className="mr-2 h-4 w-4" />
          {t("createPlaylist")}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {playlists.map((playlist) => (
          <Card 
            key={playlist.id} 
            className="group hover:shadow-lg transition-all cursor-pointer hover:scale-[1.02]"
            onClick={() => navigate(`/playlist/${playlist.id}`)}
          >
            <CardHeader className="p-0">
              <div className="relative aspect-square overflow-hidden rounded-t-lg bg-muted">
                <img
                  src={playlist.coverUrl}
                  alt={playlist.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/playlist/${playlist.id}`);
                    }}
                    className="h-10 w-10 text-white hover:bg-white/20 flex items-center justify-center"
                  >
                    <Play className="h-5 w-5 fill-white" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePlaylist(playlist.id);
                    }}
                    className="h-10 w-10 flex items-center justify-center"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <CardTitle className="text-base truncate">{playlist.name}</CardTitle>
              <CardDescription className="text-sm">
                {playlist.tracks.length} {playlist.tracks.length === 1 ? t("track") : t("tracks")}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center sm:hidden">
        <Button onClick={() => navigate("/make-playlist")} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Yeni Playlist
        </Button>
      </div>
    </div>
  );
}