import React from 'react';

export const GoogleSignIn = () => {
  return (
    <button className="w-full flex items-center justify-center space-x-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-white px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
      <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
      <span>Sign in with Google</span>
    </button>
  );
};