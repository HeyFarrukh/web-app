'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Copy, Check, ArrowLeft, FileText, Zap, TrendingUp, Target, Key, Cpu, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useAuthProtection } from '@/hooks/useAuthProtection';
import { useAuth } from '@/hooks/useAuth';
import { cvTrackingService } from '@/services/cv/cvTrackingService';
import { createLogger } from '@/services/logger/logger';
import { Analytics } from '@/services/analytics/analytics';

const logger = createLogger({ module: 'CVHistoryDetail' });

// Type definitions based on database schema
interface CVOptimisation {
  id: string;
  user_id: string;
  cv_text: string;
  job_description: string;
  overall_score: number;
  created_at: string;
  token_count?: number;
  processing_time_ms?: number;
  api_version?: string;
  metadata?: any;
  cv_optimisation_improvements?: CVOptimisationImprovement[];
}

interface CVOptimisationImprovement {
  id: string;
  optimisation_id: string;
  section: string;
  score: number;
  impact: 'high' | 'medium' | 'low';
  context?: string;
  suggestions: string;
  optimised_content?: string;
}

interface CopyState {
  [key: string]: boolean;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

const getImpactColor = (impact: string) => {
  switch (impact.toLowerCase()) {
    case 'high':
      return 'text-red-500 dark:text-red-400';
    case 'medium':
      return 'text-orange-500 dark:text-orange-400';
    case 'low':
      return 'text-green-500 dark:text-green-400';
    default:
      return 'text-gray-500 dark:text-gray-400';
  }
};

const getIconForCategory = (name: string): React.ElementType => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('relev')) return Target;
  if (lowerName.includes('impact')) return TrendingUp;
  if (lowerName.includes('clar')) return Cpu;
  if (lowerName.includes('key')) return Key;
  return Sparkles;
};

