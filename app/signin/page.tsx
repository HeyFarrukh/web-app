'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GoogleSignIn } from '@/components/auth/GoogleSignIn';
import { Analytics } from '@/services/analytics/analytics';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  React.useEffect(() => {
    Analytics.event('auth', 'view_signin_page');
  }, []);

  React.useEffect(() => {
    console.log('Auth state:', { isLoading, isAuthenticated });
    if (!isLoading && isAuthenticated) {
      router.push('/optimise-cv');
    }
  }, [isLoading, isAuthenticated, router]);

  // Show loading state for a maximum of 3 seconds
  const [showLoading, setShowLoading] = React.useState(true);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 3000);

    if (!isLoading) {
      setShowLoading(false);
    }

    return () => clearTimeout(timer);
  }, [isLoading]);

      //Log location
      React.useEffect(() => {
        if (typeof window !== 'undefined') {
            console.log("The location is :", window.location.origin);
        }
      }, []);

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
          <GoogleSignIn />
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