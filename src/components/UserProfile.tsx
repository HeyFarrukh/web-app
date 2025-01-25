import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User, Mail } from 'lucide-react';
import { GoogleAuthService } from '../services/auth/googleAuth';

interface UserData {
  name: string;
  email: string;
  picture: string;
}

export const UserProfile = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedUserData = localStorage.getItem('user_data');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!userData) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative group"
      >
        {userData.picture ? (
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-orange-500" />
            <img 
              src={userData.picture} 
              alt={userData.name} 
              className="w-11 h-11 rounded-full border-2 border-white dark:border-gray-800 relative z-10"
            />
          </div>
        ) : (
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-orange-500" />
            <div className="w-11 h-11 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center relative z-10 border-2 border-white dark:border-gray-800">
              <User className="w-6 h-6 text-orange-500" />
            </div>
          </div>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute right-0 mt-4 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-xl z-50 overflow-hidden border border-gray-100 dark:border-gray-700"
          >
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-4">
                {userData.picture ? (
                  <img 
                    src={userData.picture} 
                    alt={userData.name} 
                    className="w-16 h-16 rounded-full border-2 border-orange-500"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center border-2 border-orange-500">
                    <User className="w-8 h-8 text-orange-500" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-medium text-gray-900 dark:text-white truncate">
                    {userData.name}
                  </p>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-2 mt-1">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{userData.email}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-3">
              <button
                onClick={() => GoogleAuthService.logout()}
                className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl flex items-center space-x-3 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};