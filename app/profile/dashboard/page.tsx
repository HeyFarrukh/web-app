"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ProfileDashboard } from "@/components/profile/ProfileDashboard";
import { Analytics } from "@/services/analytics/analytics";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function DashboardPage() {
  const { userData } = useAuth();
  
  useEffect(() => {
    Analytics.event("page_view", "profile_dashboard");
  }, []);

  return (
    <AuthGuard 
      redirectPath="/signin" 
      allowedRoles={['admin', 'team', 'beta']}
      pageTitle="the user dashboard"
    >
      <div className="min-h-screen pt-24 pb-12 bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
        {userData && <ProfileDashboard userData={userData} />}
      </div>
    </AuthGuard>
  );
}