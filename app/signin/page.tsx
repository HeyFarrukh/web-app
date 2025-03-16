'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GoogleSignIn } from '@/components/auth/GoogleSignIn';
import { Analytics } from '@/services/analytics/analytics';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [redirectTo, setRedirectTo] = useState<string>('/optimise-cv');
  const [showLoading, setShowLoading] = useState(true);

  // Get the redirect URL from URL search params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get('redirect');
      if (redirect) {
        // Save the redirect URL in localStorage directly
        // This bypasses any issues with the OAuth redirect process
        localStorage.setItem('postauth_redirect', redirect);
        console.log('[SignInPage] Stored redirect URL in localStorage:', redirect);
        setRedirectTo(redirect);
      }
    }
  }, []);

  useEffect(() => {
    Analytics.event('auth', 'view_signin_page');
  }, []);

  useEffect(() => {
    console.log('[SignInPage] Auth state changed:', { isLoading, isAuthenticated });
    if (!isLoading && isAuthenticated) {
      // Debug localStorage values again when auth state changes
      console.log('===== AUTH STATE CHANGE DEBUG =====');
      console.log('localStorage.postauth_redirect:', localStorage.getItem('postauth_redirect'));
      console.log('localStorage.auth_redirect_url:', localStorage.getItem('auth_redirect_url'));
      console.log('redirectTo state:', redirectTo);
      console.log('==================================');

      // Check if we have a stored redirect URL from the login process
      const storedRedirect = localStorage.getItem('postauth_redirect');
      if (storedRedirect) {
        console.log('[SignInPage] Found stored redirect URL:', storedRedirect);
        // Clear the stored redirect URL
        localStorage.removeItem('postauth_redirect');
        // Redirect the user
        console.log('[SignInPage] Redirecting to stored URL:', storedRedirect);
        router.push(storedRedirect);
      } else {
        // Fall back to the original redirectTo state
        console.log('[SignInPage] No stored redirect found, using default:', redirectTo);
        router.push(redirectTo);
      }
    }
  }, [isLoading, isAuthenticated, router, redirectTo]);

  // Show loading state for a maximum of 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 3000);

    if (!isLoading) {
      setShowLoading(false);
    }

    return () => clearTimeout(timer);
  }, [isLoading]);

  if (showLoading) {
    return (
      <div className="min-h-screen pt-16 bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-auto p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl"
      >
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
          Welcome to ApprenticeWatch
        </h2>

        <div className="space-y-6 flex flex-col items-center">
          <GoogleSignIn redirect={redirectTo} />
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            By continuing, you agree to our{' '}
            <a href="/terms" className="text-orange-600 hover:text-orange-500 dark:text-orange-400">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-orange-600 hover:text-orange-500 dark:text-orange-400">
              Privacy Policy
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}