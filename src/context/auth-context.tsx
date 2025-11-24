import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isGuest: boolean;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  
  // Ən vacib yer: isLoading ilkin olaraq TRUE olmalıdır!
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Səhifə ilk açılanda sessiyanı yoxlayırıq
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("Auth init error:", error);
      } finally {
        // Yoxlama bitdi, loading-i dayandırırıq
        setIsLoading(false);
      }
    };

    initAuth();

    // 2. Auth dəyişikliklərini dinləyirik (Login/Logout zamanı)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", _event, session); // Debug üçün
      setSession(session);
      setUser(session?.user ?? null);
      
      // Login olduqdan sonra guest rejimini söndür
      if (session?.user) {
        setIsGuest(false);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setIsGuest(false);
    setIsLoading(false);
  };

  const continueAsGuest = () => {
    setIsGuest(true);
  };

  const value = {
    session,
    user,
    isAuthenticated: !!user, // User varsa true, yoxsa false
    isLoading,
    isGuest,
    signOut,
    continueAsGuest,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};