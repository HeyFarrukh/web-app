import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, User, Mail, Bookmark } from "lucide-react";
import { useRouter } from "next/navigation";
import supabase from "@/config/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Analytics } from "@/services/analytics/analytics";
import Link from "next/link";

export const UserProfile = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { userData, isLoading } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      setIsOpen(false);
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

  // Don't render anything while loading
  if (isLoading) return null;

  // Don't render if no user data
  if (!userData) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative group"
        aria-label="User menu"
      >
        {userData.picture ? (
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-orange-500" />
            <img
              src={userData.picture}
              alt={userData.name || ""}
              className="w-11 h-11 rounded-full border-2 border-white dark:border-gray-800 relative z-10"
              aria-label="Default user icon"
            />
          </div>
        ) : (
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-orange-500" />
            <div className="w-11 h-11 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center relative z-10 border-2 border-white dark:border-gray-800">
              <User
                className="w-6 h-6 text-orange-500"
                aria-label="Default user icon"
              />
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
                    alt={userData.name || ""}
                    className="w-16 h-16 rounded-full border-2 border-orange-500"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center border-2 border-orange-500">
                    <User className="w-8 h-8 text-orange-500" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-medium text-gray-900 dark:text-white truncate">
                    {userData.name || "User"}
                  </p>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-2 mt-1">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{userData.email}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3">
              <Link
                href="/saved-apprenticeships"
                className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl flex items-center space-x-3 transition-colors mb-2"
                onClick={() => setIsOpen(false)}
              >
                <Bookmark className="w-5 h-5" />
                <span className="font-medium">Saved Apprenticeships</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl flex items-center space-x-3 transition-colors"
                aria-label="Sign out of your account"
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
