// src/pages/AccountView.tsx
import { useState } from "react";
import { User, Shield, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLanguage } from "@/context/language-context"; // BU SƏTRİ ƏLAVƏ EDİN

export default function AccountView() {
  const { t } = useLanguage(); // Hook-u çağırırıq

  const [username, setUsername] = useState("istifadeci_adi");
  const [email, setEmail] = useState("user@example.com");

  // Şifrə dəyişmə üçün əlavə state-lər
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleProfileSave = () => {
    console.log("Profil yadda saxlanılır:", { username, email });
    alert(t("profileSaved")); // Tərcümə edildi
  };

  const handlePasswordChange = () => {
    if (oldPassword.length === 0) {
      alert(t("enterOldPassword")); // Tərcümə edildi
      return;
    }

    if (newPassword.length < 6) {
      alert(t("shortPassword")); // Tərcümə edildi
      return;
    }

    if (newPassword !== confirmPassword) {
      alert(t("passwordMismatch")); // Tərcümə edildi
      return;
    }

    console.log("Şifrə dəyişdirilir...");
    alert(t("passwordChanged")); // Tərcümə edildi

    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleLogout = () => {
    console.log("İstifadəçi hesabdan çıxır...");
    alert(t("loggedOut")); // Tərcümə edildi
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">

      {/* Başlıq */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-muted/50">
          <User className="h-8 w-8 text-foreground" />
        </div>
        <div>
          {/* t("account") context-də artıq var idi, onu istifadə edirik */}
          <h1 className="text-3xl font-bold">{t("account")}</h1> 
          <p className="text-muted-foreground">
            {t("accountSubtitle")}
          </p>
        </div>
      </div>

      {/* Profil */}
      <div className="p-6 bg-card rounded-lg space-y-4">
        <h2 className="text-xl font-semibold">{t("profileInfo")}</h2>

        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src="https://github.com/shadcn.png" alt="User" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <Button variant="outline">{t("changePhoto")}</Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">{t("username")}</Label>
          <Input 
            id="username" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{t("email")}</Label>
          <Input 
            id="email" 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <Button onClick={handleProfileSave}>{t("saveChanges")}</Button>
      </div>

      {/* Təhlükəsizlik */}
      <div className="p-6 bg-card rounded-lg space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Shield className="h-5 w-5" />
          {t("security")}
        </h2>

        {/* Köhnə Şifrə */}
        <div className="space-y-2">
          <Label htmlFor="oldPassword">{t("oldPassword")}</Label>
          <Input
            id="oldPassword"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
        </div>

        {/* Yeni Şifrə */}
        <div className="space-y-2">
          <Label htmlFor="newPassword">{t("newPassword")}</Label>
          <Input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        {/* Yeni Şifrə (Təkrar) */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <Button variant="outline" onClick={handlePasswordChange}>
          {t("changePassword")}
        </Button>
      </div>

      {/* Hesabdan Çıxış */}
      <div className="p-6 bg-card rounded-lg flex justify-between items-center">
         <h2 className="text-xl font-semibold text-destructive">{t("logoutTitle")}</h2>
         <Button variant="destructive" onClick={handleLogout}>
           <LogOut className="mr-2 h-4 w-4" />
           {t("logoutButton")}
         </Button>
      </div>

    </div>
  );
}