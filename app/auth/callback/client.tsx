"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import supabase from "@/config/supabase";
import { Analytics } from "@/services/analytics/analytics";

export function AuthCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    console.log("[AuthCallbackClient] Component mounted");
    const checkSessionAndRedirect = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/");
        return;
      }
    };

    const handleRedirect = async () => {
      const redirectTo = searchParams?.get("redirect") || "/";
      console.log("[AuthCallbackClient] Redirecting to:", redirectTo);
      Analytics.event("auth", "callback_redirect");
      router.replace(decodeURIComponent(redirectTo));
    };

    // Check session immediately when component mounts
    checkSessionAndRedirect();

    // Subscribe to auth state changes to handle SIGNED_IN event
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[AuthCallbackClient] Auth state change:", event, session);
      if (event === "SIGNED_IN" && session) {
        console.log(
          "[AuthCallbackClient] SIGNED_IN detected, handling redirect"
        );
        handleRedirect();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, searchParams]);

  return null;
}
