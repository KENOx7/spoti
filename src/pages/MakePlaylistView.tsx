// src/pages/MakePlaylistView.tsx
import { useState } from "react";
import { Button } from "ui/button";
import { Input } from "ui/input";
import { Textarea } from "ui/textarea";
import { PlusCircle, Music } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { storage } from "@/lib/storage";
import { Playlist } from "@/types";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/context/language-context";
import { PageHeader } from "@/components/PageHeader";

export default function MakePlaylistView() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [playlistName, setPlaylistName] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreatePlaylist = () => {
    if (!playlistName.trim()) {
      toast({
        title: t("error"),
        description: t("playlistName") + " " + t("error"),
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    try {
      const playlists = storage.getPlaylists();
      const newPlaylist: Playlist = {
        id: `playlist-${Date.now()}`,
        name: playlistName.trim(),
        description: description.trim() || undefined,
        coverUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=300&fit=crop",
        tracks: [],
        createdAt: new Date(),
      };

      storage.savePlaylists([...playlists, newPlaylist]);

      toast({
        title: t("playlistCreated"),
        description: `"${playlistName}" ${t("playlistCreated")}`,
      });

      setPlaylistName("");
      setDescription("");
      
      // Navigate to collections after a short delay
      setTimeout(() => {
        navigate("/collections");
      }, 1000);
    } catch (error) {
      console.error("Error creating playlist:", error);
      toast({
        title: t("error"),
        description: t("error") + " " + t("tryAgain"),
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        icon={<PlusCircle className="h-8 w-8 text-primary" />}
        title={t("createPlaylist")}
        subtitle={t("createPlaylist")}
        iconBgClass="bg-primary/10"
      />

      {/* Playlist Formu */}
      <div className="p-6 bg-card rounded-lg border border-border space-y-4">
        <Input 
          placeholder={t("playlistName")} 
          className="text-lg"
          value={playlistName}
          onChange={(e) => setPlaylistName(e.target.value)}
        />
        <Textarea
          placeholder={t("playlistDescription")}
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Button 
          size="lg" 
          className="w-full" 
          onClick={handleCreatePlaylist}
          disabled={isCreating || !playlistName.trim()}
        >
          <Music className="mr-2 h-4 w-4" />
          {isCreating ? t("save") + "..." : t("createPlaylist")}
        </Button>
      </div>
    </div>
  );
}