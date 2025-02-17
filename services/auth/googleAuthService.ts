import supabase from '@/config/supabase';
import { Analytics } from '@/services/analytics/analytics';

interface GoogleUser {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
}

class GoogleAuthService {
  async signIn() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}`,
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
      console.error('Google sign in error:', error);
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