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

    // 2. URL-də OAuth kodu varmı?
    const isRedirecting = window.location.hash.includes('access_token') || 
                          window.location.search.includes('code');

    // 3. Auth yoxlanışı
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        // Əgər redirect yoxdursa, dərhal aç
        if (!isRedirecting) {
          setIsLoading(false);
        }
      }
    };

    checkAuth();

    // 4. Dəyişiklikləri dinlə
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setIsGuest(false);
          localStorage.removeItem("guest_mode");
        }
        // Hadisə baş verən kimi yüklənməni dayandır
        setIsLoading(false);
      }
    );

    // --- YENİ HİSSƏ: TƏHLÜKƏSİZLİK TİMEOUT-U ---
    // Telefonda ilişib qalmaması üçün 4 saniyədən sonra məcburi açırıq
    const safetyTimer = setTimeout(() => {
      setIsLoading((prev) => {
        if (prev) {
           console.log("Safety timeout triggered: Forcing app open");
           return false;
        }
        return prev;
      });
    }, 4000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(safetyTimer);
    };
  }, []);

  const signOut = async () => {
    setIsLoading(true); // Çıxış edəndə qısa loading göstər
    await supabase.auth.signOut();
    setIsGuest(false);
    localStorage.removeItem("guest_mode");
    setSession(null);
    setUser(null);
    setIsLoading(false);
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
