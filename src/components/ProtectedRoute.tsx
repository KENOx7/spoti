import { useAuth } from "@/context/auth-context";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isGuest, isLoading } = useAuth();
  const location = useLocation();

  // 1. Əgər hələ Supabase-dən cavab gözləyiriksə, sadəcə fırlanan dairə göstər
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background text-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // 2. Yükləmə bitdi. Nə istifadəçi var, nə də qonaqdırsa -> Loginə at
  if (!isAuthenticated && !isGuest) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Hər şey qaydasındadırsa səhifəni göstər
  return <>{children}</>;
};