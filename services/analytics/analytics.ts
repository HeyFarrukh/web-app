import { createLogger } from '@/services/logger/logger';

const logger = createLogger({ module: 'Analytics' });

export class Analytics {
  private static readonly MAX_EVENT_VALUE_LENGTH = 100;

  static event(category: string, action: string, value?: string) {
    try {
      // Sanitize and truncate the value to prevent sensitive data leaks
      const sanitizedValue = value ? 
        value.substring(0, this.MAX_EVENT_VALUE_LENGTH) : undefined;

      logger.info('Analytics event tracked', {
        category,
        action,
        hasValue: !!value
      });

      // Send to analytics provider
      window.gtag?.('event', action, {
        event_category: category,
        event_label: sanitizedValue
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to track analytics event:', {
        error: errorMessage,
        category,
        action
      });
    }
  }

  static pageView(path: string) {
    try {
      logger.info('Page view tracked', { path });

      window.gtag?.('config', process.env.NEXT_PUBLIC_GA_ID!, {
        page_path: path
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to track page view:', {
        error: errorMessage,
        path
      });
    }
  }

  static timing(category: string, variable: string, value: number) {
    try {
      logger.info('Timing event tracked', {
        category,
        variable,
        value
      });

      window.gtag?.('event', 'timing_complete', {
        event_category: category,
        name: variable,
        value
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to track timing:', {
        error: errorMessage,
        category,
        variable,
        value
      });
    }
  }
}