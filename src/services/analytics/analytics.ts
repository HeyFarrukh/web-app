import ReactGA from 'react-ga4';

const TRACKING_ID = import.meta.env.VITE_GA_TRACKING_ID;

export const Analytics = {
  initialize: () => {
    if (TRACKING_ID) {
      ReactGA.initialize(TRACKING_ID);
      console.log('Google Analytics initialized');
    } else {
      console.warn('Google Analytics Tracking ID not found');
    }
  },

  pageview: (path: string, title?: string) => {
    if (TRACKING_ID) {
      ReactGA.send({
        hitType: 'pageview',
        page: path,
        title: title
      });
    }
  },

  event: (category: string, action: string, label?: string) => {
    if (TRACKING_ID) {
      ReactGA.event({
        category,
        action,
        label
      });
    }
  }
};