import { Navigate, useLocation } from "react-router-dom";
import { authService } from "@/services/auth.service";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    // Redireciona para login, salvando a rota atual para voltar depois
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
