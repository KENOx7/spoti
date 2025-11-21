// src/components/MobileNav.tsx
import { Menu, Music } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "ui/sheet";
import { Button } from "ui/button";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLanguage } from "@/context/language-context";

export function MobileNav() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { href: "/", label: t("home") },
    { href: "/charts", label: t("charts") },
    { href: "/liked", label: t("likedSongs") },
    { href: "/collections", label: t("collections") },
    { href: "/recently-added", label: t("recentlyAdded") },
    { href: "/ask-ai", label: t("askAI") },
    { href: "/make-playlist", label: t("makePlaylist") },
  ];

  const settingsLinks = [
    { href: "/settings", label: t("settings") },
    { href: "/account", label: t("account") },
  ];

  // Close menu when route changes
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    // === DÜZƏLİŞ: 'md:hidden' klassı PC-də gizlədir ===
    <header className="md:hidden sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b p-2 sm:p-3 md:p-4">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 h-9 w-9 sm:h-10 sm:w-10">
            <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="sr-only">Naviqasiya menyusunu aç</span>
          </Button>
        </SheetTrigger>
        
        {/* === DÜZƏLİŞ: 'text-foreground' "X" ikonunun rəngini düzəldir === */}
        <SheetContent side="left" className="flex flex-col w-full max-w-sm text-foreground">
          {/* Logo və ya başlıq */}
          <div className="flex items-center gap-2 border-b pb-3 sm:pb-4">
            <Music className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <span className="text-lg sm:text-xl font-bold">{t("appName")}</span>
          </div>

          {/* Əsas Naviqasiya */}
          <nav className="flex-1 flex flex-col gap-1 sm:gap-2 mt-3 sm:mt-4">
            {navLinks.map((link) => (
              <MobileNavLink key={link.href} href={link.href} onNavigate={() => setOpen(false)}>
                {link.label}
              </MobileNavLink>
            ))}
          </nav>
          
          {/* Alt Naviqasiya (Settings, Account) */}
          <nav className="flex flex-col gap-1 sm:gap-2 border-t pt-3 sm:pt-4">
            {settingsLinks.map((link) => (
              <MobileNavLink key={link.href} href={link.href} onNavigate={() => setOpen(false)}>
                {link.label}
              </MobileNavLink>
            ))}
            <div className="pt-2 px-2">
              <LanguageSwitcher />
            </div>
          </nav>

        </SheetContent>
      </Sheet>
    </header>
  );
}

// Linklər üçün köməkçi komponent
function MobileNavLink({ 
  href, 
  children, 
  onNavigate 
}: { 
  href: string; 
  children: React.ReactNode;
  onNavigate?: () => void;
}) {
  return (
    <NavLink
      to={href}
      end={href === "/"} // Anasəhifə linkinin həmişə aktiv qalmaması üçün
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          "text-base sm:text-lg p-2 sm:p-3 rounded-md font-medium transition-colors hover:bg-muted",
          isActive
            ? "bg-primary text-primary-foreground"
            // === DÜZƏLİŞ: Aktiv olmayan linklərin "dark mode"-da görünməsi üçün ===
            : "text-foreground/70" 
        )
      }
    >
      {children}
    </NavLink>
  );
}