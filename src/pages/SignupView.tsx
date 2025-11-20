import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const backgroundImage = new URL("Raper album cover.jpg", import.meta.url).href;

export default function SignupView() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({ variant: "destructive", title: "Xəta", description: "Şifrələr eyni deyil!" });
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
        title: "Qeydiyyat Uğurlu!",
        description: "Zəhmət olmasa emailinizi yoxlayın və təsdiqləyin.",
      });
      navigate("/login");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Xəta", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url("${backgroundImage}")` }}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6 animate-in fade-in zoom-in duration-300">
        <div className="bg-card/90 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground">Qeydiyyat</h1>
            <p className="text-muted-foreground text-sm">Yeni hesab yaradın</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" className="pl-10 h-12 bg-background/50" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Şifrə</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" type="password" className="pl-10 h-12 bg-background/50" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Şifrə Təkrarı</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="confirmPassword" type="password" className="pl-10 h-12 bg-background/50" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>
            </div>

            <Button type="submit" className="w-full h-12 mt-4" disabled={isLoading}>
              {isLoading ? "Yaradılır..." : "Hesab Yarat"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
             Artıq hesabınız var? <Link to="/login" className="text-primary hover:underline font-medium">Daxil ol</Link>
          </div>
        </div>
      </div>
    </div>
  );
}