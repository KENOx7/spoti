import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) navigate("/", { replace: true });
        else navigate("/login", { replace: true });
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <div style={{ color: "white", padding: 20, fontSize: 18 }}>
      Connecting to Spotify...
    </div>
  );
}
