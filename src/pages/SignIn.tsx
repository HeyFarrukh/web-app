import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GoogleSignIn } from '../components/auth/GoogleSignIn';
import { GoogleAuthService } from '../services/auth/googleAuth';

export const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("SignIn.tsx useEffect: Checking authentication..."); // ADD THIS LINE

    (async () => { // Use an async immediately invoked function expression (IIFE)
      const isAuthenticated = await GoogleAuthService.isAuthenticated(); // AWAIT the promise
      console.log("Is Authenticated?", isAuthenticated); // Log the resolved boolean value

      if (isAuthenticated) {
        console.log("SignIn.tsx useEffect: User is authenticated, redirecting..."); // ADD THIS LINE
        // If they came from a specific page, go back there
        const from = location.state?.from?.pathname || '/apprenticeships';
        navigate(from);
      } else {
        console.log("SignIn.tsx useEffect: User is NOT authenticated, showing sign-in page."); // ADD THIS LINE
      }
    })(); // Invoke the IIFE immediately

  }, [navigate, location]);

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-auto p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl"
      >
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
          Welcome to ApprenticeWatch
        </h2>

        <div className="space-y-6 flex flex-col items-center"> {/* Added flex flex-col items-center here for centering */}
          <GoogleSignIn />
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            By continuing, you agree to our{' '}
            <a href="/terms" className="text-orange-600 hover:text-orange-500 dark:text-orange-400">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-orange-600 hover:text-orange-500 dark:text-orange-400">
              Privacy Policy
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};