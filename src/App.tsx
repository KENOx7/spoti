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
import AuthCallback from "./pages/AuthCallback"; // 🟢 IMPORT

const queryClient = new QueryClient();

// --- SABİT LAYOUT (Protected) ---
const ProtectedLayout = () => {
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-y-auto pb-32 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <div className="p-4 sm:p-6 md:p-8 max-w-[1400px] mx-auto w-full">
            <Outlet />
          </div>
        </main>
        <div className="fixed bottom-0 left-0 right-0 z-50 md:left-64">
           <Player />
        </div>
        <MobileNav />
      </div>
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
                {/* PUBLIC ROUTES */}
                <Route path="/login" element={<LoginView />} />
                <Route path="/signup" element={<SignupView />} />
                
                {/* 🟢 Callback Route (Public olmalıdır) */}
                <Route path="/auth/callback" element={<AuthCallback />} />

                {/* PROTECTED ROUTES */}
                <Route element={
                  <ProtectedRoute>
                    <ProtectedLayout />
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
