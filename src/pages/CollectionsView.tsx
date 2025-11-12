// CollectionsView.tsx
import { useLanguage } from "@/context/language-context";
import { Button } from "@/components/ui/button";
import { Library, Plus } from "lucide-react";

export default function CollectionsView() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
      <div className="p-6 rounded-full bg-muted/50">
        <Library className="h-16 w-16 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{t("collections")}</h2>
        <p className="text-muted-foreground max-w-md">
          Your music collections will appear here. Create playlists and organize your favorite tracks.
        </p>
      </div>
      <Button>
        <Plus className="mr-2 h-4 w-4" />
        {t("createPlaylist") || "Create Playlist"}
      </Button>
    </div>
  );
}