import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase-dən gələn sessiya dəyişikliyini dinləyirik
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        // Uğurlu giriş -> Ana səhifəyə yönləndir
        navigate("/", { replace: true });
      } else {
        // Sessiya tapılmadısa, bir az gözləyib loginə at (dərhal atmasın deyə)
        setTimeout(() => {
           navigate("/login", { replace: true });
        }, 1500);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4"></div>
      <p className="text-gray-400 text-lg">Giriş təsdiqlənir...</p>
    </div>
  );
}
