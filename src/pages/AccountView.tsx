import { useState } from "react";
import { User, LogOut, Mail, Shield, LogIn, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLanguage } from "@/context/language-context";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function AccountView() {
  const { t } = useLanguage();
  const { user, signOut, isGuest } = useAuth(); // isGuest burada vacibdir
  const { toast } = useToast();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // --- QONAQ REJİMİ ÜÇÜN GÖRÜNÜŞ ---
  if (isGuest) {
    return (
      <div className="p-6 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 mt-10">
        <div className="bg-card border border-border rounded-xl p-8 text-center shadow-lg">
          <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="h-10 w-10 text-primary" />
          </div>
          
          <h1 className="text-3xl font-bold mb-3">Qonaq Hesabı</h1>
          <p className="text-muted-foreground mb-8 text-lg">
            Siz hazırda Qonaq rejimindəsiniz. Pleylistlərinizi yadda saxlamaq və bütün funksiyalardan istifadə etmək üçün zəhmət olmasa daxil olun.
          </p>

          <div className="grid gap-4 sm:grid-cols-2 max-w-md mx-auto">
            <Button 
              size="lg" 
              className="w-full" 
              onClick={() => navigate("/login")}
            >
              <LogIn className="mr-2 h-5 w-5" />
              Daxil ol / Qeydiyyat
            </Button>

            <Button 
              size="lg" 
              variant="outline" 
              className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
              onClick={signOut}
            >
              <LogOut className="mr-2 h-5 w-5" />
              Sessiyanı Bitir
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // --- REAL İSTİFADƏÇİ ÜÇÜN GÖRÜNÜŞ ---

  const handlePasswordChange = async () => {
    if (newPassword.length < 6) {
      toast({ variant: "destructive", title: "Xəta", description: "Şifrə ən az 6 simvol olmalıdır." });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ variant: "destructive", title: "Xəta", description: "Şifrələr uyğun gəlmir." });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast({ title: "Uğurlu", description: "Şifrəniz yeniləndi." });
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Xəta", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 pb-24 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">{t("settings") || "Hesab Tənzimləmələri"}</h1>
        <p className="text-muted-foreground">Profil məlumatlarınızı idarə edin</p>
      </div>

      <div className="space-y-6">
        {/* Profil Kartı */}
        <div className="p-6 bg-card rounded-lg border border-border flex flex-col sm:flex-row items-start sm:items-center gap-6 shadow-sm">
          <Avatar className="h-20 w-20 border-2 border-primary/20">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
              {(user?.email?.[0] || "U").toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">{user?.user_metadata?.full_name || user?.email?.split("@")[0]}</h2>
            <div className="flex items-center text-muted-foreground">
              <Mail className="h-4 w-4 mr-2" /> {user?.email}
            </div>
            <div className="flex items-center text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded w-fit mt-2">
              <Shield className="h-3 w-3 mr-1" /> 
              {user?.app_metadata?.provider === 'email' ? 'Email Hesabı' : 'Google/Spotify Hesabı'}
            </div>
          </div>
        </div>

        {/* Şifrə Dəyişmə (Yalnız Email istifadəçiləri üçün) */}
        {user?.app_metadata?.provider === 'email' ? (
          <div className="p-6 bg-card rounded-lg border border-border space-y-4 shadow-sm">
            <div>
              <h2 className="text-xl font-semibold mb-1">Təhlükəsizlik</h2>
              <p className="text-sm text-muted-foreground">Şifrənizi yeniləyin</p>
            </div>

            <div className="grid gap-4 max-w-md">
              <div className="space-y-2">
                <Label>{t("newPassword") || "Yeni Şifrə"}</Label>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label>{t("confirmPassword") || "Şifrəni Təsdiqlə"}</Label>
                <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" />
              </div>
              <Button variant="outline" onClick={handlePasswordChange} disabled={isLoading}>
                {isLoading ? "Yenilənir..." : t("changePassword") || "Şifrəni Dəyiş"}
              </Button>
            </div>
          </div>
        ) : (
          <Alert>
             <AlertCircle className="h-4 w-4" />
             <AlertTitle>Məlumat</AlertTitle>
             <AlertDescription>
               Siz sosial şəbəkə ({user?.app_metadata?.provider}) ilə daxil olduğunuz üçün şifrəni buradan dəyişə bilməzsiniz.
             </AlertDescription>
          </Alert>
        )}

        {/* Çıxış */}
        <div className="p-6 bg-card/50 rounded-lg border border-destructive/20 flex justify-between items-center">
           <div>
             <h2 className="text-lg font-semibold text-destructive">{t("logoutTitle") || "Hesabdan Çıxış"}</h2>
             <p className="text-sm text-muted-foreground">Cari sessiyanı sonlandırın</p>
           </div>
           <Button variant="destructive" onClick={signOut}>
             <LogOut className="mr-2 h-4 w-4" /> {t("logout") || "Çıxış et"}
           </Button>
        </div>
      </div>
    </div>
  );
}