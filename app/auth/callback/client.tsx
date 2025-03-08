'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import supabase from '@/config/supabase';
import { Analytics } from '@/services/analytics/analytics';

/**
 * Handles authentication callbacks by subscribing to auth state changes and redirecting the user upon a successful sign-in.
 *
 * When the component mounts, it sets up a listener using Supabase’s auth subscription. If a "SIGNED_IN" event is detected with a valid session,
 * it retrieves a redirect URL from the query parameters (defaulting to "/optimise-cv" if none is provided), decodes it, and navigates the user to that URL.
 * It also tracks the redirect event using an analytics service.
 *
 * @returns null since this component does not render any UI.
 */
export function AuthCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    console.log('[AuthCallbackClient] Component mounted');

    const handleRedirect = async () => {
      const redirectTo = searchParams?.get('redirect') || '/optimise-cv';
      console.log('[AuthCallbackClient] Redirecting to:', redirectTo);
      Analytics.event('auth', 'callback_redirect'); // Track redirect
      router.replace(decodeURIComponent(redirectTo));
    };

    // Subscribe to auth state changes, ONLY to detect SIGNED_IN for redirection
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[AuthCallbackClient] Auth state change:', event, session);
      if (event === 'SIGNED_IN' && session) {
        console.log('[AuthCallbackClient] SIGNED_IN detected, handling redirect');
        handleRedirect();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, searchParams]); // Correct dependencies

  return null;
}