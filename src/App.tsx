// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { PlayerProvider } from "@/context/player-context";
import { LanguageProvider } from "@/context/language-context";
import { AuthProvider, useAuth } from "@/context/auth-context";
import { Sidebar } from "@/components/Sidebar";
import { Player } from "@/components/Player";
import { MobileNav } from "@/components/MobileNav"; // Mobil naviqasiyanı import edirik

// Bütün səhifələrinizi import edin
import Index from "./pages/Index";
import LoginView from "./pages/LoginView";
import SignupView from "./pages/SignupView";
import ChartView from "./pages/ChartView";
import LikedSongsView from "./pages/LikedSongsView";
import CollectionsView from "./pages/CollectionsView";
import AskAIView from "./pages/AskAIView";
import NotFound from "./pages/NotFound";
import MakePlaylistView from "./pages/MakePlaylistView";
import SettingsView from "./pages/SettingsView";
import AccountView from "./pages/AccountView";
import PlaylistDetailView from "./pages/PlaylistDetailView";
import RecentlyAddedView from "./pages/RecentlyAddedView";
import { useEffect } from "react";

const queryClient = new QueryClient();

// Main App Content
function AppContent() {
  const location = useLocation();

  // Handle OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("login") === "success") {
      // Check auth after OAuth redirect
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  }, [location]);

  // Show login/signup pages as full screen (outside main layout)
  if (location.pathname === "/login") {
    return <LoginView />;
  }
  
  if (location.pathname === "/signup") {
    return <SignupView />;
  }

  return (
    <div className="flex min-h-screen w-full max-w-full overflow-x-hidden bg-background text-foreground">
              {/* PC Sidebar (mobildə 'hidden') */}
              <Sidebar />

              {/* Əsas Məzmun Sahəsi */}
      <main className="flex-1 w-full min-w-0 md:ml-60 pb-24 sm:pb-28 md:pb-28">
                
                {/* Mobil Naviqasiya (PC-də 'md:hidden') */}
                <MobileNav />
                
                {/* Səhifə Məzmunu (daxili padding ilə) */}
        <div className="w-full min-w-0 p-4 sm:p-6 md:p-8">
                  <Routes>
                    <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginView />} />
            <Route path="/signup" element={<SignupView />} />
                    <Route path="/charts" element={<ChartView />} />
                    <Route path="/liked" element={<LikedSongsView />} />
                    <Route path="/collections" element={<CollectionsView />} />
                    <Route path="/recently-added" element={<RecentlyAddedView />} />
                    <Route path="/ask-ai" element={<AskAIView />} />
            <Route path="/make-playlist" element={<MakePlaylistView />} />
                    <Route path="/settings" element={<SettingsView />} />
                    <Route path="/account" element={<AccountView />} />
                    <Route path="/playlist/:id" element={<PlaylistDetailView />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </main>

              {/* Player (PC-də 'md:ml-60') */}
              <Player />
            </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <LanguageProvider>
          <PlayerProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppContent />
          </BrowserRouter>
        </PlayerProvider>
      </LanguageProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;