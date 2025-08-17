import React, { useEffect, ReactNode } from "react";
import useAuth from "../hooks/useAuth";
import Login from "../pages/auth/login";

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  redirectToLogin?: boolean;
  requiredRole?: number;
  requiredService?: string;
  fallback?: ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = true,
  redirectToLogin = true,
  requiredRole,
  requiredService,
  fallback = null,
}) => {
  const auth = useAuth();

  useEffect(() => {
    if (auth.isAuthenticated && auth.isTokenValid()) {
      auth.refresh();
    } else if (auth.isAuthenticated && !auth.isTokenValid()) {
      auth.logout();
    }
  }, []);

  if (!requireAuth) {
    return <>{children}</>;
  }

  if (!auth.isLoggedIn || !auth.isTokenValid()) {
    if (redirectToLogin) {
      return <Login />;
    }
    return <>{fallback}</>;
  }

  if (requiredRole !== undefined && !auth.hasRole(requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-4">
            Access Denied
          </h2>
          <p className="text-muted-foreground">
            You don't have the required permissions to access this page.
          </p>
        </div>
      </div>
    );
  }

  if (requiredService && !auth.hasService(requiredService)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-4">
            Service Not Available
          </h2>
          <p className="text-muted-foreground">
            You don't have access to the {requiredService} service.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
