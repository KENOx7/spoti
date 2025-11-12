// src/pages/SettingsView.tsx
import { useState } from "react";
import { Settings, Palette, Globe, Bell } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "@/context/theme-provider";

export default function SettingsView() {
  const { theme, setTheme } = useTheme();

  const [language, setLanguage] = useState("az");
  const [notifyNewReleases, setNotifyNewReleases] = useState(true);
  const [notifyArtistUpdates, setNotifyArtistUpdates] = useState(false);
  
  const toggleTheme = (isDarkMode: boolean) => {
    setTheme(isDarkMode ? "dark" : "light");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Səhifə Başlığı */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-muted/50">
          <Settings className="h-8 w-8 text-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Tənzimləmələr</h1>
          <p className="text-muted-foreground">Proqramın tənzimləmələrini idarə edin.</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Görünüş Tənzimləmələri */}
        <div className="p-6 bg-card rounded-lg space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Görünüş
          </h2>
          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode" className="text-base">Qaranlıq Mod</Label>
            <Switch 
              id="dark-mode" 
              checked={theme === "dark"} 
              onCheckedChange={toggleTheme}
            />
          </div>
        </div>

        {/* Dil Tənzimləmələri */}
        <div className="p-6 bg-card rounded-lg space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Dil
          </h2>
          {/* === DÜZƏLİŞ BURADADIR === */}
          <Select value={language} onValueChange={setLanguage}>
          {/* ========================== */}
            <SelectTrigger>
              <SelectValue placeholder="Dil Seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="az">Azərbaycanca</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bildirişlər */}
        <div className="p-6 bg-card rounded-lg space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Bildirişlər
          </h2>
          <div className="flex items-center justify-between">
            <Label htmlFor="new-release" className="text-base">Yeni Mahnılar</Label>
            <Switch 
              id="new-release" 
              checked={notifyNewReleases}
              onCheckedChange={setNotifyNewReleases}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="artist-updates" className="text-base">Sənətçi Yeniləmələri</Label>
            <Switch 
              id="artist-updates" 
              checked={notifyArtistUpdates}
              onCheckedChange={setNotifyArtistUpdates}
            />
          </div>
        </div>
      </div>
    </div>
  );
}