import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Giriş təsdiqlənir...");

  useEffect(() => {
    let mounted = true;

    const handleAuth = async () => {
      // 1. URL-dən gələn sessiyanı yoxla
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Auth Error:", error);
        if (mounted) {
          setMessage("Xəta baş verdi. Giriş səhifəsinə yönləndirilirsiniz...");
          setTimeout(() => navigate("/login", { replace: true }), 2000);
        }
        return;
      }

      if (session) {
        if (mounted) setMessage("Uğurlu! Yönləndirilirsiniz...");
        // VACİB: Context-in yenilənməsi üçün qısa fasilə veririk
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 500); 
        return;
      }

      // 2. Əgər sessiya hələ yoxdursa, dinləyici qururuq
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
          if (mounted) setMessage("Uğurlu! Yönləndirilirsiniz...");
          setTimeout(() => {
            navigate("/", { replace: true });
          }, 500);
        }
      });

      // 3. Fallback: Əgər 5 saniyə ərzində heç nə olmasa, loginə at
      setTimeout(() => {
        if (mounted) {
           // Hələ də sessiya yoxdursa
           supabase.auth.getSession().then(({ data }) => {
             if (!data.session) {
               setMessage("Giriş zamanı vaxt bitdi. Yenidən cəhd edin.");
               navigate("/login", { replace: true });
             }
           });
        }
      }, 5000);

      return () => {
        subscription.unsubscribe();
      };
    };

    handleAuth();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4 text-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mb-6"></div>
      <h2 className="text-xl font-semibold animate-pulse">{message}</h2>
      <p className="text-gray-500 mt-2 text-sm">Zəhmət olmasa gözləyin, Spotify ilə əlaqə qurulur...</p>
    </div>
  );
}
