import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { PlayerProvider } from "@/context/player-context";
import { LanguageProvider } from "@/context/language-context";
import { AuthProvider } from "@/context/auth-context";
import { Sidebar } from "@/components/Sidebar";
import { Player } from "@/components/Player";
import { MobileNav } from "@/components/MobileNav";
import { ProtectedRoute } from "@/components/ProtectedRoute";

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

// Bu Layout yalnız daxil olmuş istifadəçilər üçün görünəcək
// Player, Sidebar və MobileNav burada yerləşir
const MainLayout = () => {
  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Wrapper */}
      <main className="flex-1 flex flex-col min-w-0 md:pl-64 transition-[padding] duration-300">
        <div className="flex-1 overflow-y-auto pb-40 md:pb-24 px-4 pt-4 md:px-8 md:pt-8">
          <Outlet /> {/* Səhifələr burada render olunacaq */}
        </div>
      </main>

      {/* Fixed Components */}
      <Player />
      <MobileNav />
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
                {/* PUBLIC ROUTES (Player burada GÖRÜNMƏYƏCƏK) */}
                <Route path="/login" element={<LoginView />} />
                <Route path="/signup" element={<SignupView />} />

                {/* PROTECTED ROUTES (Player burada GÖRÜNƏCƏK) */}
                <Route element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }>
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