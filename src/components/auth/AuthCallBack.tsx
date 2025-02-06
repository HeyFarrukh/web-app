import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleAuthService } from '../../services/auth/googleAuth';
import supabase from '../../config/supabase';
import { SupabaseUserProfile } from '../../types/auth'; // We'll create this type

export const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session error:", error);
          navigate('/signin');
          return;
        }

        if (!session?.user) {
          console.error("No user in session");
          navigate('/signin');
          return;
        }

        // Get user metadata from session
        const { user } = session;
        
        // Ensure we have required fields
        if (!user.email) {
          throw new Error('User email is required but missing');
        }

        const userData: SupabaseUserProfile = {
          id: user.id,
          email: user.email, // We know this exists now
          name: user.user_metadata?.full_name || user.user_metadata?.name || null,
          picture: user.user_metadata?.avatar_url || null,
          last_login: new Date().toISOString()
        };

        // Save user data to localStorage
        localStorage.setItem('user_data', JSON.stringify(userData));

        // Save user profile to Supabase
        await GoogleAuthService.saveUserProfile(user, userData);

        // Navigate to apprenticeships page
        navigate('/apprenticeships');
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/signin');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Completing sign in...</p>
      </div>
    </div>
  );
};