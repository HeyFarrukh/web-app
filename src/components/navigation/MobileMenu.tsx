import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sun, Moon, User, Mail, LogOut, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GoogleAuthService } from '../../services/auth/googleAuth';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
  isDark: boolean;
  onThemeToggle: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ 
  isOpen, 
  onClose, 
  isDark,
  onThemeToggle 
}) => {
  const [userData, setUserData] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const authStatus = await GoogleAuthService.isAuthenticated();
      setIsAuthenticated(authStatus);
      if (authStatus) {
        const storedData = localStorage.getItem('user_data');
        if (storedData) {
          setUserData(JSON.parse(storedData));
        }
      } else {
        setUserData(null);
      }
    };

    checkAuth();
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      onClose();
      await GoogleAuthService.logout();
      setIsAuthenticated(false);
      setUserData(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleNavigation = (to: string) => {
    onClose();
    if (to.startsWith('#')) {
      const element = document.querySelector(to);
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        window.location.href = to;
      }, 500);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 z-50 md:hidden shadow-xl rounded-b-2xl"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-8">
                <Link to="/" className="text-xl font-extrabold" onClick={onClose}>
                  <span className="text-gray-900 dark:text-white">APPRENTICE</span>
                  <span className="text-orange-500">WATCH</span>
                </Link>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                </button>
              </div>

              {isAuthenticated && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
                >
                  <div className="flex items-center space-x-4">
                    {userData?.picture ? (
                      <img 
                        src={userData.picture} 
                        alt={userData.name} 
                        className="w-14 h-14 rounded-full border-2 border-orange-500"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center border-2 border-orange-500">
                        <User className="w-7 h-7 text-orange-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-medium text-gray-900 dark:text-white truncate">
                        {userData?.name}
                      </p>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-2">
                        <Mail className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{userData?.email}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <nav className="space-y-2">
                {[
                  { to: '/apprenticeships', label: 'Apprenticeships' },
                  { 
                    to: '/optimize-cv', 
                    label: 'Optimize CV',
                    icon: Sparkles,
                    special: true 
                  },
                  { to: '/team', label: 'Team' }
                ].map(({ to, label, icon: Icon, special }) => (
                  <motion.div
                    key={to}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <button
                      onClick={() => handleNavigation(to)}
                      className={`w-full text-left py-4 px-4 rounded-xl ${
                        special
                          ? 'bg-orange-500/10 text-orange-500'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-800'
                      } transition-colors flex items-center space-x-2`}
                    >
                      {Icon && <Icon className="w-5 h-5" />}
                      <span className="text-lg font-medium">{label}</span>
                    </button>
                  </motion.div>
                ))}
              </nav>

              <motion.div 
                className="mt-6 space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <button
                  onClick={onThemeToggle}
                  className="flex items-center justify-center w-full space-x-2 py-4 px-4 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  {isDark ? (
                    <>
                      <Sun className="w-5 h-5" />
                      <span>Light Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-5 h-5" />
                      <span>Dark Mode</span>
                    </>
                  )}
                </button>

                {isAuthenticated && (
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center w-full space-x-2 py-4 px-4 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                  </button>
                )}
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};