// src/pages/AccountView.tsx
import { useState } from "react";
import { User, Shield, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AccountView() {

  const [username, setUsername] = useState("istifadeci_adi");
  const [email, setEmail] = useState("user@example.com");

  // Şifrə dəyişmə üçün əlavə state-lər
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleProfileSave = () => {
    console.log("Profil yadda saxlanılır:", { username, email });
    alert("Profil məlumatları yadda saxlanıldı (konsola baxın)");
  };

  const handlePasswordChange = () => {

    if (oldPassword.length === 0) {
      alert("Köhnə şifrəni daxil edin.");
      return;
    }

    if (newPassword.length < 6) {
      alert("Yeni şifrə ən az 6 simvol olmalıdır.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Yeni şifrə və təkrar uyğun deyil.");
      return;
    }

    console.log("Şifrə dəyişdirilir...");
    alert("Şifrə dəyişdirildi (real deyil)");

    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleLogout = () => {
    console.log("İstifadəçi hesabdan çıxır...");
    alert("Hesabdan çıxış edildi.");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">

      {/* Başlıq */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-muted/50">
          <User className="h-8 w-8 text-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Hesabım</h1>
          <p className="text-muted-foreground">
            Hesab məlumatlarınızı və parametrlərinizi idarə edin.
          </p>
        </div>
      </div>

      {/* Profil */}
      <div className="p-6 bg-card rounded-lg space-y-4">
        <h2 className="text-xl font-semibold">Profil Məlumatları</h2>

        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src="https://github.com/shadcn.png" alt="User" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <Button variant="outline">Şəkli Dəyiş</Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">İstifadəçi Adı</Label>
          <Input 
            id="username" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-poçt</Label>
          <Input 
            id="email" 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <Button onClick={handleProfileSave}>Dəyişiklikləri Yadda Saxla</Button>
      </div>

      {/* Təhlükəsizlik */}
      <div className="p-6 bg-card rounded-lg space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Təhlükəsizlik
        </h2>

        {/* Köhnə Şifrə */}
        <div className="space-y-2">
          <Label htmlFor="oldPassword">Köhnə Şifrə</Label>
          <Input
            id="oldPassword"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
        </div>

        {/* Yeni Şifrə */}
        <div className="space-y-2">
          <Label htmlFor="newPassword">Yeni Şifrə</Label>
          <Input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        {/* Yeni Şifrə (Təkrar) */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Yeni Şifrə (Təkrar)</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <Button variant="outline" onClick={handlePasswordChange}>
          Şifrəni Dəyiş
        </Button>
      </div>

      {/* Hesabdan Çıxış */}
      <div className="p-6 bg-card rounded-lg flex justify-between items-center">
         <h2 className="text-xl font-semibold text-destructive">Hesabdan Çıxış</h2>
         <Button variant="destructive" onClick={handleLogout}>
           <LogOut className="mr-2 h-4 w-4" />
           Çıxış Et
         </Button>
      </div>

    </div>
  );
}
