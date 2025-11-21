// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { PlayerProvider } from "@/context/player-context";
import { LanguageProvider } from "@/context/language-context";
import { AuthProvider, useAuth } from "@/context/auth-context";
import { Sidebar } from "@/components/Sidebar";
import { Player } from "@/components/Player";
import { MobileNav } from "@/components/MobileNav";

// Səhifələr
import Index from "./pages/Index";
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
import LoginView from "./pages/LoginView";
import SignupView from "./pages/SignupView";

const queryClient = new QueryClient();

// --- SABİT LAYOUT (Protected) ---
// Bu komponent səhifələr dəyişsə də sabit qalır, ona görə musiqi kəsilmir.
const ProtectedLayout = () => {
  const { isAuthenticated, isGuest, isLoading } = useAuth();

  // 1. Yüklənmə halı
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // 2. Giriş edilməyibsə Login-ə at
  if (!isAuthenticated && !isGuest) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar sabit qalır */}
      <Sidebar />
      
      <main className="flex-1 pb-24 sm:pb-28 md:pb-28 md:ml-60 transition-all duration-300">
        <MobileNav />
        <div className="w-full min-w-0 p-4 sm:p-6 md:p-8 animate-in fade-in duration-300">
          {/* Dəyişən səhifələr burada göstərilir */}
          <Outlet />
        </div>
      </main>

      {/* Player sabit qalır */}
      <Player />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <AuthProvider>
          <PlayerProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* PUBLIC ROUTES (Player görünmür) */}
                <Route path="/login" element={<LoginView />} />
                <Route path="/signup" element={<SignupView />} />

                {/* PROTECTED ROUTES (Player görünür və sabitdir) */}
                <Route element={<ProtectedLayout />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/charts" element={<ChartView />} />
                  <Route path="/liked" element={<LikedSongsView />} />
                  <Route path="/collections" element={<CollectionsView />} />
                  <Route path="/recently-added" element={<RecentlyAddedView />} />
                  <Route path="/ask-ai" element={<AskAIView />} />
                  <Route path="/make-playlist" element={<MakePlaylistView />} />
                  <Route path="/settings" element={<SettingsView />} />
                  <Route path="/account" element={<AccountView />} />
                  <Route path="/playlist/:id" element={<PlaylistDetailView />} />
                </Route>
                
                {/* 404 Səhifəsi */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </PlayerProvider>
        </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;