import supabase from '@/config/supabase';
import { createLogger } from '@/services/logger/logger';
import { Analytics } from '@/services/analytics/analytics';

const TABLE_NAME = 'apprenticeship_progress';
const logger = createLogger({ module: 'ApprenticeshipProgressService' });

export const apprenticeshipProgressService = {
  async getUserProgress(userId: string) {
    try {
      logger.info('Fetching user apprenticeship progress', { userId });

      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) {
        logger.error('Failed to get user progress:', { error, userId });
        Analytics.event('apprenticeship_tracking', 'get_progress_error', error.message);
        throw error;
      }

      return data || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to get user progress:', { error: errorMessage, userId });
      Analytics.event('apprenticeship_tracking', 'get_progress_error', errorMessage);
      throw error;
    }
  },

  async addProgress(userId: string, payload: { 
    vacancy_id: string; 
    vacancy_title: string; 
    vacancy_company: string; 
    location: string; 
    applied_to: string; 
    status: string; 
    notes: string; 
  }) {
    try {
      logger.info('Adding apprenticeship progress', { userId, payload });

      const { data, error } = await supabase
        .from(TABLE_NAME)
        .insert([{ 
          user_id: userId, 
          ...payload, 
          started_at: payload.applied_to, 
          updated_at: new Date().toISOString() 
        }])
        .select()
        .single();

      if (error) {
        logger.error('Failed to add progress:', { error, userId, payload });
        Analytics.event('apprenticeship_tracking', 'add_progress_error', error.message);
        throw error;
      }

      Analytics.event('apprenticeship_tracking', 'add_progress_success', payload.vacancy_id);
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to add progress:', { error: errorMessage, userId });
      Analytics.event('apprenticeship_tracking', 'add_progress_error', errorMessage);
      throw error;
    }
  },

  async updateProgress(id: string, updates: Partial<{ status: string; notes: string }>) {
    try {
      logger.info('Updating apprenticeship progress', { id, updates });

      const { error } = await supabase
        .from(TABLE_NAME)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        logger.error('Failed to update progress:', { error, id });
        Analytics.event('apprenticeship_tracking', 'update_progress_error', error.message);
        throw error;
      }

      Analytics.event('apprenticeship_tracking', 'update_progress_success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to update progress:', { error: errorMessage, id });
      Analytics.event('apprenticeship_tracking', 'update_progress_error', errorMessage);
      throw error;
    }
  },

  async deleteProgress(id: string) {
    try {
      logger.info('Deleting apprenticeship progress', { id });

      const { error } = await supabase
        .from(TABLE_NAME)
        .delete()
        .eq('id', id);

      if (error) {
        logger.error('Failed to delete progress:', { error, id });
        Analytics.event('apprenticeship_tracking', 'delete_progress_error', error.message);
        throw error;
      }

      Analytics.event('apprenticeship_tracking', 'delete_progress_success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to delete progress:', { error: errorMessage, id });
      Analytics.event('apprenticeship_tracking', 'delete_progress_error', errorMessage);
      throw error;
    }
  },
};