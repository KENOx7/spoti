import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Giriş təsdiqlənir...");

  useEffect(() => {
    // 1. URL-dəki xətanı yoxla (Spotify-dan gələn error)
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace("#", "?"));
    
    if (params.get("error")) {
      setMessage("Giriş xətası: " + params.get("error_description"));
      setTimeout(() => navigate("/login", { replace: true }), 3000);
      return;
    }

    const handleAuth = async () => {
      // 2. Mövcud sessiyanı yoxla
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Auth Error:", error);
        setMessage("Xəta baş verdi. Giriş səhifəsinə yönləndirilirsiniz...");
        setTimeout(() => navigate("/login", { replace: true }), 2000);
        return;
      }

      // 3. Əgər sessiya varsa, AuthProvider-in yenilənməsi üçün bir az gözlə və yönləndir
      if (session) {
        setMessage("Uğurlu! Yönləndirilirsiniz...");
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 1000); // 1 saniyə gözləyirik ki, ProtectedLayout sessiyanı görsün
        return;
      }

      // 4. Sessiya hələ yoxdursa, hadisəni dinlə
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setMessage("Uğurlu! Yönləndirilirsiniz...");
          setTimeout(() => {
            navigate("/", { replace: true });
          }, 1000);
        }
      });

      // Timeout: 5 saniyə ərzində heç nə olmasa loginə at
      setTimeout(() => {
         supabase.auth.getSession().then(({ data }) => {
           if (!data.session) {
             navigate("/login", { replace: true });
           }
         });
      }, 5000);

      return () => {
        subscription.unsubscribe();
      };
    };

    handleAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4 text-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mb-6"></div>
      <h2 className="text-xl font-semibold animate-pulse">{message}</h2>
      <p className="text-gray-500 mt-2 text-sm">Zəhmət olmasa gözləyin...</p>
    </div>
  );
}
