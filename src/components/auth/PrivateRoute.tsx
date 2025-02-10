// File: components/navigation/PrivateRoute.tsx
import React, { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  console.log('[PrivateRoute] Rendered. isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);
  console.log('[PrivateRoute] Current location:', location);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Construct the /signin URL with a 'redirect' query parameter
      const redirectUrl = `/signin?redirect=${encodeURIComponent(location.pathname)}`;
      console.log('[PrivateRoute] useEffect: Not authenticated. Redirecting to:', redirectUrl);
      navigate(redirectUrl, { replace: true }); // Use replace
    }
  }, [isLoading, isAuthenticated, navigate, location]);

  if (isLoading) {
    console.log('[PrivateRoute] Loading...');
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
};