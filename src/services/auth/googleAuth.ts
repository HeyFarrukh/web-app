// googleAuth.ts
import { jwtDecode } from 'jwt-decode';
import supabase from '../../config/supabase'; // Import Supabase client
import {  GoogleAuthProvider } from 'firebase/auth'; // Keep for credential object - but won't use Firebase sign-in
import { User } from '@supabase/supabase-js'; // Import User type from supabase-js
import { AuthError, Session } from '@supabase/supabase-js'; // Import Session and AuthError types


interface GoogleUser {
  email: string;
  name: string;
  picture: string;
  sub: string;
}

interface SupabaseUserProfile {
    id: string; // This will be auth.users.id from Supabase
    email: string;
    name?: string | null;
    picture?: string | null;
    created_at?: string;
    last_login?: string;
    last_logout?: string;
}


export class GoogleAuthService {
  private static clientId = '423840207023-6r1aqpq3852onbj0s8tgrd0ic8llud3c.apps.googleusercontent.com';
  private static tokenKey = 'auth_token';
  private static userKey = 'user_data';

  static getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  static async isAuthenticated(): Promise<boolean> { // Make isAuthenticated async and return a Promise
    console.log("GoogleAuthService.isAuthenticated() called");
    const session = await GoogleAuthService.getSupabaseSession(); // AWAIT the session
    console.log("Session in isAuthenticated after await:", session); // Log the session here
    return !!session; // Check if session is truthy (not null or undefined)
  }


  static async getSupabaseSession(): Promise<Session | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error getting Supabase session:", error);
        return null; // Or handle error as needed
      }
      console.log("Supabase Session in getSupabaseSession:", session);
      return session;
    } catch (error) {
      console.error("Exception in getSupabaseSession:", error);
      return null;
    }
  }


  static async handleCredentialResponse(response: any) {
    const token = response.credential;

    if (!token) {
      throw new Error('No token received from Google');
    }

    const decodedUser: GoogleUser = jwtDecode(token);

    try {
      // Sign in to Supabase with Google using OAuth and the token
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: token,
      });

      if (error) {
        console.error('Supabase authentication failed:', error);
        throw error;
      }

      // Supabase user object
      const supabaseUser = data.user;

      if (!supabaseUser) {
        throw new Error('Failed to retrieve user from Supabase auth response');
      }


      // Store the token and user data locally - storing the supabase user id
      localStorage.setItem(this.tokenKey, token); // You might not need to store the raw JWT, Supabase manages session
      const userData: SupabaseUserProfile = {
        id: supabaseUser.id, // Use Supabase user ID
        email: decodedUser.email,
        name: decodedUser.name,
        picture: decodedUser.picture,
        last_login: new Date().toISOString(),
      };
      localStorage.setItem(this.userKey, JSON.stringify(userData));  // Store user data in localStorage

      // Save/Update user data in Supabase 'users' table
      await GoogleAuthService.saveUserProfile(supabaseUser, userData);


      return decodedUser; // Or return relevant user data
    } catch (error) {
      console.error('Supabase authentication or user data update failed:', error);
      throw error;
    }
  }

  private static async saveUserProfile(supabaseUser: User, userData: SupabaseUserProfile) {
    if (!supabaseUser || !supabaseUser.id) {
      console.error('No Supabase user or user ID available to save profile.');
      return;
    }

    const userProfilePayload: Omit<SupabaseUserProfile, 'id' | 'created_at'> = { // Omit id as it's the RLS key, omit created_at as it has default
      email: userData.email,
      name: userData.name,
      picture: userData.picture,
      last_login: userData.last_login,
    };


    const { error: upsertError } = await supabase
      .from('users') // Your Supabase table name
      .upsert({
        id: supabaseUser.id, // Foreign key to auth.users
        email: userData.email, // Ensure email is also stored if needed in your users table
        name: userData.name,
        picture: userData.picture,
        last_login: userData.last_login,
      }, { onConflict: 'id' }); // Changed to string here


    if (upsertError) {
      console.error('Failed to save or update user profile in Supabase:', upsertError);
      throw upsertError; // Or handle error as needed
    }
  }


  static async logout() {
    try {
      const userString = localStorage.getItem(this.userKey);
      let userId = null;
      if (userString) {
        const userData: SupabaseUserProfile = JSON.parse(userString);
        userId = userData.id;

        if (userId) {
          await GoogleAuthService.updateLogoutTime(userId); // Update last_logout on logout
        }
      }


      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase sign out error:', error);
      }
    } catch (error) {
      console.error('Logout process error:', error);
    } finally {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
      window.location.href = '/';
    }
  }

  private static async updateLogoutTime(userId: string) {
    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({ last_logout: new Date().toISOString() })
        .eq('id', userId);

      if (updateError) {
        console.error('Failed to update logout time in Supabase:', updateError);
      }
    } catch (error) {
      console.error('Error updating logout time:', error);
    }
  }


  static getCurrentUser() {
    return supabase.auth.getUser(); // Use Supabase's method to get current user
  }
}