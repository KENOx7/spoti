import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, Link } from "react-router-dom";
import { User, Chrome, Music } from "lucide-react"; // Importları yoxlayın
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/language-context";

// Şəkil (Sizin kodunuzdakı kimi saxlayıram)
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

  // --- SOSİAL LOGİN FUNKSİYASI ---
  const handleSocialLogin = async (provider: 'google' | 'spotify') => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          // Bu hissə ÇOX VACİBDİR. Login bitəndən sonra bura qayıdacaq.
          redirectTo: `${window.location.origin}/`, 
        },
      });

      if (error) throw error;
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An error occurred during login",
      });
      setIsLoading(false);
    }
  };

  // Email login funksiyası (Sizin köhnə kodunuz)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      // Uğurlu olsa onAuthStateChange işə düşəcək və yönləndirəcək
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Arxa fon şəkli */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      </div>

      <div className="relative z-10 w-full max-w-md p-8 bg-black/40 border border-white/10 rounded-2xl backdrop-blur-md shadow-2xl animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Endless Flow</h1>
          <p className="text-gray-400">{t("welcomeBack")}</p>
        </div>

        {/* SOSİAL BUTONLAR */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button 
            variant="outline" 
            className="h-12 bg-white/5 border-white/10 hover:bg-white/10 hover:text-white"
            onClick={() => handleSocialLogin('google')}
            disabled={isLoading}
          >
            <Chrome className="mr-2 h-4 w-4" /> Google
          </Button>
          <Button 
            variant="outline" 
            className="h-12 bg-white/5 border-white/10 hover:bg-[#1DB954]/20 hover:text-[#1DB954] hover:border-[#1DB954]/50"
            onClick={() => handleSocialLogin('spotify')}
            disabled={isLoading}
          >
            <Music className="mr-2 h-4 w-4" /> Spotify
          </Button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-200">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="hello@example.com"
              className="h-11 bg-white/5 border-white/10 focus:ring-primary/50 text-white placeholder:text-gray-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-200">{t("password")}</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="h-11 bg-white/5 border-white/10 focus:ring-primary/50 text-white placeholder:text-gray-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(124,58,237,0.3)]"
            disabled={isLoading}
          >
            {isLoading ? "..." : t("signIn")}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-black/50 px-2 text-gray-400 backdrop-blur-md rounded">Or</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full h-11 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-primary hover:border-primary/50 transition-all"
          onClick={handleGuestLogin}
          disabled={isLoading}
        >
          <User className="mr-2 h-4 w-4" />
          {t("guestContinue")}
        </Button>

        <div className="mt-6 pt-4 border-t border-white/10 text-center text-sm text-gray-400">
          {t("noAccount")}{" "}
          <Link to="/signup" className="text-primary hover:text-primary/80 font-semibold hover:underline transition-all">
            {t("signUp")}
          </Link>
        </div>
      </div>
    </div>
  );
}
