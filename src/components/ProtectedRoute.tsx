import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading, initialized } = useAuthStore();
  const location = useLocation();

  if (!initialized || isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Verificando sesión segura...</p>
      </div>
    );
  }

  if (!user) {
    // Redirigir a login pero guardar la ubicación a la que intentaba ir
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
