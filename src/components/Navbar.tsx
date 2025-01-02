import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { MobileMenu } from './navigation/MobileMenu';
import { useTheme } from '../hooks/useTheme';

export const Navbar = () => {
  const { isDark, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className={`
      fixed left-1/2 -translate-x-1/2 top-4 
      w-[600px] max-w-[90%] 
      backdrop-blur-md 
      bg-white/75 dark:bg-gray-900/75 
      rounded-full shadow-lg z-50
      /* Adjust border-[2px] to increase/decrease border thickness */
      dark:border-[2px] dark:border-orange-500/50
      transition-all duration-300
    `}>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 py-3"
      >
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-extrabold">
            <span className="text-gray-900 dark:text-white">APPRENTICE</span>
            <span className="text-orange-500">WATCH</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/listings" className="text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400">
              Listings
            </Link>
            <Link 
              to="/join" 
              className="text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setTimeout(() => {
                  window.location.href = '/join';
                }, 500);
              }}
            >
              Join Us
            </Link>
            <a 
              href="#why-us" 
              className="text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector('#why-us')?.scrollIntoView({ 
                  behavior: 'smooth',
                  block: 'start'
                });
              }}
            >
              Why Us?
            </a>
            
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