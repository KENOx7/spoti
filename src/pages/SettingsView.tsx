// src/pages/SettingsView.tsx
import { Settings, Palette, Globe, Bell } from "lucide-react";
import { Switch } from "ui/switch";
import { Label } from "ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "ui/select";
import { useTheme } from "@/context/theme-provider";
import { useLanguage } from "@/context/language-context";
import { PageHeader } from "@/components/PageHeader";
import { useState } from "react";

export default function SettingsView() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [notifyNewReleases, setNotifyNewReleases] = useState(true);
  const [notifyArtistUpdates, setNotifyArtistUpdates] = useState(false);
  
  const toggleTheme = (isDarkMode: boolean) => {
    setTheme(isDarkMode ? "dark" : "light");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <PageHeader
        icon={<Settings className="h-8 w-8 text-primary" />}
        title={t("settings")}
        subtitle={t("settings") + " - " + t("appearance")}
        iconBgClass="bg-primary/10"
      />

      <div className="space-y-6">
        {/* Appearance Settings */}
        <div className="p-6 bg-card rounded-lg border border-border space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Palette className="h-5 w-5" />
            {t("appearance")}
          </h2>
          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode" className="text-base">{t("darkMode")}</Label>
            <Switch 
              id="dark-mode" 
              checked={theme === "dark"} 
              onCheckedChange={toggleTheme}
            />
          </div>
        </div>

        {/* Language Settings */}
        <div className="p-6 bg-card rounded-lg border border-border space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {t("language")}
          </h2>
          <Select value={language} onValueChange={(value) => setLanguage(value as "en" | "az")}>
            <SelectTrigger>
              <SelectValue placeholder={t("language")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">ᴇɴ English</SelectItem>
              <SelectItem value="az">🇦🇿 Azərbaycanca</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notifications */}
        <div className="p-6 bg-card rounded-lg border border-border space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {t("notifications")}
          </h2>
          <div className="flex items-center justify-between">
            <Label htmlFor="new-release" className="text-base">{t("newReleases")}</Label>
            <Switch 
              id="new-release" 
              checked={notifyNewReleases}
              onCheckedChange={setNotifyNewReleases}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="artist-updates" className="text-base">{t("artistUpdates")}</Label>
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