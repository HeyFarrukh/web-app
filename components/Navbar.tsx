"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";
import { MobileMenu } from "./navigation/MobileMenu";
import { UserProfile } from "./UserProfile";
import { useAuth } from "@/hooks/useAuth";

export const Navbar = () => {
  const [isDark, setIsDark] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark ? "dark" : "light";
    setIsDark(!isDark);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <div className="pb-12 bg-orange-50 dark:bg-gray-900">
      <nav
        className={`
        fixed left-1/2 -translate-x-1/2 top-4 
        w-[850px] max-w-[95%] 
        backdrop-blur-md 
        bg-white/75 dark:bg-gray-900/75 
        rounded-full shadow-lg z-50
        dark:border-[2px] dark:border-orange-500/50
        transition-all duration-300
      `}
      >
        <motion.div
          initial={{ opacity: 0, transform: "translateY(-20px)" }}
          animate={{ opacity: 1, transform: "translateY(0px)" }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="px-6 py-4"
          style={{
            willChange: "transform, opacity",
            transform: "translateZ(0)",
          }}
        >
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-extrabold shrink-0">
              <span className="text-gray-900 dark:text-white">APPRENTICE</span>
              <span className="text-orange-500">WATCH</span>
            </Link>

            <div className="hidden md:flex items-center space-x-6">
              <Link
                href="/apprenticeships"
                className="text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 whitespace-nowrap"
              >
                Apprenticeships
              </Link>
              <Link href="/optimise-cv" className="relative group">
                <div className="relative overflow-hidden px-4 py-1.5 rounded-full border-2 border-orange-500">
                  <div className="absolute inset-0 bg-orange-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
                  <span className="relative font-medium text-orange-500 group-hover:text-white transition-colors duration-300">
                    Optimise CV
                  </span>
                </div>
              </Link>
              <Link
                href="/join"
                className="text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400"
              >
                Join Us
              </Link>

              <div className="flex items-center space-x-3">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label={
                    isDark ? "Switch to light mode" : "Switch to dark mode"
                  }
                >
                  {isDark ? (
                    <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  ) : (
                    <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  )}
                </button>

                {isAuthenticated ? <UserProfile /> : null}
              </div>
            </div>

            {/* Mobile Menu Button - Only show on mobile */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-full bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                aria-label="Toggle mobile menu"
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
