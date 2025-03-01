import { event as gaEvent } from '@/components/GoogleAnalytics';

const TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID;

export const Analytics = {
  initialize: () => {
    // Initialization is now handled by the GoogleAnalytics component
    if (typeof window !== 'undefined' && !TRACKING_ID) {
      console.warn('Google Analytics ID not found');
    }
  },

  pageview: (path: string, title?: string) => {
    // Pageviews are automatically tracked by the GoogleAnalytics component
    // This method is kept for backward compatibility
  },

  event: (category: string, action: string, label?: string, value?: number) => {
    if (typeof window !== 'undefined') {
      gaEvent({
        category,
        action,
        label,
        value
      });
    }
  }
};