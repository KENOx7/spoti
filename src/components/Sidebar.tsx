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
import logo from "@/logo.png";

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function SidebarLink({ href, icon, children }: SidebarLinkProps) {
  return (
    <NavLink
      to={href}
      className={({ isActive }) =>
        cn(
          "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300",
          "hover:bg-primary/10 hover:text-primary hover:shadow-[0_0_15px_rgba(167,63,255,0.15)] hover:translate-x-1",
          isActive
            ? "bg-gradient-to-r from-primary/20 to-transparent text-primary shadow-[inset_2px_0_0_0_hsl(var(--primary))]"
            : "text-muted-foreground"
        )
      }
    >
      <span className="relative z-10 flex items-center gap-3">
        {icon}
        <span className="font-light tracking-wide">{children}</span>
      </span>
    </NavLink>
  );
}

export function Sidebar() {
  const { t } = useLanguage();

  return (
    <aside
      className={cn(
        "hidden md:flex",
        "fixed inset-y-0 left-0 z-50 w-64",
        "flex-col border-r border-primary/10",
        "bg-background/80 backdrop-blur-xl",
        "transition-all duration-300"
      )}
    >
      <div className="flex h-full flex-col p-4">
        {/* === Logo Bölməsi (Təmiz) === */}
        <div className="flex items-center gap-3 px-2 py-6 mb-2">
          <div className="relative group">
            {/* Logo arxasında neon parıltı */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#A73FFF] to-[#5420E0] rounded-full opacity-40 blur group-hover:opacity-75 transition duration-500"></div>
            
            {/* Logo Konteyneri */}
            <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-black border border-white/10">
              <img 
                src={logo} 
                alt="Endless Flow" 
                className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-500"
                // Heç bir fallback ikonu yoxdur
              />
            </div>
          </div>
          
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-primary/80">
              {t("appName")}
            </h1>
            <span className="text-[10px] text-primary/60 tracking-[0.2em] uppercase">Infinite</span>
          </div>
        </div>

        {/* === Əsas Menyu === */}
        <nav className="space-y-1 flex-1 overflow-y-auto py-2">
          <div className="px-2 mb-2 text-[10px] uppercase tracking-wider text-muted-foreground/50 font-semibold">
            Discover
          </div>
          <SidebarLink href="/" icon={<Home className="h-5 w-5" />}>
            {t("home")}
          </SidebarLink>
          <SidebarLink href="/ask-ai" icon={<Sparkles className="h-5 w-5" />}>
            {t("askAI")}
          </SidebarLink>
          <SidebarLink href="/charts" icon={<LayoutGrid className="h-5 w-5" />}>
            {t("charts")}
          </SidebarLink>
          <SidebarLink href="/recently-added" icon={<Music className="h-5 w-5" />}>
            {t("recentlyAdded")}
          </SidebarLink>

          <div className="px-2 mt-6 mb-2 text-[10px] uppercase tracking-wider text-muted-foreground/50 font-semibold">
            Library
          </div>
          <SidebarLink href="/liked" icon={<Heart className="h-5 w-5" />}>
            {t("likedSongs")}
          </SidebarLink>
          <SidebarLink href="/collections" icon={<LayoutGrid className="h-5 w-5" />}>
            {t("collections")}
          </SidebarLink>
          <SidebarLink href="/make-playlist" icon={<PlusCircle className="h-5 w-5" />}>
            {t("makePlaylist")}
          </SidebarLink>
        </nav>

        {/* === Footer / Settings === */}
        <div className="mt-auto pt-4 border-t border-primary/5 space-y-1">
           <SidebarLink href="/account" icon={<User className="h-5 w-5" />}>
            {t("account")}
          </SidebarLink>
          <SidebarLink href="/settings" icon={<Settings className="h-5 w-5" />}>
            {t("settings")}
          </SidebarLink>
        </div>
      </div>
    </aside>
  );
}