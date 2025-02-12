import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { MobileMenu } from './navigation/MobileMenu';
import { useTheme } from '../hooks/useTheme';
import { UserProfile } from './UserProfile';
import { useAuth } from '../hooks/useAuth';

export const Navbar = () => {
  const { isDark, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="pb-12">
    <nav className={`
      fixed left-1/2 -translate-x-1/2 top-4 
      w-[850px] max-w-[95%] 
      backdrop-blur-md 
      bg-white/75 dark:bg-gray-900/75 
      rounded-full shadow-lg z-50
      dark:border-[2px] dark:border-orange-500/50
      transition-all duration-300
    `}>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 py-4"
      >
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-extrabold shrink-0">
            <span className="text-gray-900 dark:text-white">APPRENTICE</span>
            <span className="text-orange-500">WATCH</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/apprenticeships" className="text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 whitespace-nowrap">
              Apprenticeships
            </Link>
            <Link 
              to="/optimise-cv" 
              className="relative group"
            >
              <div className="relative overflow-hidden px-4 py-1.5 rounded-full border-2 border-orange-500">
                {/* Fill animation background */}
                <div className="absolute inset-0 bg-orange-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
                
                {/* Text */}
                <span className="relative font-medium text-orange-500 group-hover:text-white transition-colors duration-300">
                  Optimise CV
                </span>
              </div>
            </Link>
            <Link to="/team" className="text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400">
              Team
            </Link>

            <div className="flex items-center space-x-3">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                )}
              </button>

              <UserProfile />
            </div>
          </div>

          {/* Mobile Menu Button - Only show on mobile */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-full bg-orange-500 text-white hover:bg-orange-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isDark={isDark}
        onThemeToggle={toggleTheme}
      />
    </nav>
    </div>
  );
};