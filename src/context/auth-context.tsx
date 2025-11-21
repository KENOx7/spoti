import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js";

type SpotifyAuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
  spotifyAuth: SpotifyAuthState;
  getSpotifyAccessToken: (forceRefresh?: boolean) => Promise<string | null>;
  clearSpotifyAuth: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SPOTIFY_AUTH_STORAGE_KEY = "spotify_auth_tokens";
const defaultSpotifyAuthState: SpotifyAuthState = {
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
};

const getInitialSpotifyAuth = (): SpotifyAuthState => {
  if (typeof window === "undefined") return defaultSpotifyAuthState;
  try {
    const stored = localStorage.getItem(SPOTIFY_AUTH_STORAGE_KEY);
    return stored ? { ...defaultSpotifyAuthState, ...JSON.parse(stored) } : defaultSpotifyAuthState;
  } catch {
    return defaultSpotifyAuthState;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [spotifyAuth, setSpotifyAuth] = useState<SpotifyAuthState>(() => getInitialSpotifyAuth());

  // Persist Spotify tokens to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!spotifyAuth.accessToken) {
      localStorage.removeItem(SPOTIFY_AUTH_STORAGE_KEY);
      return;
    }
    localStorage.setItem(SPOTIFY_AUTH_STORAGE_KEY, JSON.stringify(spotifyAuth));
  }, [spotifyAuth]);

  const clearSpotifyAuth = useCallback(() => {
    setSpotifyAuth(defaultSpotifyAuthState);
    if (typeof window !== "undefined") {
      localStorage.removeItem(SPOTIFY_AUTH_STORAGE_KEY);
    }
  }, []);

  const captureSpotifyTokens = useCallback((nextSession: Session | null) => {
    if (!nextSession?.provider_token) return;
    const expiresInSeconds = nextSession.expires_in ?? 3600;
    const expiresAtBuffer = expiresInSeconds > 60 ? expiresInSeconds - 60 : expiresInSeconds;
    setSpotifyAuth((prev) => ({
      accessToken: nextSession.provider_token,
      refreshToken: nextSession.provider_refresh_token ?? prev.refreshToken,
      expiresAt: Date.now() + expiresAtBuffer * 1000,
    }));
  }, []);

  const getSpotifyAccessToken = useCallback(
    async (forceRefresh = false): Promise<string | null> => {
      const hasValidToken =
        spotifyAuth.accessToken &&
        spotifyAuth.expiresAt !== null &&
        spotifyAuth.expiresAt > Date.now() + 5000;

      if (!forceRefresh && hasValidToken) {
        return spotifyAuth.accessToken;
      }

      try {
        const { data, error } = await supabase.auth.refreshSession();
        if (error) throw error;
        const refreshedSession = data.session ?? null;
        if (refreshedSession?.provider_token) {
          captureSpotifyTokens(refreshedSession);
          return refreshedSession.provider_token;
        }
        clearSpotifyAuth();
        return null;
      } catch (error) {
        console.error("Spotify token refresh error:", error);
        clearSpotifyAuth();
        return null;
      }
    },
    [spotifyAuth, captureSpotifyTokens, clearSpotifyAuth]
  );

  useEffect(() => {
    let isMounted = true;

    // 1. Qonaq rejimini yoxla
    if (typeof window !== "undefined") {
      const guestStatus = localStorage.getItem("guest_mode") === "true";
      if (guestStatus) setIsGuest(true);
    }

    // 2. Sessiyanı yoxla
    const initAuth = async () => {
      try {
        // PKCE code param-larını Supabase-ə ötür
        if (typeof window !== "undefined") {
          const currentUrl = new URL(window.location.href);
          const hasOAuthParams = currentUrl.searchParams.has("code") || currentUrl.searchParams.has("error");

          if (hasOAuthParams) {
            const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);
            if (error) {
              console.error("OAuth callback error:", error);
            } else {
              captureSpotifyTokens(data.session ?? null);
            }
            // URL-i təmizlə
            currentUrl.search = "";
            window.history.replaceState({}, document.title, currentUrl.toString());
          }
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!isMounted) return;
        setSession(session);
        setUser(session?.user ?? null);
        captureSpotifyTokens(session);
      } catch (error) {
        console.error("Auth error:", error);
      } finally {
        // Nə olursa olsun, yoxlama bitən kimi LOADING-i SÖNDÜR!
        // Artıq heç nəyi gözləmirik.
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    // 3. Dəyişiklikləri dinlə
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!isMounted) return;
        setSession(session);
        setUser(session?.user ?? null);
        captureSpotifyTokens(session);

        if (session?.user) {
          setIsGuest(false);
          if (typeof window !== "undefined") {
            localStorage.removeItem("guest_mode");
          }
        }
        
        // Login/Logout olanda da loading-i dərhal söndür
        setIsLoading(false);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [captureSpotifyTokens]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setIsGuest(false);
      if (typeof window !== "undefined") {
        localStorage.removeItem("guest_mode");
      }
      setSession(null);
      setUser(null);
      clearSpotifyAuth();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("guest_mode", "true");
    }
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
        spotifyAuth,
        getSpotifyAccessToken,
        clearSpotifyAuth,
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