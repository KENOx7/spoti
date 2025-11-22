import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/language-context";

// Şəkil
const backgroundImage = new URL("./Raper album cover.jpg", import.meta.url).href;

export default function LoginView() {
  // isGuest-i yoxlamadan çıxardıq ki, qonaqlar login səhifəsini görə bilsin
  const { isAuthenticated, continueAsGuest } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Yalnız HƏQİQİ HESABLA giriş edilibsə Ana Səhifəyə at
  // Qonaqdırsa, bu səhifədə qalıb hesab aça bilsin
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
      // Uğurlu olarsa useEffect avtomatik yönləndirəcək
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Xəta",
        description: error.message || "Giriş zamanı xəta baş verdi",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    await continueAsGuest();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      
      {/* --- ARXA FON ŞƏKLİ --- */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url("${backgroundImage}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] bg-gradient-to-b from-background/80 via-transparent to-background/90" />
      </div>

      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none z-0" />
      
      <div className="w-full max-w-md p-8 relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-white mb-2 tracking-tight drop-shadow-lg">
            {t("welcomeBack")}
          </h1>
          <p className="text-muted-foreground text-gray-300">
            {t("enterMusicWorld")}
          </p>
        </div>

        <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-200">{t("email")}</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@example.com"
                  className="pl-10 h-12 bg-white/5 border-white/10 focus:ring-primary/50 text-white placeholder:text-gray-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password"className="text-gray-200">{t("password")}</Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                <Input 
                  id="password" 
                  type="password" 
                  className="pl-10 h-12 bg-white/5 border-white/10 focus:ring-primary/50 text-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-medium mt-2 bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(124,58,237,0.3)]"
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
              <span className="bg-transparent px-2 text-muted-foreground bg-black/50 backdrop-blur-md rounded">Or</span>
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
            <Link 
              to="/signup" 
              className="text-primary hover:text-primary/80 font-semibold transition-all inline-flex items-center ml-1 hover:underline"
            >
              {t("signUp")} <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}