export default function CVHistoryDetailPage() {
  const { isAuthenticated, isLoading } = useAuthProtection();
  const { userData } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [optimisation, setOptimisation] = useState<CVOptimisation | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copyStates, setCopyStates] = useState<CopyState>({});
  
  const optimisationId = params?.id as string;

  useEffect(() => {
    // Track page view
    Analytics.event('page_view', 'cv_history_detail_page');
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/signin?redirect=${encodeURIComponent(`/optimise-cv/history/${optimisationId}`)}`);
    }
  }, [isLoading, isAuthenticated, router, optimisationId]);

  useEffect(() => {
    const fetchOptimisationDetails = async () => {
      if (!isAuthenticated || !userData?.id) return;
      
      try {
        setIsLoadingData(true);
        setError(null);
        
        // Get user's optimisations 
        const optimisations = await cvTrackingService.getUserOptimisations(userData.id);
        
        // Find the specific optimisation
        const targetOptimisation = optimisations?.find(
          (opt) => opt.id === optimisationId
        );
        
        if (!targetOptimisation) {
          setError("Optimization not found or you don't have permission to view it");
          return;
        }
        
        // Parse suggestions for each improvement
        if (targetOptimisation.cv_optimisation_improvements) {
          targetOptimisation.cv_optimisation_improvements = targetOptimisation.cv_optimisation_improvements.map(
            (imp: any) => ({
              ...imp,
              suggestions: typeof imp.suggestions === 'string' 
                ? JSON.parse(imp.suggestions) 
                : imp.suggestions
            })
          );
        }
        
        setOptimisation(targetOptimisation);
        
      } catch (err) {
        logger.error("Failed to fetch CV optimisation details:", err);
        setError("Failed to load optimisation details. Please try again.");
        Analytics.event('cv_optimization', 'history_detail_error', err instanceof Error ? err.message : 'unknown');
      } finally {
        setIsLoadingData(false);
      }
    };
    
    fetchOptimisationDetails();
  }, [isAuthenticated, userData?.id, optimisationId]);

  const handleCopyContent = async (sectionId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopyStates((prev) => ({
        ...prev,
        [sectionId]: true,
      }));
      
      Analytics.event('cv_optimization', 'copy_optimised_content', sectionId);
      
      setTimeout(() => {
        setCopyStates((prev) => ({
          ...prev,
          [sectionId]: false,
        }));
      }, 2000);
    } catch (error) {
      console.error("Failed to copy content:", error);
    }
  };

  // Loading state
  if (isLoading || isLoadingData) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <FileText className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error}
          </h2>
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-orange-500 hover:text-orange-600 dark:text-orange-400"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  // No data state
  if (!optimisation) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <FileText className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            No Optimization Found
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            We couldn't find the CV optimization you're looking for.
          </p>
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-orange-500 hover:text-orange-600 dark:text-orange-400"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Extract data
  const improvements = optimisation.cv_optimisation_improvements || [];
  
  // Calculate category scores based on improvements
  const categories = [
    { name: 'Relevance', score: 0, count: 0 },
    { name: 'Impact', score: 0, count: 0 },
    { name: 'Clarity', score: 0, count: 0 },
    { name: 'Keywords', score: 0, count: 0 },
  ];
  
  // Calculate average score for each category
  improvements.forEach(imp => {
    const sectionName = imp.section.toLowerCase();
    
    // Map section to category (simplified logic, can be improved)
    if (sectionName.includes('experience') || sectionName.includes('education')) {
      categories[0].score += imp.score;
      categories[0].count++;
    } else if (sectionName.includes('achievements') || sectionName.includes('skills')) {
      categories[1].score += imp.score;
      categories[1].count++;
    } else if (sectionName.includes('summary') || sectionName.includes('profile')) {
      categories[2].score += imp.score;
      categories[2].count++;
    } else {
      categories[3].score += imp.score;
      categories[3].count++;
    }
  });
  
  // Calculate final average scores
  const finalCategories = categories.map(cat => ({
    ...cat,
    score: cat.count > 0 ? Math.round(cat.score / cat.count) : 70, // Default if no data
    icon: getIconForCategory(cat.name),
    description: `Score based on ${cat.name.toLowerCase()} to the job requirements`
  }));

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button and header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-gray-600 hover:text-orange-500 dark:text-gray-400 dark:hover:text-orange-400 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to dashboard
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center mb-2">
                <Bot className="w-6 h-6 text-orange-500 mr-2" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  CV Optimization History
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                From {formatDate(optimisation.created_at)} • Overall Score: <span className="text-orange-500 font-semibold">{optimisation.overall_score}</span>
              </p>
            </div>
            
            <Link
              href="/optimise-cv"
              className="mt-4 md:mt-0 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg flex items-center justify-center self-start"
            >
              <Bot className="w-4 h-4 mr-2" />
              New Optimization
            </Link>
          </div>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,2fr] gap-8">
          {/* Left column - Job description and score */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* Score Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-orange-500/20 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">CV Score</h2>
              
              <div className="relative w-40 h-40 mx-auto mb-6">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f97316" />
                      <stop offset="100%" stopColor="#fb923c" />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="10"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="url(#scoreGradient)"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${optimisation.overall_score * 2.83} 283`}
                    transform="rotate(-90 50 50)"
                  />
                  <text
                    x="50"
                    y="50"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-3xl font-bold fill-gray-900 dark:fill-white"
                  >
                    {optimisation.overall_score}
                  </text>
                  <text
                    x="50"
                    y="68"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-sm fill-orange-500 font-medium"
                  >
                    /100
                  </text>
                </svg>
              </div>
              
              <div className="space-y-4">
                {finalCategories.map((category, index) => (
                  <div
                    key={category.name}
                    className="bg-gradient-to-br from-orange-500/5 to-transparent dark:from-orange-500/10 rounded-lg p-4"
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <category.icon className="w-4 h-4 text-orange-500" />
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {category.name}
                      </h4>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-500"
                          style={{ width: `${category.score}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {category.score}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      {category.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Job Description */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-orange-500/20">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Job Description</h2>
              <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 text-sm font-mono p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg max-h-96 overflow-y-auto custom-scrollbar">
                {optimisation.job_description}
              </div>
            </div>
          </motion.div>
          
          {/* Right column - Improvements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-orange-500/20">
              <div className="flex items-center space-x-2 mb-6">
                <Bot className="w-5 h-5 text-orange-500" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  AI Recommendations
                </h2>
              </div>
              
              {improvements.length > 0 ? (
                <div className="space-y-6">
                  {improvements.map((improvement, index) => (
                    <motion.div
                      key={improvement.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gradient-to-br from-orange-500/5 to-transparent dark:from-orange-500/10 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                          <Sparkles className="w-4 h-4 text-orange-500" />
                          <span>{improvement.section}</span>
                        </h4>
                        <div className="flex items-center space-x-3">
                          <span
                            className={`text-sm font-medium ${getImpactColor(
                              improvement.impact
                            )}`}
                          >
                            {improvement.impact.toUpperCase()} IMPACT
                          </span>
                          <div className="flex items-center space-x-1">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {improvement.score}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              /100
                            </span>
                          </div>
                        </div>
                      </div>

                      {improvement.context && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {improvement.context}
                        </p>
                      )}

                      <ul className="space-y-2 mb-4">
                        {Array.isArray(improvement.suggestions) 
                          ? improvement.suggestions.map((suggestion: string, i: number) => (
                              <motion.li
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 + i * 0.05 }}
                                className="text-gray-600 dark:text-gray-300 flex items-start"
                              >
                                <Zap className="w-4 h-4 text-orange-500 mr-2 flex-shrink-0 mt-0.5" />
                                {suggestion}
                              </motion.li>
                            ))
                          : typeof improvement.suggestions === 'string' && improvement.suggestions.trim() !== '' 
                            ? (
                                <motion.li
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  className="text-gray-600 dark:text-gray-300 flex items-start"
                                >
                                  <Zap className="w-4 h-4 text-orange-500 mr-2 flex-shrink-0 mt-0.5" />
                                  {improvement.suggestions}
                                </motion.li>
                              )
                            : null
                        }
                      </ul>

                      {improvement.optimised_content && (
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                              Optimised {improvement.section}
                            </h5>
                            <button
                              onClick={() =>
                                handleCopyContent(
                                  improvement.section,
                                  improvement.optimised_content!
                                )
                              }
                              className="flex items-center space-x-1 text-orange-500 hover:text-orange-600 text-sm"
                            >
                              {copyStates[improvement.section] ? (
                                <>
                                  <Check className="w-4 h-4" />
                                  <span>Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-sm text-gray-700 dark:text-gray-300">
                            {improvement.optimised_content}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    No specific improvement recommendations were provided for this CV.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}