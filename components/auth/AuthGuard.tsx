'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import supabase from '@/config/supabase';
import { Shield, AlertTriangle, Users } from 'lucide-react';
import Link from 'next/link';

interface AuthGuardProps {
  children: React.ReactNode;
  redirectPath?: string;
  allowedRoles?: string[];
  pageTitle?: string;
  customDeniedMessage?: string;
}

export const AuthGuard = ({ 
  children, 
  redirectPath = '/signin',
  allowedRoles = ['admin', 'team', 'beta'],
  pageTitle = 'this page',
  customDeniedMessage
}: AuthGuardProps) => {
  const { isAuthenticated, isLoading, userData } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [progressWidth, setProgressWidth] = useState(0);
  const router = useRouter();

  // Handle the progress bar animation
  useEffect(() => {
    if (isLoading || isCheckingAccess) {
      // Start with 0 width
      setProgressWidth(0);
      
      // Set a small delay before starting animation for better visual effect
      const startTimer = setTimeout(() => {
        // Animate to 70% quickly
        setProgressWidth(70);
      }, 300);
      
      // Then animate to 90% more slowly
      const midTimer = setTimeout(() => {
        setProgressWidth(90);
      }, 1500);
      
      // Clean up timers
      return () => {
        clearTimeout(startTimer);
        clearTimeout(midTimer);
      };
    } else {
      // When done, complete to 100%
      setProgressWidth(100);
    }
  }, [isLoading, isCheckingAccess]);

  useEffect(() => {
    const checkAccessStatus = async () => {
      if (!isLoading && isAuthenticated && userData) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user && user.app_metadata && user.app_metadata.role && 
              allowedRoles.includes(user.app_metadata.role)) {
            setHasAccess(true);
          } else {
            setHasAccess(false);
          }
        } catch (error) {
          console.error('Error checking access status:', error);
          setHasAccess(false);
        } finally {
          // Don't immediately set isCheckingAccess to false
          // We'll handle that after the minimum animation time
          setTimeout(() => {
            setIsCheckingAccess(false);
          }, 2500); // 2.5 seconds minimum animation time
        }
      } else if (!isLoading && !isAuthenticated) {
        setHasAccess(false);
        // Still ensure minimum animation time for consistency
        setTimeout(() => {
          setIsCheckingAccess(false);
        }, 2500); // 2.5 seconds minimum animation time
      }
    };

    checkAccessStatus();
  }, [isLoading, isAuthenticated, userData, allowedRoles]);

  useEffect(() => {
    if (!isCheckingAccess) {
      if (!isAuthenticated) {
        // Add the current path as a redirect parameter
        const currentPath = window.location.pathname;
        router.push(`${redirectPath}?redirect=${encodeURIComponent(currentPath)}`);
      } else if (isAuthenticated && hasAccess === false) {
        // We don't automatically redirect on access denied anymore
        // This allows us to show the custom message
      }
    }
  }, [isCheckingAccess, isAuthenticated, hasAccess, router, redirectPath]);

  // Format the allowed roles for display
  const formatRoles = (roles: string[]) => {
    if (roles.length === 0) return '';
    if (roles.length === 1) return roles[0];
    if (roles.length === 2) return `${roles[0]} or ${roles[1]}`;
    
    const lastRole = roles[roles.length - 1];
    const otherRoles = roles.slice(0, roles.length - 1).join(', ');
    return `${otherRoles}, or ${lastRole}`;
  };

  if (isLoading || isCheckingAccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="relative bg-white/20 dark:bg-gray-800/20 backdrop-blur-md border border-white/30 dark:border-gray-700/40 p-12 rounded-2xl shadow-xl overflow-hidden">
          {/* Enhanced glass effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 dark:from-gray-800/10 dark:to-gray-800/5" />
          
          <div className="relative z-10 flex flex-col items-center">
            <Shield className="w-20 h-20 text-orange-500 mb-6 animate-pulse" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Verifying access</h1>
            <p className="text-gray-600 dark:text-gray-400 text-center">Please wait while we verify your credentials...</p>
            
            {/* Progress bar animation */}
            <div className="w-64 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-6 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"
                style={{ 
                  width: `${progressWidth}%`,
                  transition: 'width 0.8s ease-out'
                }}
              />
            </div>
          </div>
          
          {/* Enhanced decorative elements */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="relative bg-white/20 dark:bg-gray-800/20 backdrop-blur-md border border-white/30 dark:border-gray-700/40 p-12 rounded-2xl shadow-xl overflow-hidden max-w-2xl">
          {/* Enhanced glass effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 dark:from-gray-800/10 dark:to-gray-800/5" />
          
          <div className="relative z-10 flex flex-col items-center">
            <AlertTriangle className="w-20 h-20 text-red-500 mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Access Denied</h1>
            
            <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
              {customDeniedMessage || `You don't have permission to access ${pageTitle}. This area is only available to users with ${formatRoles(allowedRoles)} access.`}
            </p>
            
            <div className="bg-orange-50 dark:bg-gray-800/50 p-4 rounded-lg mb-6 border border-orange-200 dark:border-gray-700">
              <div className="flex items-start">
                <Users className="text-orange-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Want access to experimental features?</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Consider joining ApprenticeWatch as an ambassador to get early access to new features and help shape the future of the platform.
                  </p>
                  <Link 
                    href="/join" 
                    className="inline-flex items-center mt-3 text-sm font-medium text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300"
                  >
                    Learn more about becoming an ambassador
                    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button 
                onClick={() => router.push('/')}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg"
              >
                Return to Home
              </button>
              
              <button 
                onClick={() => router.back()}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
              >
                Go Back
              </button>
            </div>
          </div>
          
          {/* Enhanced decorative elements */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-red-500/10 rounded-full blur-3xl" />
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-red-500/10 rounded-full blur-3xl" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
