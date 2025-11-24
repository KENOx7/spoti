// src/pages/LoginView.tsx
import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Music, User, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/language-context";

// Şəkil (Sizin layihədə olan şəkli saxladım)
const backgroundImage = new URL("./Raper album cover.jpg", import.meta.url).href;

export default function LoginView() {
  const { isAuthenticated, continueAsGuest } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      toast({ title: t("success"), description: t("welcomeBack") });
    } catch (error: any) {
      toast({ variant: "destructive", title: t("error"), description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpotifyLogin = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'spotify',
        options: {
          redirectTo: window.location.origin, // Sizi əsas səhifəyə qaytarır
          scopes: 'user-read-email user-read-private playlist-read-private playlist-read-collaborative user-library-read',
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast({ variant: "destructive", title: "Spotify Error", description: error.message });
      setIsLoading(false);
    }
  };

  const handleGuestLogin = () => {
    continueAsGuest();
    navigate("/");
  };

  return (
    <div className="min-h-screen w-full flex bg-black text-white overflow-hidden relative">
      {/* Arxa fon */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-40 blur-sm scale-105"
        style={{ backgroundImage: `url("${backgroundImage}")` }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-black via-black/80 to-transparent" />

      <div className="relative z-10 w-full max-w-md m-auto p-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
        
        <div className="flex flex-col items-center mb-6">
          <div className="h-14 w-14 bg-primary rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(124,58,237,0.5)]">
            <Music className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Spoti-Rose</h1>
          <p className="text-gray-400 mt-2 text-sm text-center">{t("loginDescription")}</p>
        </div>

        {/* --- SPOTIFY BUTTON --- */}
        <Button 
          variant="outline" 
          className="w-full h-12 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold border-none mb-6 rounded-full"
          onClick={handleSpotifyLogin}
          disabled={isLoading}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
             <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          Continue with Spotify
        </Button>

        <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-transparent px-2 text-gray-400">Or email</span>
            </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input 
                  id="email" 
                  type="email" 
                  className="pl-10 h-10 bg-white/5 border-white/10 text-white"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  disabled={isLoading}
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t("password")}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input 
                  id="password" 
                  type="password" 
                  className="pl-10 h-10 bg-white/5 border-white/10 text-white"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  disabled={isLoading}
                  placeholder="••••••"
                />
              </div>
            </div>

            <Button type="submit" className="w-full mt-2 bg-primary hover:bg-primary/90">
              {isLoading ? "Wait..." : t("signIn")}
            </Button>
        </form>

        <Button
            type="button"
            variant="ghost"
            className="w-full mt-4 text-gray-400 hover:text-white"
            onClick={handleGuestLogin}
            disabled={isLoading}
        >
            <User className="mr-2 h-4 w-4" />
            {t("guestContinue")}
        </Button>

        <div className="mt-6 text-center text-sm text-gray-400">
            {t("noAccount")}{" "}
            <Link to="/signup" className="text-primary hover:underline font-semibold">
              {t("signUp")}
            </Link>
        </div>
      </div>
    </div>
  );
}
