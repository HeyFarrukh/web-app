'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import supabase from '@/config/supabase';
import { Analytics } from '@/services/analytics/analytics';

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