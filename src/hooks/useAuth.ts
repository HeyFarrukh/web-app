// File: hooks/useAuth.ts
import { useState, useEffect } from 'react';
import supabase from '../config/supabase';
import { SupabaseUserProfile } from '../types/auth'; // Import your user profile type

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<SupabaseUserProfile | null>(null);

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
          // Don't throw here; handle it gracefully
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
              await fetchAndSaveUserProfile(session.user.id);
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

    const fetchAndSaveUserProfile = async (userId: string) => {
      try {
          const { data: user, error: userError } = await supabase.auth.getUser();

          if (userError || !user) {
            console.error("[useAuth] Error fetching user:", userError);
            return; // Exit if user fetch fails
          }
          const userData: SupabaseUserProfile = {
            id: user.user!.id,
            email: user.user!.email!,
            name: user.user!.user_metadata?.full_name || user.user!.user_metadata?.name || null,
            picture: user.user!.user_metadata?.avatar_url || null,
            last_login: new Date().toISOString(),
          };

          localStorage.setItem('user_data', JSON.stringify(userData));
          if(mounted) {
            setUserData(userData);
          }
      } catch (fetchError) {
          console.error('[useAuth] Error fetching user profile', fetchError)
      }
    }

    checkAuth(); // Initial check

    console.log('[useAuth] Setting up auth state change listener');
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[useAuth] Auth state changed:', event);

      if (!mounted) {
        console.log('[useAuth] Component unmounted, ignoring auth state change');
        return;
      }

      // Handle SIGNED_IN and SIGNED_OUT *only*.  Other events are less relevant.
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('[useAuth] User signed in, fetching and saving profile');
        setIsAuthenticated(true);
        fetchAndSaveUserProfile(session.user.id); // Fetch and save (or update)

      } else if (event === 'SIGNED_OUT') {
        console.log('[useAuth] User signed out, clearing state');
        setIsAuthenticated(false);
        setUserData(null);
        localStorage.removeItem('user_data'); // Only remove user_data
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