import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Qonaq rejimini yoxla
    const guestStatus = localStorage.getItem("guest_mode") === "true";
    if (guestStatus) setIsGuest(true);

    // 2. Sessiyanı yoxla
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("Auth error:", error);
      } finally {
        // Nə olursa olsun, yoxlama bitən kimi LOADING-i SÖNDÜR!
        // Artıq heç nəyi gözləmirik.
        setIsLoading(false);
      }
    };

    initAuth();

    // 3. Dəyişiklikləri dinlə
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          setIsGuest(false);
          localStorage.removeItem("guest_mode");
        }
        
        // Login/Logout olanda da loading-i dərhal söndür
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setIsGuest(false);
      localStorage.removeItem("guest_mode");
      setSession(null);
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    localStorage.setItem("guest_mode", "true");
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isAuthenticated: !!user,
        isGuest,
        isLoading,
        signOut,
        continueAsGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};