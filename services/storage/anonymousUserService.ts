import { createLogger } from '@/services/logger/logger';

export class AnonymousUserService {
  private readonly STORAGE_KEY = 'cv_optimization_history';
  private logger = createLogger({ module: 'AnonymousUserService' });

  hasOptimizedBefore(): boolean {
    try {
      if (typeof window === 'undefined') return false;
      const history = localStorage.getItem(this.STORAGE_KEY);
      return !!history;
    } catch (error) {
      this.logger.error('Error checking optimization history:', { error });
      return false;
    }
  }

  recordOptimization(): void {
    try {
      if (typeof window === 'undefined') return;
      localStorage.setItem(this.STORAGE_KEY, new Date().toISOString());
    } catch (error) {
      this.logger.error('Error recording optimization:', { error });
    }
  }

  clearHistory(): void {
    try {
      if (typeof window === 'undefined') return;
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      this.logger.error('Error clearing optimization history:', { error });
    }
  }
}

export const anonymousUserService = new AnonymousUserService();
