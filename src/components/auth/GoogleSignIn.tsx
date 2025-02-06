// GoogleSignIn.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../config/supabase'; // Assuming supabaseClient is in config/supabase.ts

export const GoogleSignIn = () => {
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`, // Ensure you have this route set
      },
    });

    if (error) {
      console.error('Google sign-in error:', error);
    }
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      className="bg-white border rounded-md px-6 py-2 shadow-md hover:shadow-lg transition flex items-center"
    >
      <img src="/assets/google.svg" alt="Google Logo" className="w-5 h-5 mr-2" />
      Continue with Google
    </button>
  );
};