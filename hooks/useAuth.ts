import { useState, useEffect } from 'react';
import supabase from '@/config/supabase';
import { Analytics } from '@/services/analytics/analytics';

interface UserData {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
  created_at?: string;
  last_login?: string;
}

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    let mounted = true;
    console.log('[useAuth] Hook initialized');

    const checkAuth = async () => {
      console.log('[useAuth] Starting initial auth check...');
      setIsLoading(true);
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('[useAuth] Initial session error:', error);
        }

        if (mounted) {
          if (session?.user) {
            console.log('[useAuth] User found in initial session');
            setIsAuthenticated(true);
            // Preferentially load from localStorage, fallback to fetching
            const storedData = localStorage.getItem('user_data');
            if (storedData) {
              setUserData(JSON.parse(storedData));
            } else {
              // Fetch and save the profile
              await fetchAndSaveUserProfile(session.user);
            }
          } else {
            console.log('[useAuth] No user in initial session');
            setIsAuthenticated(false);
            setUserData(null);
          }
        }
      } catch (error) {
        console.error('[useAuth] Initial auth check failed:', error);
        if (mounted) {
          setIsAuthenticated(false);
          setUserData(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    const fetchAndSaveUserProfile = async (user: any) => {
      try {
        const userData: UserData = {
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.full_name || user.user_metadata?.name || null,
          picture: user.user_metadata?.avatar_url || null,
          last_login: new Date().toISOString(),
        };

        localStorage.setItem('user_data', JSON.stringify(userData));
        if (mounted) {
          setUserData(userData);
        }
      } catch (fetchError) {
        console.error('[useAuth] Error fetching user profile', fetchError);
      }
    };

    checkAuth();

    console.log('[useAuth] Setting up auth state change listener');
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[useAuth] Auth state changed:', event);

      if (!mounted) {
        console.log('[useAuth] Component unmounted, ignoring auth state change');
        return;
      }

      if (event === 'SIGNED_IN' && session?.user) {
        console.log('[useAuth] User signed in, fetching and saving profile');
        setIsAuthenticated(true);
        fetchAndSaveUserProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        console.log('[useAuth] User signed out, clearing state');
        setIsAuthenticated(false);
        setUserData(null);
        localStorage.removeItem('user_data');
      }
    });

    return () => {
      console.log('[useAuth] Cleaning up auth hook');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { isAuthenticated, isLoading, userData };
};