// src/pages/SignupView.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";

// Background image
const backgroundImage = new URL("../Raper album cover.jpg", import.meta.url).href;

// Dinamik URL
const API_BASE_URL = window.location.hostname === "localhost" 
  ? "http://localhost:5000" 
  : "";

export default function SignupView() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signup } = useAuth(); // signup funksiyasını kontekstdən alırıq
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    if (password.length < 8) {
       toast({
        title: "Weak Password",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Kontekstdəki signup funksiyasını çağırırıq
      const success = await signup(username, email, password);

      if (success) {
        toast({
          title: "Account Created",
          description: "Welcome! You are now logged in.",
        });
        navigate("/"); // Uğurlu qeydiyyatdan sonra ana səhifəyə
      } else {
        // Xəta auth-context-də idarə olunmur, amma burada da yoxlaya bilərik
        // Təkrarlanan email/username xətası backend-dən gələcək
        toast({
          title: "Signup Failed",
          description: "Email or username might already be taken.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Signup fetch error:", error);
      toast({
        title: "Server Error",
        description: "Could not connect to the server.",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      {/* Background Image */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      ></div>
      
      {/* Signup Box */}
      <div className="relative z-10 w-full max-w-md p-8 sm:p-10 bg-zinc-900/80 backdrop-blur-none rounded-xl shadow-2xl border border-zinc-700/50">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold mb-2">Create Account</h1>
          <p className="text-base text-muted-foreground">
            Join us today.
          </p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="username"
                type="text"
                placeholder="Your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10 h-12"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12"
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
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-12"
                required
                minLength={8}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 h-12"
                required
                minLength={8}
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-12 text-base font-medium"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Sign Up"}
          </Button>

          {/* Link to Login */}
          <div className="text-center pt-2">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link 
                to="/login" 
                className="text-primary hover:underline font-medium"
              >
                Sign In
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}