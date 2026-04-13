import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { usePermissions } from "@/hooks/usePermissions";

interface ProtectedRouteProps {
  children: React.ReactNode;
  module?: string;
}

export function ProtectedRoute({ children, module }: ProtectedRouteProps) {
  const { session, loading } = useAuth();
  const { canAccessModule } = usePermissions();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;

  if (module && !canAccessModule(module as any)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
