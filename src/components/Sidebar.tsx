// src/components/Sidebar.tsx
import { NavLink } from "react-router-dom";
import {
  Home,
  LayoutGrid,
  Heart,
  Sparkles,
  Music,
  PlusCircle,
  Settings,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/language-context";
import { SidebarLink } from "./SidebarLink";
import { LanguageSwitcher } from "./LanguageSwitcher"; 

export function Sidebar() {
  const { t } = useLanguage();

  return (
    <aside
      className={cn(
        "hidden md:flex", // Mobildə gizlənir, böyük ekranda görünür
        "fixed inset-y-0 left-0 z-50 w-60",
        "flex-col border-r border-[hsl(var(--sidebar-border))]",
        "bg-[hsl(var(--sidebar-background))]",
        "text-[hsl(var(--sidebar-foreground))]"
      )}
    >
      <div className="flex h-full max-h-screen flex-col gap-2">
        {/* === Logo/Başlıq === */}
        <div className="flex h-16 items-center border-b border-[hsl(var(--sidebar-border))] px-6">
          <NavLink to="/" className="flex items-center gap-2 font-bold">
            <Music className="h-6 w-6 text-primary" />
            <span className="">{t("appName") || "Musiqi"}</span>
          </NavLink>
        </div>

        {/* === Əsas Naviqasiya === */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {/* === DÜZƏLİŞ: Səhv yazılış 'SiderbarLink' 'SidebarLink' ilə əvəz edildi === */}
          <SidebarLink href="/" icon={<Home className="h-4 w-4" />}>
            {t("home")}
          </SidebarLink>
          <SidebarLink href="/charts" icon={<LayoutGrid className="h-4 w-4" />}>
            {t("charts")}
          </SidebarLink>
          <SidebarLink href="/liked" icon={<Heart className="h-4 w-4" />}>
            {t("likedSongs")}
          </SidebarLink>
          <SidebarLink href="/collections" icon={<LayoutGrid className="h-4 w-4" />}>
            {t("collections")}
          </SidebarLink>
          <SidebarLink href="/recently-added" icon={<Music className="h-4 w-4" />}>
            {t("recentlyAdded")}
          </SidebarLink>
          <SidebarLink href="/ask-ai" icon={<Sparkles className="h-4 w-4" />}>
            {t("askAI")}
          </SidebarLink>
          <SidebarLink href="/make-playlist" icon={<PlusCircle className="h-4 w-4" />}>
            {t("makePlaylist")}
          </SidebarLink>
        </nav>

        {/* === Alt Naviqasiya (Hesab, Tənzimləmələr) === */}
        <nav className="mt-auto border-t border-[hsl(var(--sidebar-border))] px-4 py-4 space-y-1">
          <SidebarLink href="/settings" icon={<Settings className="h-4 w-4" />}>
            {t("settings")}
          </SidebarLink>
          <SidebarLink href="/account" icon={<User className="h-4 w-4" />}>
            {t("account")}
          </SidebarLink>
          <div className="pt-2">
            <LanguageSwitcher />
          </div>
        </nav>
      </div>
    </aside>
  );
}