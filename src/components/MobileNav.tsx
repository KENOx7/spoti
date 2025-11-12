// src/components/MobileNav.tsx
import { Menu, Music } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

// Linkləri təkrar istifadə etmək yaxşıdır
const navLinks = [
  { href: "/", label: "Əsas Səhifə" },
  { href: "/charts", label: "Hit Parad" },
  { href: "/liked", label: "Bəyəndiklərim" },
  { href: "/collections", label: "Kolleksiyalar" },
  { href: "/ask-ai", label: "AI-dan Soruş" },
  { href: "/make-playlist", label: "Playlist Yarat" },
];

const settingsLinks = [
  { href: "/settings", label: "Tənzimləmələr" },
  { href: "/account", label: "Hesabım" },
];

export function MobileNav() {
  return (
    // === DÜZƏLİŞ: 'md:hidden' klassı PC-də gizlədir ===
    <header className="md:hidden sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b p-4">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Naviqasiya menyusunu aç</span>
          </Button>
        </SheetTrigger>
        
        {/* === DÜZƏLİŞ: 'text-foreground' "X" ikonunun rəngini düzəldir === */}
        <SheetContent side="left" className="flex flex-col w-full max-w-sm text-foreground">
          {/* Logo və ya başlıq */}
          <div className="flex items-center gap-2 border-b pb-4">
            <Music className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Musiqi</span>
          </div>

          {/* Əsas Naviqasiya */}
          <nav className="flex-1 flex flex-col gap-2 mt-4">
            {navLinks.map((link) => (
              <MobileNavLink key={link.href} href={link.href}>
                {link.label}
              </MobileNavLink>
            ))}
          </nav>
          
          {/* Alt Naviqasiya (Settings, Account) */}
          <nav className="flex flex-col gap-2 border-t pt-4">
            {settingsLinks.map((link) => (
              <MobileNavLink key={link.href} href={link.href}>
                {link.label}
              </MobileNavLink>
            ))}
          </nav>

        </SheetContent>
      </Sheet>
    </header>
  );
}

// Linklər üçün köməkçi komponent
function MobileNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={href}
      end={href === "/"} // Anasəhifə linkinin həmişə aktiv qalmaması üçün
      className={({ isActive }) =>
        cn(
          "text-lg p-3 rounded-md font-medium transition-colors hover:bg-muted",
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