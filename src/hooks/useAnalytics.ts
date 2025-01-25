import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Analytics } from '../services/analytics/analytics';

export const useAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    Analytics.pageview(location.pathname);
  }, [location]);
};