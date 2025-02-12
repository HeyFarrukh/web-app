import supabase from '../../config/supabase';
import { AIAnalysisResponse } from '../ai/geminiService';

interface OptimisationRecord {
  id: string;
  userId: string;
  cvText: string;
  jobDescription: string;
  overallScore: number;
  createdAt: Date;
  metadata?: Record<string, any>;
  userEmail: string; // ADDED THIS LINE
}


export class CVTrackingService {
  // Line 16: Add userEmail as an optional parameter
  async recordOptimisation(
    userId: string,
    cvText: string,
    jobDescription: string,
    analysis: AIAnalysisResponse,
    metadata?: Record<string, any>,
    userEmail?: string // ADDED THIS PARAMETER (optional)
  ) {
    try {
      // Line 23: Add user_email to the insert object
      const { data: optimisation, error: optimisationError } = await supabase
        .from('cv_optimisations')
        .insert({
          user_id: userId,
          cv_text: cvText,
          job_description: jobDescription,
          overall_score: analysis.overallScore,
          metadata: metadata || {},
          user_email: userEmail || '' // ADDED THIS LINE, with default
        })
        .select()
        .single();

      if (optimisationError) throw optimisationError;

      // Record improvements
      const improvements = analysis.improvements.map(imp => ({
        optimisation_id: optimisation.id,
        section: imp.section,
        score: imp.score,
        impact: imp.impact,
        context: imp.context,
        suggestions: JSON.stringify(imp.suggestions),
        optimised_content: imp.optimisedContent,
        user_email: userEmail || '' // ADDED THIS LINE, with default
      }));

      const { error: improvementsError } = await supabase
        .from('cv_optimisation_improvements')
        .insert(improvements);

      if (improvementsError) throw improvementsError;

      return optimisation;
    } catch (error) {
      console.error('Failed to record optimisation:', error);
      throw error;
    }
  }

  async getUserStats(userId: string) {
    try {
      const { data, error } = await supabase
        .rpc('get_user_optimisation_stats', { user_id: userId });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to get user stats:', error);
      throw error;
    }
  }

  async getUserOptimisations(userId: string, limit = 10, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('cv_optimisations')
        .select(`
          *,
          cv_optimisation_improvements (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to get user optimisations:', error);
      throw error;
    }
  }
}

export const cvTrackingService = new CVTrackingService();