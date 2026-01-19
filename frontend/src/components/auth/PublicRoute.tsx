import { Navigate } from "react-router-dom";
import { authService } from "@/services/auth.service";

interface PublicRouteProps {
  children: React.ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
  const isAuthenticated = authService.isAuthenticated();

  // Se já está logado, redireciona para dashboard
  if (isAuthenticated) {
    return <Navigate to="/tokens" replace />;
  }

  return <>{children}</>;
}
