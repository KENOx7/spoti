// src/pages/MakePlaylistView.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Music } from "lucide-react";
// DÜZƏLİŞ: useLanguage hooku müvəqqəti yığışdırıldı

export default function MakePlaylistView() {
  // DÜZƏLİŞ: Form üçün state-lər əlavə edildi
  const [playlistName, setPlaylistName] = useState("");
  const [description, setDescription] = useState("");

  const handleCreatePlaylist = () => {
    if (!playlistName) {
      alert("Playlist adı mütləqdir.");
      return;
    }
    console.log("Yeni playlist yaradılır:", {
      name: playlistName,
      description: description,
    });
    // Burada real API sorğusu və ya yönləndirmə olacaq
    alert(`"${playlistName}" adlı playlist yaradıldı! (konsola baxın)`);
    setPlaylistName("");
    setDescription("");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Səhifə Başlığı */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-primary/10">
          <PlusCircle className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Yeni Playlist Yarat</h1>
          <p className="text-muted-foreground">Yeni playlistinizi yaratmaq üçün məlumatları daxil edin.</p>
        </div>
      </div>

      {/* Playlist Formu */}
      <div className="p-6 bg-card rounded-lg space-y-4">
        <Input 
          placeholder="Playlist Adı" 
          className="text-lg"
          value={playlistName}
          onChange={(e) => setPlaylistName(e.target.value)}
        />
        <Textarea
          placeholder="Təsvir əlavə edin (könüllü)..."
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Button size="lg" className="w-full" onClick={handleCreatePlaylist}>
          <Music className="mr-2 h-4 w-4" />
          Playlist Yarat
        </Button>
      </div>
    </div>
  );
}