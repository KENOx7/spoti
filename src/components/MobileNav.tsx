import { Menu, Music, Home, Search, Library, Settings } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useLanguage } from "@/context/language-context";
import logo from "@/logo.png";

export function MobileNav() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Aşağı Menyu Elementləri
  const bottomNavItems = [
    { href: "/", icon: Home, label: t("home") },
    { href: "/ask-ai", icon: Search, label: t("askAI") },
    { href: "/collections", icon: Library, label: t("collections") },
  ];

  // Yan Menyu (Drawer) Linkləri
  const drawerLinks = [
    { href: "/charts", label: t("charts") },
    { href: "/liked", label: t("likedSongs") },
    { href: "/recently-added", label: t("recentlyAdded") },
    { href: "/make-playlist", label: t("makePlaylist") },
    { href: "/account", label: t("account") },
    { href: "/settings", label: t("settings") },
  ];

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Aşağı Sabit Menyu (Blur effekti ilə) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-t border-primary/10" />
        
        {/* DÜZƏLİŞ: py-3 əvəzinə py-1 istifadə edildi */}
        <div className="relative flex items-center justify-around px-2 py-[8px]">
          {bottomNavItems.map((item) => {
             const Icon = item.icon;
             const isActive = location.pathname === item.href;
             return (
               <NavLink
                 key={item.href}
                 to={item.href}
                 className={cn(
                   "flex flex-col items-center gap-1 transition-all duration-300",
                   isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-primary/70"
                 )}
               >
                 <Icon className={cn("h-6 w-6", isActive && "drop-shadow-[0_0_8px_rgba(167,63,255,0.6)]")} />
                 <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
               </NavLink>
             );
          })}

          {/* Daha Çox Menyusu (Drawer Trigger) */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                <div className="relative">
                   <Menu className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-medium tracking-wide">Menu</span>
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85%] border-l border-primary/10 bg-background/95 backdrop-blur-2xl">
               
               {/* Drawer Başlığı */}
               <div className="flex items-center gap-3 mb-8 mt-4 pb-6 border-b border-primary/10">
                  <div className="w-10 h-10 rounded-xl overflow-hidden border border-primary/20 shadow-[0_0_15px_rgba(167,63,255,0.2)]">
                    <img src={logo} alt="Logo" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-primary">
                        {t("appName")}
                    </h2>
                    <p className="text-xs text-muted-foreground">Infinite Music</p>
                  </div>
               </div>

               {/* Drawer Linkləri */}
               <nav className="flex flex-col gap-2">
                  {drawerLinks.map((link) => (
                    <NavLink
                      key={link.href}
                      to={link.href}
                      className={({ isActive }) => cn(
                        "p-4 rounded-xl text-lg font-light transition-all duration-300 border border-transparent",
                        isActive 
                          ? "bg-primary/10 text-primary border-primary/10 shadow-[0_0_10px_rgba(167,63,255,0.1)]" 
                          : "hover:bg-accent hover:pl-6"
                      )}
                    >
                      {link.label}
                    </NavLink>
                  ))}
               </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  );
}