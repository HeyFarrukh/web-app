import supabase from '@/config/supabase';
import { AIAnalysisResponse } from '../ai/geminiService';
import { createLogger } from '@/services/logger/logger';
import { Analytics } from '@/services/analytics/analytics';

interface OptimisationRecord {
  id: string;
  userId: string;
  cvText: string;
  jobDescription: string;
  overallScore: number;
  createdAt: Date;
  metadata?: Record<string, any>;
  userEmail: string;
}

export class CVTrackingService {
  private logger = createLogger({ module: 'CVTrackingService' });

  async recordOptimisation(
    userId: string,
    cvText: string,
    jobDescription: string,
    analysis: AIAnalysisResponse,
    metadata: Record<string, any>,
    userEmail: string
  ) {
    try {
      this.logger.info('Recording CV optimization', { 
        userId,
        userEmail,
        tokenCount: metadata.tokenCount,
        apiVersion: metadata.apiVersion
      });

      const { data: optimisation, error: optimisationError } = await supabase
        .from('cv_optimisations')
        .insert({
          user_id: userId,
          cv_text: cvText,
          job_description: jobDescription,
          overall_score: analysis.overallScore,
          metadata: metadata,
          user_email: userEmail,
          token_count: metadata.tokenCount,
          processing_time_ms: metadata.processingTime,
          api_version: metadata.apiVersion
        })
        .select()
        .single();

      if (optimisationError) {
        this.logger.error('Failed to record optimization:', { error: optimisationError, userId, userEmail, apiVersion: metadata.apiVersion });
        Analytics.event('cv_optimization', 'record_error', optimisationError.message);
        throw optimisationError;
      }

      const improvements = analysis.improvements.map(imp => ({
        optimisation_id: optimisation.id,
        section: imp.section,
        score: imp.score,
        impact: imp.impact,
        context: imp.context,
        suggestions: JSON.stringify(imp.suggestions),
        optimised_content: imp.optimisedContent,
        user_email: userEmail
      }));

      const { error: improvementsError } = await supabase
        .from('cv_optimisation_improvements')
        .insert(improvements);

      if (improvementsError) {
        this.logger.error('Failed to record optimization improvements:', { error: improvementsError, optimisationId: optimisation.id });
        Analytics.event('cv_optimization', 'improvements_error', improvementsError.message);
        throw improvementsError;
      }

      this.logger.info('Successfully recorded optimization', { 
        optimizationId: optimisation.id,
        userId,
        processingTime: metadata.processingTime
      });
      return optimisation;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to record optimization:', { error: errorMessage });
      Analytics.event('cv_optimization', 'record_error', errorMessage);
      throw error;
    }
  }

  async getUserStats(userId: string) {
    try {
      this.logger.info('Fetching user stats', { userId });

      const { data, error } = await supabase
        .from('cv_optimisations')
        .select('created_at, overall_score')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        this.logger.error('Failed to get user stats:', { error, userId });
        Analytics.event('cv_optimization', 'stats_error', error.message);
        throw error;
      }

      this.logger.info('Successfully fetched user stats', {
        userId,
        optimizationCount: data?.length
      });
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to get user stats:', { error: errorMessage, userId });
      Analytics.event('cv_optimization', 'stats_error', errorMessage);
      throw error;
    }
  }

  async getUserOptimisations(userId: string, limit = 10, offset = 0) {
    try {
      this.logger.info('Fetching user optimizations', { userId });

      const { data, error } = await supabase
        .from('cv_optimisations')
        .select(`
          *,
          cv_optimisation_improvements (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        this.logger.error('Failed to get user optimizations:', { error, userId });
        Analytics.event('cv_optimization', 'history_error', error.message);
        throw error;
      }

      this.logger.info('Successfully fetched user optimizations', {
        userId,
        count: data?.length
      });
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to get user optimizations:', { error: errorMessage, userId });
      Analytics.event('cv_optimization', 'history_error', errorMessage);
      throw error;
    }
  }
}

export const cvTrackingService = new CVTrackingService();