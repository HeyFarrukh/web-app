import { jwtDecode } from 'jwt-decode';
import supabase from '../../config/supabase';
import { User } from '@supabase/supabase-js';
import { AuthError, Session } from '@supabase/supabase-js';

interface GoogleUser {
  email: string;
  name: string;
  picture: string;
  sub: string;
}

interface SupabaseUserProfile {
  id: string;
  email: string;
  name?: string | null;
  picture?: string | null;
  created_at?: string;
  last_login?: string;
  last_logout?: string;
}

export class GoogleAuthService {
  private static readonly STORAGE_KEYS = {
    TOKEN: 'auth_token',
    USER: 'user_data',
    SESSION: 'sb-session'
  };

  static async isAuthenticated(): Promise<boolean> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return !!session?.user;
    } catch (error) {
      console.error("Auth check failed:", error);
      return false;
    }
  }

  static async handleCredentialResponse(response: any) {
    try {
      const token = response.credential;
      if (!token) throw new Error('No token received from Google');

      const decodedUser: GoogleUser = jwtDecode(token);

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: token,
      });

      if (error) throw error;
      if (!data.user) throw new Error('No user data received');

      const userData: SupabaseUserProfile = {
        id: data.user.id,
        email: data.user.email!,
        name: data.user.user_metadata?.name || decodedUser.name,
        picture: data.user.user_metadata?.avatar_url || decodedUser.picture,
        last_login: new Date().toISOString(),
      };

      await this.saveUserProfile(data.user, userData);
      localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(userData));

      return userData;
    } catch (error) {
      console.error('Authentication failed:', error);
      await this.logout();
      throw error;
    }
  }

  static async saveUserProfile(supabaseUser: User, userData: SupabaseUserProfile) {
    if (!supabaseUser?.id) throw new Error('Invalid user data');

    const { error } = await supabase
      .from('users')
      .upsert({
        id: supabaseUser.id,
        email: userData.email,
        name: userData.name,
        picture: userData.picture,
        last_login: userData.last_login,
      }, {
        onConflict: 'id',
        ignoreDuplicates: false
      });

    if (error) throw error;
  }

  static async logout() {
    try {
      // Update last logout time if possible
      const userData = localStorage.getItem(this.STORAGE_KEYS.USER);
      if (userData) {
        const { id } = JSON.parse(userData);
        await supabase
          .from('users')
          .update({ last_logout: new Date().toISOString() })
          .eq('id', id);
      }

      // Clear all storage first
      this.clearStorage();

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) throw error;

      // Double check session is cleared
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.warn('Session persisted after logout, forcing cleanup');
        await supabase.auth.signOut({ scope: 'global' });
        this.clearStorage();
      }

    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Final storage cleanup and redirect
      this.clearStorage();
      window.location.href = '/';
    }
  }

  private static clearStorage() {
    // Clear all auth-related items
    Object.values(this.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });

    // Clear any Supabase-specific items
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('sb-')) {
        localStorage.removeItem(key);
      }
    }

    // Clear session storage
    sessionStorage.clear();
  }

  static async refreshUserProfile() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) throw error || new Error('No user found');

      const userData: SupabaseUserProfile = {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name,
        picture: user.user_metadata?.avatar_url,
        last_login: new Date().toISOString(),
      };

      localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error('Failed to refresh user profile:', error);
      return null;
    }
  }
}