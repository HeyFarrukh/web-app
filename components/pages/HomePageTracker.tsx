'use client';

import { useEffect } from 'react';
import { Analytics } from '@/services/analytics/analytics';

export const HomePageTracker = () => {
  useEffect(() => {
    // Track landing page visit
    if (typeof window !== 'undefined') {
      Analytics.event('page', 'visit', 'Landing Page');
    }
  }, []);

  return null; // This component doesn't render anything
};
