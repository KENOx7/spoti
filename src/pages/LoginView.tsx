import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";
import { Button } from "ui/button";
import { Input } from "ui/input";
import { Label } from "ui/label";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Music, Chrome, User, ArrowRight, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/language-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "ui/select";

// Şəkil
const backgroundImage = new URL("./Raper album cover.jpg", import.meta.url).href;

export default function LoginView() {
  const { isAuthenticated, continueAsGuest } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, language, setLanguage } = useLanguage();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Əgər giriş edilibsə, yönləndir
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

// --- SOCIAL LOGIN ---
  const handleSocialLogin = async (provider: "google" | "spotify") => {
    try {
      setIsLoading(true);
      
      // Spotify üçün xüsusi icazələr (scopes)
      const scopes = provider === 'spotify' 
        ? 'user-read-email user-read-private user-library-read playlist-read-private playlist-read-collaborative user-read-playback-state user-modify-playback-state user-read-currently-playing streaming'
        : undefined;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: window.location.origin,
          scopes: scopes, // İcazələri bura əlavə edirik
          flowType: "pkce",
        },
      });
      if (error) throw error;
    } catch (error: any) {
      console.error("Login Error:", error);
      toast({
        variant: "destructive",
        title: "Xəta",
        description: error.message,
      });
      setIsLoading(false);
    }
  };

  // EMAIL LOGIN (Bura baxın)
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);
    try {
      // 1. Supabase-dən giriş sorğusu
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // 2. Uğurlu olsa, AuthContext avtomatik olaraq istifadəçini tutacaq 
      // və useEffect sizi "/" səhifəsinə atacaq.
      toast({ title: "Uğurlu!", description: "Xoş gəldiniz." });

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Giriş Xətası",
        description: "Email və ya şifrə yanlışdır.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = () => {
    continueAsGuest();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center relative overflow-hidden">
      {/* Dil Dəyişimi */}
      <div className="absolute top-4 right-4 z-50">
        <Select value={language} onValueChange={(val: "en" | "az") => setLanguage(val)}>
          <SelectTrigger className="w-[140px] bg-black/40 backdrop-blur-md border-white/20 text-white hover:bg-black/60">
             <Globe className="w-4 h-4 mr-2" />
             <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="az">Azərbaycanca</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Arxa Fon */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url("${backgroundImage}")` }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6 animate-in fade-in zoom-in duration-300">
        <div className="bg-card/90 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl p-8">
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground">
              {t("welcomeBack")}
            </h1>
            <p className="text-muted-foreground text-sm">
              {t("enterMusicWorld")}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <Button 
              variant="outline" 
              type="button"
              onClick={() => handleSocialLogin("google")}
              className="h-12 hover:bg-white/10 transition-colors"
              disabled={isLoading}
            >
              <Chrome className="mr-2 h-5 w-5 text-red-500" />
              Google
            </Button>
            <Button 
              variant="outline"
              type="button"
              onClick={() => handleSocialLogin("spotify")}
              className="h-12 hover:bg-green-500/10 border-green-900/50 text-green-500 transition-colors"
              disabled={isLoading}
            >
              <Music className="mr-2 h-5 w-5" />
              Spotify
            </Button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background/50 px-2 text-muted-foreground rounded backdrop-blur-sm">
                {t("orEmail")}
              </span>
            </div>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="ad@example.com"
                  className="pl-10 h-12 bg-background/50 border-border/50 focus:ring-primary/50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t("password")}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 h-12 bg-background/50 border-border/50 focus:ring-primary/50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-medium mt-2 bg-primary hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? "..." : t("signIn")}
            </Button>
          </form>

          <Button
            type="button"
            variant="ghost"
            className="w-full mt-3 text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent hover:border-border/30"
            onClick={handleGuestLogin}
            disabled={isLoading}
          >
            <User className="mr-2 h-4 w-4" />
            {t("guestContinue")}
          </Button>

          <div className="mt-6 pt-4 border-t border-border/30 text-center text-sm">
            {t("noAccount")}{" "}
            <Link 
              to="/signup" 
              className="text-primary hover:text-primary/80 font-semibold transition-all inline-flex items-center ml-1"
            >
              {t("signUp")} <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}