import supabase from '../../config/supabase';
import { AIAnalysisResponse } from '../ai/geminiService';

interface OptimizationRecord {
  id: string;
  userId: string;
  cvText: string;
  jobDescription: string;
  overallScore: number;
  createdAt: Date;
  metadata?: Record<string, any>;
}

export class CVTrackingService {
  async recordOptimization(
    userId: string,
    cvText: string,
    jobDescription: string,
    analysis: AIAnalysisResponse,
    metadata?: Record<string, any>
  ) {
    try {
      // Start a transaction
      const { data: optimization, error: optimizationError } = await supabase
        .from('cv_optimizations')
        .insert({
          user_id: userId,
          cv_text: cvText,
          job_description: jobDescription,
          overall_score: analysis.overallScore,
          metadata: metadata || {}
        })
        .select()
        .single();

      if (optimizationError) throw optimizationError;

      // Record improvements
      const improvements = analysis.improvements.map(imp => ({
        optimization_id: optimization.id,
        section: imp.section,
        score: imp.score,
        impact: imp.impact,
        context: imp.context,
        suggestions: JSON.stringify(imp.suggestions),
        optimized_content: imp.optimizedContent
      }));

      const { error: improvementsError } = await supabase
        .from('cv_optimization_improvements')
        .insert(improvements);

      if (improvementsError) throw improvementsError;

      return optimization;
    } catch (error) {
      console.error('Failed to record optimization:', error);
      throw error;
    }
  }

  async getUserStats(userId: string) {
    try {
      const { data, error } = await supabase
        .rpc('get_user_optimization_stats', { user_id: userId });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to get user stats:', error);
      throw error;
    }
  }

  async getUserOptimizations(userId: string, limit = 10, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('cv_optimizations')
        .select(`
          *,
          cv_optimization_improvements (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to get user optimizations:', error);
      throw error;
    }
  }
}

export const cvTrackingService = new CVTrackingService();