// pages/AuthCallback.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleAuthService } from '../../services/auth/googleAuth'; // Import your AuthService

export const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("AuthCallback.tsx: useEffect triggered");

    const checkAndSaveUser = async () => { // Renamed function for clarity
      console.log("AuthCallback.tsx: checkAndSaveUser function started");
      const isAuthenticated = await GoogleAuthService.isAuthenticated();
      console.log("AuthCallback.tsx: isAuthenticated result:", isAuthenticated);

      if (isAuthenticated) {
        console.log("AuthCallback.tsx: User is authenticated.");

        try {
          const currentUser = await GoogleAuthService.getCurrentUser(); // Get Supabase User
          console.log("AuthCallback.tsx: Current Supabase User:", currentUser); // Log Supabase user

          if (currentUser && currentUser.data && currentUser.data.user) { // Safely access user data
            const supabaseUser = currentUser.data.user;
            const userDataToSave = { // Prepare user data for saving
              id: supabaseUser.id,
              email: supabaseUser.email || '', // Ensure email is not null
              name: supabaseUser.user_metadata?.name !== undefined ? supabaseUser.user_metadata.name : null, // Explicitly handle undefined name to null
              picture: supabaseUser.user_metadata?.avatar_url !== undefined ? supabaseUser.user_metadata.avatar_url : null, // Explicitly handle undefined picture to null
              last_login: new Date().toISOString(),
            };
            console.log("AuthCallback.tsx: User data to save:", userDataToSave); // Log user data

            await GoogleAuthService.saveUserProfile(supabaseUser, userDataToSave); // Save profile
            console.log("AuthCallback.tsx: User profile saved successfully.");

            // ADD THIS LINE: Update localStorage after saving profile
            localStorage.setItem('user_data', JSON.stringify(userDataToSave));
            console.log("AuthCallback.tsx: localStorage updated with user data."); // Log localStorage update


            navigate('/listings', { replace: true }); // Redirect to listings
          } else {
            console.error("AuthCallback.tsx: Could not retrieve Supabase user data after authentication.");
            navigate('/signin', { replace: true }); // Redirect to signin on error
          }


        } catch (error) {
          console.error("AuthCallback.tsx: Error saving user profile:", error);
          navigate('/signin', { replace: true }); // Redirect to signin on error
        }

      } else {
        console.log("AuthCallback.tsx: User is NOT authenticated, redirecting to signin");
        navigate('/signin', { replace: true }); // Redirect to signin if not authenticated
      }
      console.log("AuthCallback.tsx: checkAndSaveUser function finished");
    };

    checkAndSaveUser();
    console.log("AuthCallback.tsx: useEffect finished (checkAndSaveUser called)");
  }, [navigate]);

  function decodedUserName(email: string| null) {
    if (!email) return '';
    return email.split('@')[0];
  }

  return (
    <div>
      <h1>Authorizing...</h1>
      <p>Please wait, you are being redirected.</p>
    </div>
  );
};