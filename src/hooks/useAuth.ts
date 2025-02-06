import { useState, useEffect } from 'react';
import { GoogleAuthService } from '../services/auth/googleAuth';
import supabase from '../config/supabase';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const authStatus = await GoogleAuthService.isAuthenticated();
        setIsAuthenticated(authStatus);

        if (authStatus) {
          const profile = await GoogleAuthService.refreshUserProfile();
          setUserData(profile);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
        setUserData(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        setIsAuthenticated(true);
        const profile = await GoogleAuthService.refreshUserProfile();
        setUserData(profile);
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setUserData(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { isAuthenticated, isLoading, userData };
};