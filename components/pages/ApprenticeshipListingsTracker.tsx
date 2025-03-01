'use client';

import { useEffect } from 'react';
import { Analytics } from '@/services/analytics/analytics';

export const ApprenticeshipListingsTracker = () => {
  useEffect(() => {
    // Track listings page visit
    if (typeof window !== 'undefined') {
      Analytics.event('page', 'visit', 'Apprenticeships Listings');
    }
  }, []);

  return null; // This component doesn't render anything
};
