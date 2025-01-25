import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { MobileMenu } from './navigation/MobileMenu';
import { useTheme } from '../hooks/useTheme';
import { UserProfile } from './UserProfile';

export const Navbar = () => {
  const { isDark, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className={`
      fixed left-1/2 -translate-x-1/2 top-4 
      w-[800px] max-w-[95%] 
      backdrop-blur-md 
      bg-white/75 dark:bg-gray-900/75 
      rounded-full shadow-lg z-50
      dark:border-[2px] dark:border-orange-500/50
      transition-all duration-300
    `}>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-8 py-4"
      >
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-extrabold shrink-0">
            <span className="text-gray-900 dark:text-white">APPRENTICE</span>
            <span className="text-orange-500">WATCH</span>
          </Link>
          
          <div className="hidden md:flex items-center flex-1 justify-end">
            <div className="flex items-center space-x-12 mr-12">
              <Link to="/apprenticeships" className="text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 whitespace-nowrap">
                Apprenticeships
              </Link>
              <Link to="/join" className="text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400">
                Join Us
              </Link>
              <Link to="/team" className="text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400">
                Team
              </Link>
            </div>
            
            <div className="flex items-center space-x-8">
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

          <MobileMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
            onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            isDark={isDark}
            onThemeToggle={toggleTheme}
          />
        </div>
      </motion.div>
    </nav>
  );
};