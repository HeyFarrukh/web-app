import { useState, useEffect } from 'react';
import supabase from '@/config/supabase';
import { googleAuthService } from '@/services/auth/googleAuthService';
import { AuthChangeEvent, Session } from '@supabase/supabase-js'; 

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

    const fetchAndUpsertUserProfile = async (userId: string) => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          console.error("[useAuth] Error fetching user:", userError);
          return;
        }
        const userData: UserData = {
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.full_name || user.user_metadata?.name || null,
          picture: user.user_metadata?.avatar_url || null,
          last_login: new Date().toISOString(),
        };
        await googleAuthService.upsertUserData(userData);

        if (mounted) {
          setUserData(userData);
        }
      } catch (fetchError) {
        console.error('[useAuth] Error fetching or upserting user profile', fetchError);
      }
    };

    console.log('[useAuth] Setting up auth state change listener');

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {

      if (!mounted) return;

      console.log('[useAuth] Auth state changed:', event, session);

        switch (event) {
          case 'INITIAL_SESSION':
          case 'SIGNED_IN':
            if (session?.user) {
              setIsAuthenticated(true);
              fetchAndUpsertUserProfile(session.user.id)
                .finally(() => setIsLoading(false));
            } else {
              setIsAuthenticated(false);
              setUserData(null);
              setIsLoading(false);
            }
            break;
          case 'SIGNED_OUT':
            setIsAuthenticated(false);
            setUserData(null);
            setIsLoading(false);
            break;
          case 'TOKEN_REFRESHED':
            // Supabase handles refresh.  Update user data if needed.
            if (session?.user) {
                setIsAuthenticated(true);
                fetchAndUpsertUserProfile(session.user.id).finally(() => {
                  if(mounted) setIsLoading(false)
                });
              }
            break;
          // Since you only use Google OAuth, these are less critical, but it's good practice to handle them.
          case 'USER_UPDATED':
             if (session?.user) {
                setIsAuthenticated(true);
                fetchAndUpsertUserProfile(session.user.id).finally(() => { if(mounted) setIsLoading(false)});
              } else {
                // If USER_UPDATED with no session, likely a sign-out scenario
                setIsAuthenticated(false);
                setUserData(null);
                setIsLoading(false)
              }
              break;
          default:
            // Handle any unexpected event, don't sign out
            console.log('[useAuth] Unhandled auth event:', event);
            if (session?.user) {
              //If session exists keep the user logged in
              setIsAuthenticated(true);
              fetchAndUpsertUserProfile(session.user.id).finally(() => { if(mounted) setIsLoading(false)});
            } else {
              setIsAuthenticated(false)
              setUserData(null)
              setIsLoading(false)
            }
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