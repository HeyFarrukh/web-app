import supabase from '@/config/supabase';
import { Analytics } from '@/services/analytics/analytics';
import { createLogger } from '@/services/logger/logger';

const logger = createLogger({ module: 'CVTrackingService' });

interface OptimisationRecord {
  id: string;
  userId: string;
  cvText: string;
  jobDescription: string;
  overallScore: number;
  metadata: Record<string, any>;
  userEmail: string;
}

interface Metadata {
  tokenCount: number;
  processingTime: number;
  apiVersion: string;
}

export const cvTrackingService = {
  async recordOptimisation(
    userId: string,
    cv: string,
    jobDescription: string,
    analysis: any,
    metadata: Metadata,
    userEmail: string
  ) {
    try {
      logger.info('Recording CV optimization', { 
        userId,
        userEmail,
        tokenCount: metadata.tokenCount,
        apiVersion: metadata.apiVersion
      });

      const { data, error } = await supabase
        .from('cv_optimisations')
        .insert({
          user_id: userId,
          cv_text: cv,
          job_description: jobDescription,
          analysis_result: analysis,
          token_count: metadata.tokenCount,
          processing_time_ms: metadata.processingTime,
          api_version: metadata.apiVersion,
          email: userEmail
        })
        .select()
        .single();

      if (error) {
        logger.error('Failed to record optimization:', { 
          error: error.message,
          userId,
          userEmail,
          apiVersion: metadata.apiVersion
        });
        throw error;
      }

      logger.info('Successfully recorded CV optimization', {
        optimizationId: data.id,
        userId,
        processingTime: metadata.processingTime
      });

      return data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to record optimization:', { error: errorMessage });
      Analytics.event('cv_optimization', 'record_error', errorMessage);
      throw error;
    }
  },

  async getUserStats(userId: string) {
    try {
      logger.info('Fetching user stats', { userId });

      const { data, error } = await supabase
        .from('cv_optimisations')
        .select('created_at, analysis_result->overallScore')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Failed to get user stats:', { error: error.message, userId });
        throw error;
      }

      logger.info('Successfully fetched user stats', { 
        userId,
        optimizationCount: data.length 
      });

      return data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to get user stats:', { error: errorMessage, userId });
      Analytics.event('cv_optimization', 'stats_error', errorMessage);
      throw error;
    }
  },

  async getUserOptimisations(userId: string) {
    try {
      logger.info('Fetching user optimizations', { userId });

      const { data, error } = await supabase
        .from('cv_optimisations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Failed to get user optimizations:', { error: error.message, userId });
        throw error;
      }

      logger.info('Successfully fetched user optimizations', { 
        userId,
        count: data.length 
      });

      return data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to get user optimizations:', { error: errorMessage, userId });
      Analytics.event('cv_optimization', 'history_error', errorMessage);
      throw error;
    }
  }
};