'use client';

import React from 'react';
import { OptimiseCV } from '@/components/optimise-cv/OptimiseCV';
import { useAuthProtection } from '@/hooks/useAuthProtection';

export default function OptimiseCVPage() {
  const { isAuthenticated, isLoading } = useAuthProtection();

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