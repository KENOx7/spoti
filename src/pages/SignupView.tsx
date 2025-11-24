import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/language-context";
import { useAuth } from "@/context/auth-context";

// Şəkil
const backgroundImage = new URL("./Raper album cover.jpg", import.meta.url).href;

export default function SignupView() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth(); // isGuest-i çağırmırıq

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Yalnız isAuthenticated (real istifadəçi) olsa yönləndir. 
  // Qonaqdırsa (isGuest=true) qalsın və qeydiyyatdan keçə bilsin.
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({ variant: "destructive", title: "Xəta", description: "Şifrələr eyni deyil" });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Hesab yaradıldı!",
        description: "Zəhmət olmasa emailinizi yoxlayın və təsdiqləyin.",
      });
      
      // Uğurlu qeydiyyatdan sonra login səhifəsinə yönləndirə bilərik 
      // və ya avtomatik giriş edilirsə useEffect özü atacaq.
      navigate("/login");
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Xəta",
        description: error.message || "Qeydiyyat xətası",
      });
    } finally {
      setIsLoading(false);
    }
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

      <div className="w-full max-w-md p-8 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-white mb-2 tracking-tight drop-shadow-lg">
            {t("createAccount")}
          </h1>
          <p className="text-muted-foreground text-gray-300">
            {t("enterMusicWorld")}
          </p>
        </div>

        <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl">
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-200">{t("email")}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  id="email" 
                  type="email" 
                  className="pl-10 h-12 bg-white/5 border-white/10 focus:ring-primary/50 text-white"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
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
                  className="pl-10 h-12 bg-white/5 border-white/10 focus:ring-primary/50 text-white"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  minLength={6} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-200">{t("confirmPassword")}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  className="pl-10 h-12 bg-white/5 border-white/10 focus:ring-primary/50 text-white"
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-12 mt-4 bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(124,58,237,0.3)]" disabled={isLoading}>
              {isLoading ? "..." : t("signUp")}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
             {t("haveAccount")}{" "} 
             <Link to="/login" className="text-primary hover:underline font-medium inline-flex items-center ml-1">
               {t("signIn")} <ArrowRight className="ml-1 h-3 w-3" />
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}