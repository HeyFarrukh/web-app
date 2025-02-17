'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import supabase from '@/config/supabase';
import { Analytics } from '@/services/analytics/analytics';

export function AuthCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    console.log('[AuthCallback] Component mounted');

    const handleCallback = async () => {
      console.log('[AuthCallback] Starting callback handler');
      try {
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('[AuthCallback] Session error:', sessionError);
          Analytics.event('auth', 'session_error', sessionError.message);
          router.replace('/signin?error=session');
          return;
        }

        if (!session?.user) {
          console.error('[AuthCallback] No user in session');
          router.replace('/signin?error=no_user');
          return;
        }

        try {
          console.log('[AuthCallback] Creating/updating user profile');
          const userData = {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.full_name || null,
            picture: session.user.user_metadata?.avatar_url || null,
            last_login: new Date().toISOString(),
          };

          // Upsert user data
          const { error: upsertError } = await supabase
            .from('users')
            .upsert(userData);

          if (upsertError) {
            console.error('[AuthCallback] Error upserting user data:', upsertError);
            throw upsertError;
          }

          // Store user data in localStorage
          localStorage.setItem('user_data', JSON.stringify(userData));
          Analytics.event('auth', 'callback_success');
          
          // Get redirect path from query parameters
          const redirectTo = searchParams.get('redirect') || '/optimise-cv';
          console.log('[AuthCallback] Redirecting to:', redirectTo);
          router.replace(decodeURIComponent(redirectTo));
        } catch (error) {
          console.error('[AuthCallback] Error upserting user data:', error);
          router.replace('/signin?error=user_data');
        }
      } catch (error) {
        console.error('[AuthCallback] Callback error:', error);
        Analytics.event('auth', 'callback_error', 'unexpected_error');
        router.replace('/signin?error=unexpected');
      }
    };

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[AuthCallback] Auth state change:', event);
      if (event === 'SIGNED_IN' && session) {
        handleCallback();
      }
    });

    // Initial check
    handleCallback();

    return () => {
      subscription.unsubscribe();
    };
  }, [router, searchParams]);

  return null;
}