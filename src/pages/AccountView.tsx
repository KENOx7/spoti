import { useState } from "react";
import { User, LogOut, Mail, Shield, LogIn, AlertCircle, Camera, Loader2 } from "lucide-react";
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
  const { user, signOut, isGuest } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false); // Şəkil yüklənmə statusu

  // --- ŞƏKİL YÜKLƏMƏ FUNKSİYASI ---
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      setIsUploading(true);

      // 1. Şəkli Supabase Storage-ə yükləyirik
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Şəklin Public URL-ni alırıq
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 3. İstifadəçinin profilini yeniləyirik (avatar_url)
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateError) throw updateError;

      toast({
        title: "Uğurlu!",
        description: t("avatarUpdated") || "Profil şəkli yeniləndi!",
      });

    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        variant: "destructive",
        title: "Xəta",
        description: error.message || t("uploadError") || "Şəkil yüklənərkən xəta oldu.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // --- QONAQ REJİMİ ---
  if (isGuest) {
    return (
      <div className="p-6 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 mt-10">
        <div className="bg-card border border-border rounded-xl p-8 text-center shadow-lg">
          <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="h-10 w-10 text-primary" />
          </div>
          
          <h1 className="text-3xl font-bold mb-3">{t("guestAccount")}</h1>
          <p className="text-muted-foreground mb-8 text-lg">
            {t("guestMessage")}
          </p>

          <div className="grid gap-4 sm:grid-cols-2 max-w-md mx-auto">
            <Button 
              size="lg" 
              className="w-full" 
              onClick={() => navigate("/login")}
            >
              <LogIn className="mr-2 h-5 w-5" />
              {t("loginOrSignup")}
            </Button>

            <Button 
              size="lg" 
              variant="outline" 
              className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
              onClick={signOut}
            >
              <LogOut className="mr-2 h-5 w-5" />
              {t("endSession")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // --- REAL İSTİFADƏÇİ ---
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

  const providerName = user?.app_metadata?.provider || "social";

  return (
    <div className="p-6 pb-24 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">{t("settings")}</h1>
        <p className="text-muted-foreground">{t("manageProfile")}</p>
      </div>

      <div className="space-y-6">
        
        {/* PROFIL KARTI (Şəkil dəyişdirmə ilə) */}
        <div className="p-6 bg-card rounded-lg border border-border flex flex-col sm:flex-row items-start sm:items-center gap-6 shadow-sm">
          
          {/* AVATAR HİSSƏSİ */}
          <div className="relative group">
            <Avatar className="h-24 w-24 sm:h-28 sm:w-28 border-4 border-background shadow-xl cursor-pointer transition-transform group-hover:scale-105">
              <AvatarImage src={user?.user_metadata?.avatar_url} className="object-cover" />
              <AvatarFallback className="text-3xl font-bold bg-primary/10 text-primary">
                {(user?.email?.[0] || "U").toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Yükləmə Overlay-i */}
            <label 
              htmlFor="avatar-upload" 
              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              {isUploading ? (
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              ) : (
                <Camera className="h-8 w-8 text-white" />
              )}
            </label>
            
            {/* Gizli Input */}
            <input 
              type="file" 
              id="avatar-upload" 
              accept="image/*" 
              className="hidden" 
              onChange={handleAvatarUpload}
              disabled={isUploading}
            />
          </div>

          <div className="space-y-1 flex-1">
            <h2 className="text-2xl font-semibold">
              {user?.user_metadata?.full_name || user?.email?.split("@")[0]}
            </h2>
            <div className="flex items-center text-muted-foreground">
              <Mail className="h-4 w-4 mr-2" /> {user?.email}
            </div>
            
            <div className="flex flex-wrap gap-2 mt-2">
               <div className="flex items-center text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded w-fit">
                <Shield className="h-3 w-3 mr-1" /> 
                {user?.app_metadata?.provider === 'email' ? t("emailAccount") : t("socialAccount")}
              </div>
              <label htmlFor="avatar-upload" className="text-xs font-medium bg-secondary hover:bg-secondary/80 px-3 py-1 rounded cursor-pointer transition-colors">
                 {t("changeAvatar") || "Şəkli Dəyiş"}
              </label>
            </div>

          </div>
        </div>

        {/* Şifrə Dəyişmə */}
        {user?.app_metadata?.provider === 'email' ? (
          <div className="p-6 bg-card rounded-lg border border-border space-y-4 shadow-sm">
            <div>
              <h2 className="text-xl font-semibold mb-1">{t("security")}</h2>
              <p className="text-sm text-muted-foreground">{t("updatePassword")}</p>
            </div>
            <div className="grid gap-4 max-w-md">
              <div className="space-y-2">
                <Label>{t("newPassword")}</Label>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label>{t("confirmPassword")}</Label>
                <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" />
              </div>
              <Button variant="outline" onClick={handlePasswordChange} disabled={isLoading}>
                {isLoading ? "..." : t("changePassword")}
              </Button>
            </div>
          </div>
        ) : (
          <Alert>
             <AlertCircle className="h-4 w-4" />
             <AlertTitle>{t("info")}</AlertTitle>
             <AlertDescription>
               {t("socialLoginMessage").replace("{provider}", providerName)}
             </AlertDescription>
          </Alert>
        )}

        {/* Çıxış */}
        <div className="p-6 bg-card/50 rounded-lg border border-destructive/20 flex justify-between items-center">
           <div>
             <h2 className="text-lg font-semibold text-destructive">{t("logoutTitle")}</h2>
             <p className="text-sm text-muted-foreground">{t("logoutDescription")}</p>
           </div>
           <Button variant="destructive" onClick={signOut}>
             <LogOut className="mr-2 h-4 w-4" /> {t("logout")}
           </Button>
        </div>
      </div>
    </div>
  );
}
