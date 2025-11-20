import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean; // YENİ: Qonaq rejimi
  isLoading: boolean;
  signOut: () => Promise<void>;
  continueAsGuest: () => void; // YENİ: Qonaq funksiyası
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false); // YENİ
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Səhifə yenilənəndə Qonaq rejimini yadda saxlamaq üçün
    const guestStatus = localStorage.getItem("guest_mode") === "true";
    if (guestStatus) setIsGuest(true);

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      // Login olanda guest rejimini söndür
      if (session?.user) {
        setIsGuest(false);
        localStorage.removeItem("guest_mode");
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsGuest(false);
    localStorage.removeItem("guest_mode");
  };

  // YENİ: Qonaq kimi daxil olmaq funksiyası
  const continueAsGuest = () => {
    setIsGuest(true);
    localStorage.setItem("guest_mode", "true");
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      isAuthenticated: !!user, 
      isGuest, // YENİ
      isLoading, 
      signOut,
      continueAsGuest // YENİ
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth AuthProvider daxilində istifadə edilməlidir");
  }
  return context;
};