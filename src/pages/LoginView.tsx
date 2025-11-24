import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Music, Chrome, User, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/language-context";

// Şəkil
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
        provider: "spotify",
        options: {
          // ✅ YENİLƏNDİ: Artıq callback səhifəsinə yönləndiririk
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: "user-read-email user-read-private playlist-read-private playlist-read-collaborative user-library-read",
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Spotify Error",
        description: error.message,
      });
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          // ✅ YENİLƏNDİ: Google üçün də callback əlavə etdik
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Google Error",
        description: error.message,
      });
      setIsLoading(false);
    }
  };

  const handleGuestLogin = () => {
    continueAsGuest();
    navigate("/");
  };

  return (
    <div className="min-h-screen w-full flex bg-black text-white overflow-hidden relative">
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-40 blur-sm scale-105"
        style={{ backgroundImage: `url("${backgroundImage}")` }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-black via-black/80 to-transparent" />

      <div className="relative z-10 w-full max-w-md m-auto p-6 sm:p-10 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-500">
        
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(124,58,237,0.5)] animate-pulse-slow">
            <Music className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Spoti-Rose
          </h1>
          <p className="text-gray-400 mt-2 text-sm">{t("loginDescription")}</p>
        </div>

        <Button 
          variant="outline" 
          className="w-full h-12 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold border-none mb-3 transition-transform hover:scale-[1.02]"
          onClick={handleSpotifyLogin}
          disabled={isLoading}
        >
          <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
             <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          Continue with Spotify
        </Button>

        <Button 
          variant="outline" 
          className="w-full h-12 bg-white hover:bg-gray-100 text-black font-bold border-none mb-4 transition-transform hover:scale-[1.02]"
          onClick={handleGoogleLogin}
          disabled={isLoading}
        >
          <Chrome className="w-5 h-5 mr-2 text-red-500" />
          Continue with Google
        </Button>

        <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-black/50 px-2 text-gray-400 backdrop-blur-md rounded">Or</span>
            </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-200">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  id="email" 
                  type="email" 
                  className="pl-10 h-12 bg-white/5 border-white/10 focus:ring-primary/50 text-white placeholder:text-gray-500"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  disabled={isLoading}
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-200">{t("password")}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  id="password" 
                  type="password" 
                  className="pl-10 h-12 bg-white/5 border-white/10 focus:ring-primary/50 text-white placeholder:text-gray-500"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  disabled={isLoading}
                  placeholder="••••••"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 mt-2 bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(124,58,237,0.3)] font-medium text-base"
              disabled={isLoading}
            >
              {isLoading ? <span className="animate-spin mr-2">⏳</span> : t("signIn")}
            </Button>
        </form>

        <Button
            type="button"
            variant="ghost"
            className="w-full mt-4 text-gray-400 hover:text-white hover:bg-white/5"
            onClick={handleGuestLogin}
            disabled={isLoading}
        >
            <User className="mr-2 h-4 w-4" />
            {t("guestContinue")}
        </Button>

        <div className="mt-6 pt-4 border-t border-white/10 text-center text-sm text-gray-400">
            {t("noAccount")}{" "}
            <Link to="/signup" className="text-primary hover:text-primary/80 font-semibold transition-all inline-flex items-center ml-1">
              {t("signUp")} <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
        </div>
      </div>
    </div>
  );
}
