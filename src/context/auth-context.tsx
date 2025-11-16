import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Kullanıcı veri tipi
interface User {
  id?: string;
  username: string;
  email?: string;
  guest?: boolean;
  avatar_url?: string;
}

// Context tipi
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  signup: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- DİNAMİK API URL AYARI ---
// Bu kısım, uygulamanın nerede çalıştığını otomatik algılar.
// Localhost'ta ise Python server'a (5000), Vercel'de ise canlı backende bağlanır.
const API_BASE_URL = window.location.hostname === "localhost" 
  ? "http://localhost:5000" 
  : "https://spoti-rose.vercel.app";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Oturum kontrolü (Sayfa yenilendiğinde çalışır)
  const checkAuth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/check-auth`, {
        method: "GET",
        credentials: "include", // Cookie göndermek için şart
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Backend'den gelen yanıt: { authenticated: true, user: {...} }
        if (data.authenticated && data.user) {
          setUser({ 
            id: data.user.id,
            username: data.user.username, 
            email: data.user.email,
            guest: data.user.guest,
            avatar_url: data.user.avatar_url
          });
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Uygulama ilk açıldığında kontrol et
  useEffect(() => {
    checkAuth();
  }, []);

  // Giriş Yapma Fonksiyonu
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      
      if (response.ok && data.success && data.user) {
        setUser({ 
          id: data.user.id,
          username: data.user.username, 
          email: data.user.email,
          guest: false
        });
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  // Kayıt Olma Fonksiyonu
  const signup = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();
      
      if (response.ok && data.success && data.user) {
        setUser({
          id: data.user.id,
          username: data.user.username,
          email: data.user.email,
          guest: false
        });
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Signup failed:", error);
      return false;
    }
  };

  // Çıkış Yapma Fonksiyonu
  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      // Her durumda (başarılı veya başarısız) kullanıcıyı frontend'den sil
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && !user.guest, // Misafir değilse giriş yapmış sayılır
        isLoading,
        login,
        signup,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}