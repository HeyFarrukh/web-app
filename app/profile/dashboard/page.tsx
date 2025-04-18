"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ProfileDashboard } from "@/components/profile/ProfileDashboard";
import { Analytics } from "@/services/analytics/analytics";

export default function DashboardPage() {
  const { isLoading, isAuthenticated, userData } = useAuth();
  const router = useRouter();

  useEffect(() => {
    Analytics.event("page_view", "profile_dashboard");
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/signin?redirect=" + encodeURIComponent("/profile/dashboard"));
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!userData) return null;

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
      <ProfileDashboard userData={userData} />
    </div>
  );
}