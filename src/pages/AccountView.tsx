// src/pages/AccountView.tsx
import { useState } from "react";
import { User, Shield, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// DÜZƏLİŞ: useLanguage hooku müvəqqəti yığışdırıldı

export default function AccountView() {
  // DÜZƏLİŞ: Formlar üçün state-lər əlavə edildi
  const [username, setUsername] = useState("istifadeci_adi");
  const [email, setEmail] = useState("user@example.com");
  const [newPassword, setNewPassword] = useState("");

  const handleProfileSave = () => {
    console.log("Profil yadda saxlanılır:", { username, email });
    // Burada real API sorğusu gedəcək
    alert("Profil məlumatları yadda saxlanıldı (konsola baxın)");
  };

  const handlePasswordChange = () => {
    if (newPassword.length < 6) {
      alert("Yeni şifrə ən az 6 simvol olmalıdır.");
      return;
    }
    console.log("Şifrə dəyişdirilir...");
    // Burada real API sorğusu gedəcək
    alert("Şifrə dəyişdirildi (real deyil)");
    setNewPassword("");
  };

  const handleLogout = () => {
    console.log("İstifadəçi hesabdan çıxır...");
    alert("Hesabdan çıxış edildi.");
    // Burada auth context və ya yönləndirmə olacaq
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Səhifə Başlığı */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-muted/50">
          <User className="h-8 w-8 text-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Hesabım</h1>
          <p className="text-muted-foreground">Hesab məlumatlarınızı və parametrlərinizi idarə edin.</p>
        </div>
      </div>

      {/* Profil Məlumatları */}
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
        <div className="space-y-2">
          <Label htmlFor="password">Yeni Şifrə</Label>
          <Input 
            id="password" 
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <Button variant="outline" onClick={handlePasswordChange}>Şifrəni Dəyiş</Button>
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