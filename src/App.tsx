// App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PlayerProvider } from "@/context/player-context";
import { LanguageProvider } from "@/context/language-context";
import { Sidebar } from "@/components/Sidebar";
import { Player } from "@/components/Player";
// YENİ: Mobil naviqasiya üçün komponent
import { MobileNav } from "@/components/MobileNav";

// Əsas səhifələr
import Index from "./pages/Index";
import ChartView from "./pages/ChartView";
import LikedSongsView from "./pages/LikedSongsView";
import CollectionsView from "./pages/CollectionsView";
import AskAIView from "./pages/AskAIView";
import NotFound from "./pages/NotFound";

// Yeni səhifələr
import MakePlaylistView from "./pages/MakePlaylistView";
import SettingsView from "./pages/SettingsView";
import AccountView from "./pages/AccountView";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <PlayerProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="flex min-h-screen w-full bg-background text-foreground">
              {/* Sidebar indi mobildə gizlənəcək (növbəti addıma baxın) */}
              <Sidebar />
              {/* === DÜZƏLİŞ BURADADIR ===
                Əsas məzmun sahəsi:
                - 'md:ml-60': Yalnız böyük ekranlarda soldan boşluq verir.
                - 'pb-28': Player üçün aşağıda boşluq saxlayır.
              */}
              <main className="flex-1 md:ml-60 pb-28">
                {/* YENİ: Mobil naviqasiya (hamburger menyu) */}
                <MobileNav />
                
                {/* Səhifə məzmunu üçün daxili padding */}
                <div className="p-8">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/charts" element={<ChartView />} />
                    <Route path="/liked" element={<LikedSongsView />} />
                    <Route path="/collections" element={<CollectionsView />} />
                    <Route path="/ask-ai" element={<AskAIView />} />
                    <Route
                      path="/make-playlist"
                      element={<MakePlaylistView />}
                    />
                    <Route path="/settings" element={<SettingsView />} />
                    <Route path="/account" element={<AccountView />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </main>
              <Player />
            </div>
          </BrowserRouter>
        </PlayerProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;