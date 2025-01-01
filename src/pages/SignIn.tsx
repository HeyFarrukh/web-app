import React from 'react';
import { motion } from 'framer-motion';
import { SignInForm } from '../components/auth/SignInForm';
import { GoogleSignIn } from '../components/auth/GoogleSignIn';

export const SignIn = () => {
  return (
    <div className="min-h-screen pt-16 bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-auto p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl"
      >
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
          Welcome Back
        </h2>
        
        <div className="space-y-6">
          <GoogleSignIn />
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">Or continue with</span>
            </div>
          </div>
          
          <SignInForm />
          
          <button className="w-full py-2 px-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
            Sign In
          </button>
          
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <a href="#" className="text-orange-600 hover:text-orange-500 dark:text-orange-400">
              Sign up
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};