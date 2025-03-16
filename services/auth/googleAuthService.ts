import supabase from '@/config/supabase';
import { Analytics } from '@/services/analytics/analytics';

interface GoogleUser {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
}

class GoogleAuthService {
  async signIn(redirectUrl?: string) {
    try {
      // Get the current path to redirect back after auth
      const currentPath = redirectUrl || (typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/');
      
      console.log('[GoogleAuthService] Storing redirect path:', currentPath);
      
      // Store the redirect URL in localStorage to ensure we can access it post-auth
      if (typeof window !== 'undefined') {
        // Make sure we're storing only the path, not the full URL
        let redirectPath = currentPath;
        
        // If it somehow has the full URL, extract just the path
        if (redirectPath.startsWith('http')) {
          try {
            const url = new URL(redirectPath);
            redirectPath = url.pathname + url.search;
          } catch (error) {
            console.error('[GoogleAuthService] Error parsing URL:', error);
          }
        }
        
        localStorage.setItem('auth_redirect_url', redirectPath);
        console.log('[GoogleAuthService] Stored redirect path in localStorage:', redirectPath);
      }
      
      // For local development, we need to explicitly use the current window's origin
      // This ensures we redirect back to the same origin after authentication
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/auth/callback',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        Analytics.event('auth', 'sign_in_error', error.message);
        throw error;
      }

      Analytics.event('auth', 'sign_in_started');
      return data;
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  }

  async upsertUserData(user: GoogleUser) {
    try {
      const { data, error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          name: user.name,
          picture: user.picture,
          last_login: new Date().toISOString(),
        }, {
          onConflict: 'id',
          ignoreDuplicates: false,
        })
        .select()
        .single();

      if (error) {
        Analytics.event('auth', 'user_upsert_error', error.message);
        throw error;
      }

      Analytics.event('auth', 'user_upsert_success');
      return data;
    } catch (error: any) {
      console.error('Error upserting user data:', error);
      throw error;
    }
  }
}

export const googleAuthService = new GoogleAuthService();