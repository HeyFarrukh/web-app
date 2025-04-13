import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './useAuth';

/**
 * Hook to protect routes that require authentication
 * Redirects to signin with the current path as redirect parameter if not authenticated
 * 
 * @param redirectIfUnauthenticated - Whether to redirect to signin page if user is not authenticated (default: true)
 * @param customRedirectPath - Optional custom path to redirect to after login (default: current path)
 */
export const useAuthProtection = (
  redirectIfUnauthenticated: boolean = true,
  customRedirectPath?: string
) => {
  const { isAuthenticated, isLoading, userData } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    // Only check after initial loading is complete
    if (!isLoading) {
      // If not authenticated and we should redirect
      if (!isAuthenticated && redirectIfUnauthenticated) {
        // Get current path for redirect or use custom path
        const redirectPath = customRedirectPath || pathname;
        // Add any query parameters present in the URL
        const search = typeof window !== 'undefined' ? window.location.search : '';
        const fullRedirectPath = redirectPath + search;
        
        // Encode the path for URL safety
        const encodedRedirect = encodeURIComponent(fullRedirectPath);
        
        // Redirect to signin page with redirect parameter
        router.push(`/signin?redirect=${encodedRedirect}`);
      }
    }
  }, [isAuthenticated, isLoading, redirectIfUnauthenticated, router, pathname, customRedirectPath]);

  // Return auth state for components to use
  return { isAuthenticated, isLoading, userData };
};
