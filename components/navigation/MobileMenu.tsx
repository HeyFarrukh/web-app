"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Sun,
  Moon,
  Sparkles,
  LogOut,
  User,
  Mail,
  Bookmark,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import supabase from "@/config/supabase";
import { Analytics } from "@/services/analytics/analytics";

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
  onThemeToggle,
}) => {
  const { isAuthenticated, userData } = useAuth();
  const router = useRouter();

  const handleNavigation = (to: string) => {
    onClose();
    if (to.startsWith("#")) {
      const element = document.querySelector(to);
      element?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleLogout = async () => {
    try {
      onClose();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear user data cookie
      document.cookie =
        "user_data=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";

      // Track successful logout
      Analytics.event("auth", "sign_out_success");

      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
      Analytics.event("auth", "sign_out_error");
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
            initial={{ transform: "translateY(-100%)" }}
            animate={{ transform: "translateY(0%)" }}
            exit={{ transform: "translateY(-100%)" }}
            transition={{
              duration: 0.3,
              ease: "easeOut",
              staggerChildren: 0.05,
            }}
            className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 z-50 md:hidden shadow-xl rounded-b-2xl will-change-transform"
            style={{
              willChange: "transform",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-8">
                <Link
                  href="/"
                  className="text-xl font-extrabold"
                  onClick={onClose}
                >
                  <span className="text-gray-900 dark:text-white">
                    APPRENTICE
                  </span>
                  <span className="text-orange-500">WATCH</span>
                </Link>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Close mobile menu"
                >
                  <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                </button>
              </div>

              <nav className="space-y-2">
                {[
                  { to: "/apprenticeships", label: "Apprenticeships" },
                  {
                    to: "/optimise-cv",
                    label: "Optimise CV",
                    icon: Sparkles,
                    special: true,
                  },
                  { to: "/join", label: "Join Us" },
                ].map(({ to, label, icon: Icon, special }) => (
                  <motion.div
                    key={to}
                    whileHover={{ transform: "translateZ(0) scale(1.02)" }}
                    whileTap={{ transform: "translateZ(0) scale(0.98)" }}
                    style={{
                      willChange: "transform",
                      transform: "translateZ(0)",
                    }}
                  >
                    <Link href={to}>
                      <button
                        onClick={() => handleNavigation(to)}
                        className={`w-full text-left py-4 px-4 rounded-xl ${
                          special
                            ? "bg-orange-500/10 text-orange-500"
                            : "text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-800"
                        } transition-colors flex items-center space-x-2`}
                      >
                        {Icon && <Icon className="w-5 h-5" />}
                        <span className="text-lg font-medium">{label}</span>
                      </button>
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {isAuthenticated && userData && (
                <div className="mt-6 border-t border-gray-100 dark:border-gray-800 pt-6">
                  <div className="flex items-center space-x-4 px-4 mb-4">
                    {userData.picture ? (
                      <img
                        src={userData.picture}
                        alt={userData.name || ""}
                        className="w-12 h-12 rounded-full border-2 border-orange-500"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center border-2 border-orange-500">
                        <User className="w-6 h-6 text-orange-500" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {userData.name || "User"}
                      </p>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <Mail className="w-4 h-4 mr-1" />
                        <span className="truncate">{userData.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Link
                      href="/saved-apprenticeships"
                      className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl flex items-center space-x-3 transition-colors block"
                      onClick={onClose}
                    >
                      <Bookmark className="w-5 h-5" />
                      <span className="font-medium">Saved Apprenticeships</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl flex items-center space-x-3 transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">Sign Out</span>
                    </button>
                  </div>
                </div>
              )}

              <motion.div
                className="mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.2, ease: "easeOut" }}
                style={{ willChange: "opacity" }}
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
