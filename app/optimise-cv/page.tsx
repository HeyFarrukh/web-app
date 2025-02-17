'use client';

import React, { useEffect } from 'react';
import { OptimiseCV } from '@/components/optimise-cv/OptimiseCV';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function OptimiseCVPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/signin?redirect=/optimise-cv');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <OptimiseCV />;
}