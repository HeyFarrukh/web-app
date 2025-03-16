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
      // Check if we have a previously stored redirect URL
      let redirectTo;
      if (typeof window !== 'undefined') {
        // Check for stored redirect URL first
        redirectTo = localStorage.getItem('auth_redirect_url');
        console.log('[AuthCallbackClient] Found stored redirect URL:', redirectTo);
        
        // Clear storage
        localStorage.removeItem('auth_redirect_url');
        
        // Check if we have a vacancy ID to return to
        const savedVacancyId = localStorage.getItem('save_after_auth') || sessionStorage.getItem('save_after_auth');
        
        // Clear vacancy storage
        localStorage.removeItem('save_after_auth');
        sessionStorage.removeItem('save_after_auth');
        
        // If we have a vacancy ID, redirect to that vacancy
        if (savedVacancyId) {
          console.log('[AuthCallbackClient] Found vacancy ID to return to:', savedVacancyId);
          Analytics.event('auth', 'callback_redirect_to_vacancy');
          router.replace(`/apprenticeships/${savedVacancyId}`);
          return;
        }
      }
      
      // If we have a redirect URL, use it
      if (redirectTo) {
        console.log('[AuthCallbackClient] Redirecting to stored URL:', redirectTo);
        Analytics.event('auth', 'callback_redirect_to_stored_url');
        router.replace(redirectTo);
        return;
      }
      
      // Default redirect to home page
      console.log('[AuthCallbackClient] No redirect URL found, redirecting to home page');
      Analytics.event('auth', 'callback_redirect_home');
      router.replace('/');
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