"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import supabase from "@/config/supabase";
import { Analytics } from "@/services/analytics/analytics";

export function AuthCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const callBackRedirect = async () => {
      router.replace("/");
      return;
    };

    const handleRedirect = async () => {
      const redirectTo = searchParams?.get("redirect") || "/";
      Analytics.event("auth", "callback_redirect");
      router.replace(decodeURIComponent(redirectTo));
    };

    callBackRedirect();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        handleRedirect();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, searchParams]); // Correct dependencies
  return null;
}
