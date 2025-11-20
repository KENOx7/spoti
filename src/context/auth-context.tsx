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

    // 2. Auth vəziyyətini yoxla
    const initAuth = async () => {
      try {
        // URL-də OAuth kodu varmı? Varsa, isLoading-i hələ false etmə!
        const isHandlingRedirect = window.location.hash.includes('access_token') || 
                                   window.location.search.includes('code');

        const { data: { session } } = await supabase.auth.getSession();
        
        setSession(session);
        setUser(session?.user ?? null);

        // Əgər URL-də kod varsa, onAuthStateChange hadisəsini gözləyəcəyik
        if (!isHandlingRedirect) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Auth init xətası:", error);
        setIsLoading(false);
      }
    };

    initAuth();

    // 3. Dəyişiklikləri dinlə (Login/Logout/OAuth redirect)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log("Auth event:", _event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          setIsGuest(false);
          localStorage.removeItem("guest_mode");
        }
        
        // Hər hansı bir auth hadisəsi baş verəndə yüklənməni bitir
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsGuest(false);
    localStorage.removeItem("guest_mode");
    setSession(null);
    setUser(null);
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
