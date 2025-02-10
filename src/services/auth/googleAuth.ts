// File: services/auth/googleAuth.ts

import supabase from '../../config/supabase';
import { User } from '@supabase/supabase-js';
import { SupabaseUserProfile } from '../../types/auth'; // Import type


export class GoogleAuthService {
  private static readonly STORAGE_KEYS = {
    TOKEN: 'auth_token', // Not used, can be removed
    USER: 'user_data',   // Keep this
    SESSION: 'sb-session' // Not directly used, Supabase handles this
  };

  static async isAuthenticated(): Promise<boolean> {
    console.log('[GoogleAuthService] Checking authentication status');
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('[GoogleAuthService] Auth check error:', error);
        return false; // Treat errors as not authenticated
      }
      const isAuthed = !!session?.user;
      console.log('[GoogleAuthService] Auth status:', isAuthed);
      return isAuthed;
    } catch (error) {
      console.error('[GoogleAuthService] Auth check failed:', error);
      return false; // Treat errors as not authenticated
    }
  }

  static async saveUserProfile(supabaseUser: User, userData: SupabaseUserProfile) {
    console.log('[GoogleAuthService] Saving user profile:', { userId: supabaseUser.id });
    if (!supabaseUser?.id) {
      console.error('[GoogleAuthService] Invalid user data for profile save');
      throw new Error('Invalid user data');
    }

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
        ignoreDuplicates: false // Ensure updates work correctly
      });

    if (error) {
      console.error('[GoogleAuthService] Profile save error:', error);
      throw error;
    }
    console.log('[GoogleAuthService] Profile saved successfully');
  }
  
  static async logout() {
    console.log('[GoogleAuthService] Starting logout process');
    try {
      console.log('[GoogleAuthService] Clearing user data from storage');
      localStorage.removeItem(this.STORAGE_KEYS.USER); // Only remove user_data

      console.log('[GoogleAuthService] Signing out from Supabase');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('[GoogleAuthService] Supabase sign-out error:', error);
        // Don't throw; continue with cleanup
      }

    } catch (error) {
      console.error('[GoogleAuthService] Logout error:', error);
    } finally {
      console.log('[GoogleAuthService] Final cleanup and redirect');
      window.location.href = '/';
    }
  }


  // Remove refreshUserProfile (now handled in useAuth)
}