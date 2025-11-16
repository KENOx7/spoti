// src/pages/AccountView.tsx
import { useState, useEffect } from "react";
import { User, Shield, LogOut, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/auth-context";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

// Dinamik URL
const API_BASE_URL = window.location.hostname === "localhost" 
  ? "http://localhost:5000" 
  : "";

export default function AccountView() {
  const { user, isAuthenticated, logout, checkAuth, isLoading: authIsLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isPasswordChanging, setIsPasswordChanging] = useState(false);
  const [isProfileSaving, setIsProfileSaving] = useState(false);

  useEffect(() => {
    if (!authIsLoading) {
      if (isAuthenticated && user) {
        setUsername(user.username || "");
        setEmail(user.email || "");
        loadUserProfile(); // Əlavə məlumatları (avatar) yüklə
      } else {
        // Əgər daxil olmayıbsa, login səhifəsinə yönləndir
        navigate("/login");
      }
    }
  }, [isAuthenticated, user, authIsLoading, navigate]);

  const loadUserProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include", 
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsername(data.username || "");
        setEmail(data.email || "");
        setAvatarUrl(data.avatar_url || "");
      } else if (response.status === 401) {
         logout(); 
         navigate("/login");
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  };

  const handleProfileSave = async () => {
    setIsProfileSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/update-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email }),
        credentials: "include", 
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({ title: "Success", description: "Profile updated successfully." });
        checkAuth(); // Konteksti yenilə
      } else {
        toast({ title: "Update failed", description: data.error, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to connect to server.", variant: "destructive" });
    }
    setIsProfileSaving(false);
  };

  const handlePasswordChange = async () => {
    if (newPassword.length < 8) {
      toast({ title: "Error", description: "Password must be at least 8 characters long.", variant: "destructive" });
      return;
    }

    setIsPasswordChanging(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ new_password: newPassword }),
        credentials: "include", 
      });
      const data = await response.json();
      if (response.ok && data.success) {
        toast({ title: "Success", description: data.message });
        setNewPassword("");
      } else {
        toast({ title: "Change failed", description: data.error, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to connect to server.", variant: "destructive" });
    }
    setIsPasswordChanging(false);
  };

  const handleLogout = async () => {
    await logout();
    toast({ title: "Logged out", description: "You have been logged out successfully." });
    navigate("/");
  };

  const getAvatarFallback = (name) => {
    return name ? name.substring(0, 2).toUpperCase() : "U";
  };
  
  if (authIsLoading || !isAuthenticated) {
    return (
      <div className="container mx-auto max-w-4xl p-8 text-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6 sm:mb-8">Account</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {/* Sol (Avatar) */}
        <div className="md:col-span-1 flex flex-col items-center p-6 bg-card rounded-lg border border-border">
          <Avatar className="h-32 w-32 mb-4">
            <AvatarImage src={avatarUrl || ""} alt={username} />
            <AvatarFallback className="text-4xl">
              {getAvatarFallback(username)}
            </AvatarFallback>
          </Avatar>
          <Button variant="outline" className="w-full" disabled>
            <Camera className="mr-2 h-4 w-4" />
            Change Photo (Soon)
          </Button>
        </div>

        {/* Sağ (Formlar) */}
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 bg-card rounded-lg border border-border">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <User className="mr-2 h-5 w-5" /> Profile Settings
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleProfileSave}
                disabled={isProfileSaving}
                className="w-full sm:w-auto"
              >
                {isProfileSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>

          <div className="p-6 bg-card rounded-lg border border-border">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Shield className="mr-2 h-5 w-5" /> Security
            </h2>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
              {newPassword && newPassword.length < 8 && (
                <p className="text-xs text-muted-foreground">
                  Password must be at least 8 characters long
                </p>
              )}
            </div>
            <Button 
              variant="outline" 
              onClick={handlePasswordChange}
              disabled={isPasswordChanging || !newPassword}
              className="w-full sm:w-auto mt-4"
            >
              {isPasswordChanging ? "Changing..." : "Change Password"}
            </Button>
          </div>
          
          <div className="p-6 bg-card rounded-lg border border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold text-destructive">Logout</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Sign out of your account
              </p>
            </div>
            <Button 
              variant="destructive" 
              onClick={handleLogout}
              className="w-full sm:w-auto"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}