import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { GoogleAuthService } from '../../services/auth/googleAuth';

export const GoogleSignIn = () => {
  const navigate = useNavigate();

  return (
    <GoogleOAuthProvider clientId="423840207023-6r1aqpq3852onbj0s8tgrd0ic8llud3c.apps.googleusercontent.com">
      <div className="w-full">
        <GoogleLogin
          onSuccess={async (credentialResponse) => {
            console.log('Google Response:', credentialResponse); // Log the response
            try {
              await GoogleAuthService.handleCredentialResponse(credentialResponse);
              navigate('/listings');
            } catch (error) {
              console.error('Authentication failed:', error);
            }
          }}
          onError={() => {
            console.error('Login Failed');
          }}
          useOneTap
          theme="outline"
          size="large"
          width="100%"
          text="continue_with"
          shape="rectangular"
        />
      </div>
    </GoogleOAuthProvider>
  );
};
