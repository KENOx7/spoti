import { useAuth } from "@/context/auth-context";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // isGuest-i də buradan alırıq
  const { isAuthenticated, isGuest, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Əgər istifadəçi giriş etməyibsə VƏ qonaq da deyilsə -> Login-ə at
  if (!isAuthenticated && !isGuest) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}