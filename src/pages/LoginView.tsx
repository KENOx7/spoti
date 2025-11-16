// src/pages/LoginView.tsx
import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Background image (Sizin mövcud kodunuz)
const backgroundImage = new URL("../Raper album cover.jpg", import.meta.url).href;

// --- API ÜNVANI (auth-context.tsx ilə eyni olmalıdır) ---
const API_BASE_URL = "http://localhost:5000";

export default function LoginView() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // --- E-POÇT İLƏ GİRİŞ FUNKSİYASI ---
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Emaili həm email, həm istifadəçi adı kimi yoxlayırıq
    const success = await login(email, password);
    
    if (success) {
      toast({
        title: "Success",
        description: "Logged in successfully.",
      });
      navigate("/"); // Ana səhifəyə yönləndir
    } else {
      toast({
        title: "Login failed",
        description: "Invalid credentials or server error.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  // --- GOOGLE İLƏ GİRİŞ ÜÇÜN YENİ FUNKSİYALAR ---
  const handleGoogleLogin = async () => {
    try {
      // 1. Backend-dən Google-un icazə URL-ini al
      const response = await fetch(`${API_BASE_URL}/api/auth/google/login`, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success && data.authorization_url) {
        // 2. İstifadəçini Google-un səhifəsinə yönləndir
        window.location.href = data.authorization_url;
      } else {
        toast({
          title: "Google Login failed",
          description: "Could not get Google authorization URL.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Google login xətası:", error);
      toast({
        title: "Error",
        description: "Failed to connect to server for Google login.",
        variant: "destructive",
      });
    }
  };

  // Sizin `LoginView.tsx`-nin qalan hissəsi (UI)
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      {/* Background Image */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      ></div>

      {/* Login Box (DÜZƏLİŞ BURADADIR) */}
      <div className="relative z-10 w-full max-w-md p-8 sm:p-10 bg-zinc-900/80 backdrop-blur-none rounded-xl shadow-2xl border border-zinc-700/50">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold mb-2">Sign In</h1>
          <p className="text-base text-muted-foreground">
            Access your account or continue with Google.
          </p>
        </div>

        {/* Google Login Button */}
        <div className="space-y-4">
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 text-base font-medium"
            onClick={handleGoogleLogin}
          >
            {/* <FaGoogle className="mr-2 h-5 w-5" /> */}
            Continue with Google
          </Button>

          {/* Divider */}
          <div className="flex items-center space-x-2">
            <div className="flex-grow border-t border-border/50"></div>
            <span className="text-xs text-muted-foreground">OR</span>
            <div className="flex-grow border-t border-border/50"></div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email or Username</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="text" // Email və ya username ola bilər
                  placeholder="name@example.com"
                  className="pl-10 h-12"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 h-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-medium"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In with Email"}
            </Button>
          </form>

          {/* Guest Button */}
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => navigate("/")} // Qonaq kimi davam et (ana səhifəyə)
          >
            <User className="mr-2 h-4 w-4" />
            Continue as Guest
          </Button>

          {/* Legal text */}
          <div className="mt-8 pt-6 border-t border-border/50">
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}