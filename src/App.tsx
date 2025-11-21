// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"; // Navigate import etməyi unutmayın
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

// Layout Komponenti
const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 pb-24 sm:pb-28 md:pb-28 md:ml-60">
        <MobileNav />
        <div className="w-full min-w-0 p-4 sm:p-6 md:p-8">
          {children}
        </div>
      </main>
      <Player />
    </div>
  );
};

// src/App.tsx içindəki ProtectedRoute hissəsi:

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isGuest, isLoading } = useAuth();

  // 1. Əgər hələ yüklənirsə (və ya Spotify-dan qayıdırsa) Spinner göstər
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // 2. Yüklənmə bitdi, amma adam yoxdursa -> Loginə at
  if (!isAuthenticated && !isGuest) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout>{children}</AppLayout>;
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

                {/* PROTECTED ROUTES */}
                <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                <Route path="/charts" element={<ProtectedRoute><ChartView /></ProtectedRoute>} />
                <Route path="/liked" element={<ProtectedRoute><LikedSongsView /></ProtectedRoute>} />
                <Route path="/collections" element={<ProtectedRoute><CollectionsView /></ProtectedRoute>} />
                <Route path="/recently-added" element={<ProtectedRoute><RecentlyAddedView /></ProtectedRoute>} />
                <Route path="/ask-ai" element={<ProtectedRoute><AskAIView /></ProtectedRoute>} />
                <Route path="/make-playlist" element={<ProtectedRoute><MakePlaylistView /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><SettingsView /></ProtectedRoute>} />
                <Route path="/account" element={<ProtectedRoute><AccountView /></ProtectedRoute>} />
                <Route path="/playlist/:id" element={<ProtectedRoute><PlaylistDetailView /></ProtectedRoute>} />
                
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