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

    const handleCallback = async () => {
      console.log('[AuthCallback] Starting callback handler');
      try {
        console.log('[AuthCallback] Getting current session');
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('[AuthCallback] Session error:', error);
          navigate('/signin'); // Redirect to signin on error
          return;
        }

        if (!session?.user) {
          console.error('[AuthCallback] No user in session');
          navigate('/signin'); // Redirect if no user
          return;
        }

        console.log('[AuthCallback] Session valid, processing user data');
        const { user } = session;

        // No need to decode the JWT here; Supabase session has the data
        if (!user.email) {
          console.error('[AuthCallback] User email missing');
          navigate('/signin'); // Redirect if email is somehow missing
          return;
        }

        console.log('[AuthCallback] Creating/updating user profile');
        const userData: SupabaseUserProfile = {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.user_metadata?.name || null,  // Use metadata
          picture: user.user_metadata?.avatar_url || null,
          last_login: new Date().toISOString()
        };
      
        // Upsert the user profile
        await GoogleAuthService.saveUserProfile(user, userData);

        // Save to localStorage
        localStorage.setItem('user_data', JSON.stringify(userData));

        console.log('[AuthCallback] Getting redirect path');
        const state = location.state as { from?: Location };
        const redirectTo = state?.from?.pathname || '/apprenticeships'; // Default to /apprenticeships

        console.log('[AuthCallback] Redirecting to:', redirectTo);
        navigate(redirectTo, { replace: true });

      } catch (error) {
        console.error('[AuthCallback] Callback error:', error);
        navigate('/signin'); // Redirect on any error
      }
    };

    handleCallback();
  }, [navigate, location]);

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Completing sign in...</p>
      </div>
    </div>
  );
};