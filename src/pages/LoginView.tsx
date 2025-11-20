import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Music, Chrome, User, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Arxa fon şəkli
const backgroundImage = new URL("Raper album cover.jpg", import.meta.url).href;

export default function LoginView() {
  const { isAuthenticated, continueAsGuest } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Əgər istifadəçi artıq giriş edibsə, Ana səhifəyə at
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // --- SOCIAL LOGIN (Google & Spotify) ---
  const handleSocialLogin = async (provider: "google" | "spotify") => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          // Bu kod avtomatik olaraq olduğu yeri (Localhost və ya Vercel) təyin edir
          redirectTo: window.location.origin, 
        },
      });
      if (error) throw error;
    } catch (error: any) {
      console.error("Login xətası:", error);
      toast({
        variant: "destructive",
        title: "Giriş Xətası",
        description: error.message || "Bilinməyən xəta baş verdi.",
      });
      setIsLoading(false);
    }
  };

  // --- EMAIL LOGIN ---
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Uğurlu!",
        description: "Xoş gəldiniz.",
      });
      // Yönləndirməni AuthContext avtomatik edəcək (useEffect ilə)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Xəta",
        description: "Email və ya şifrə yanlışdır.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --- QONAQ GİRİŞİ ---
  const handleGuestLogin = () => {
    continueAsGuest();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center relative overflow-hidden">
      {/* Arxa Fon Şəkli */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url("${backgroundImage}")` }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      </div>

      {/* Login Kartı */}
      <div className="relative z-10 w-full max-w-md px-6 animate-in fade-in zoom-in duration-300">
        <div className="bg-card/90 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl p-8">
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground">
              Xoş Gəlmisiniz
            </h1>
            <p className="text-muted-foreground text-sm">
              Devora musiqi dünyasına daxil olun
            </p>
          </div>

          {/* Social Düymələr */}
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
                və ya email ilə
              </span>
            </div>
          </div>

          {/* Email Formu */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
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
              <Label htmlFor="password">Şifrə</Label>
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
              {isLoading ? "Giriş edilir..." : "Daxil ol"}
            </Button>
          </form>

          {/* Qonaq Düyməsi */}
          <Button
            type="button"
            variant="ghost"
            className="w-full mt-3 text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent hover:border-border/30"
            onClick={handleGuestLogin}
            disabled={isLoading}
          >
            <User className="mr-2 h-4 w-4" />
            Qonaq kimi davam et
          </Button>

          <div className="mt-6 pt-4 border-t border-border/30 text-center text-sm">
             Hesabınız yoxdur?{" "}
            <Link 
              to="/signup" 
              className="text-primary hover:text-primary/80 font-semibold transition-all inline-flex items-center ml-1"
            >
              Qeydiyyatdan keçin <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

