// File: components/auth/AuthCallBack.tsx
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GoogleAuthService } from '../../services/auth/googleAuth';
import supabase from '../../config/supabase';
import { SupabaseUserProfile } from '../../types/auth';

export const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('[AuthCallback] Component mounted');

    const handleCallback = async (session: any) => { // Require the session
      console.log('[AuthCallback] Starting callback handler');
      try {
        if (!session?.user) {
          console.error('[AuthCallback] No user in session');
          navigate('/signin');
          return;
        }

        console.log('[AuthCallback] Session valid, processing user data');
        const { user } = session;

        if (!user.email) {
          console.error('[AuthCallback] User email missing');
          navigate('/signin');
          return;
        }

        console.log('[AuthCallback] Creating/updating user profile');
        const userData: SupabaseUserProfile = {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.user_metadata?.name || null,
          picture: user.user_metadata?.avatar_url || null,
          last_login: new Date().toISOString(),
        };

        await GoogleAuthService.saveUserProfile(user, userData);
        localStorage.setItem('user_data', JSON.stringify(userData));

        // Get redirect path from query parameters *within* handleCallback
        console.log('[AuthCallback] Getting redirect path from query params');
        const searchParams = new URLSearchParams(location.search); // Use location.search
        const redirectTo = searchParams.get('redirect') || '/optimise-cv';
        console.log('[AuthCallback] Redirecting to:', redirectTo);
        navigate(redirectTo, { replace: true });

      } catch (error) {
        console.error('[AuthCallback] Callback error:', error);
        navigate('/signin');
      }
    };

    // Subscribe to auth state changes.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[AuthCallback] Auth state change:', event, session); // Log the session
      if (event === 'SIGNED_IN' && session?.user) {
        // Only call handleCallback for SIGNED_IN *with a user*.
        console.log('[AuthCallback] Handling SIGNED_IN');
        handleCallback(session);
      }
      // Do *NOT* handle INITIAL_SESSION here.  Let getSession handle it.
    });
        const getSession = async () => {
            const {data: {session}, error} = await supabase.auth.getSession();
            if(session) {
                handleCallback(session)
            }
        }
        getSession()
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location]); // navigate and location as dependencies

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Completing sign in...</p>
      </div>
    </div>
  );
};