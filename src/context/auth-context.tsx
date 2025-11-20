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
  
  // Başlanğıcda true edirik ki, yoxlama bitənə qədər heç kimi bayıra atmasın
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Qonaq rejimini yoxla
    const guestStatus = localStorage.getItem("guest_mode") === "true";
    if (guestStatus) setIsGuest(true);

    // 2. URL-də Spotify/Google kodu varmı? (Redirect yoxlanışı)
    // Əgər URL-də 'code' və ya 'access_token' varsa, deməli OAuth-dan qayıdırıq.
    // Bu halda isLoading-i FALSE etməyə tələsmirik!
    const isRedirecting = window.location.hash.includes('access_token') || 
                          window.location.search.includes('code') ||
                          window.location.hash.includes('type=recovery');

    // 3. Auth yoxlanışı
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      // Əgər Redirect baş verirsə, isLoading-i true saxla (onAuthStateChange həll edəcək)
      // Əgər adi girişdirsə, isLoading-i bitir.
      if (!isRedirecting) {
        setIsLoading(false);
      }
    });

    // 4. Dəyişiklikləri dinlə
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        // Login uğurlu olduqda və ya bitdikdə:
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setIsGuest(false);
          localStorage.removeItem("guest_mode");
        }

        // ƏN VACİB HİSSƏ: Auth prosesi bitən kimi yüklənməni dayandır
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
