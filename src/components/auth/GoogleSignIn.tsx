import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { GoogleAuthService } from '../../services/auth/googleAuth';

export const GoogleSignIn = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full">
      <GoogleLogin
        onSuccess={async (credentialResponse) => {
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
  );
};