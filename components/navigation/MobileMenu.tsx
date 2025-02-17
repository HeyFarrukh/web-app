'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sun, Moon, Sparkles } from 'lucide-react';
import Link from 'next/link';

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
  const handleNavigation = (to: string) => {
    onClose();
    if (to.startsWith('#')) {
      const element = document.querySelector(to);
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
                <Link href="/" className="text-xl font-extrabold" onClick={onClose}>
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

              <nav className="space-y-2">
                {[
                  { to: '/apprenticeships', label: 'Apprenticeships' },
                  { 
                    to: '/optimise-cv', 
                    label: 'Optimise CV',
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
                className="mt-6"
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
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};