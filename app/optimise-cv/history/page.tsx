'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Bot, ChevronRight, ArrowLeft, Search, Plus, FileText } from 'lucide-react';
import Link from 'next/link';
import { useAuthProtection } from '@/hooks/useAuthProtection';
import { cvTrackingService } from '@/services/cv/cvTrackingService';
import { createLogger } from '@/services/logger/logger';
import { Analytics } from '@/services/analytics/analytics';

const logger = createLogger({ module: 'CVHistoryPage' });

// Type definitions based on database schema
interface CVOptimisation {
  id: string;
  user_id: string;
  overall_score: number;
  created_at: string;
  job_description: string;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getScoreColor(score: number): string {
  if (score >= 80) return "#22c55e"; // Green
  if (score >= 70) return "#f97316"; // Orange
  return "#ef4444"; // Red
}

export default function CVHistoryPage() {
  const { isAuthenticated, isLoading, userData } = useAuthProtection();
  const router = useRouter();
  const [optimisations, setOptimisations] = useState<CVOptimisation[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    // Track page view
    Analytics.event('page_view', 'cv_history_page');
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/signin?redirect=/optimise-cv/history');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    const fetchOptimisationHistory = async () => {
      if (!isAuthenticated || !userData?.id) return;
      
      try {
        setIsLoadingData(true);
        setError(null);
        
        // Get all user's CV optimisations
        const optimisations = await cvTrackingService.getUserOptimisations(userData.id);
        setOptimisations(optimisations || []);
        
      } catch (err) {
        logger.error("Failed to fetch CV optimisation history:", err);
        setError("Failed to load your CV optimization history. Please try again.");
        Analytics.event('cv_optimization', 'history_error', err instanceof Error ? err.message : 'unknown');
      } finally {
        setIsLoadingData(false);
      }
    };
    
    fetchOptimisationHistory();
  }, [isAuthenticated, userData?.id]);

  // Filter optimisations based on search term
  const filteredOptimisations = optimisations.filter(opt => 
    opt.job_description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Loading state
  if (isLoading || isLoadingData) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
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
            <div className="mb-4 md:mb-0">
              <div className="flex items-center mb-2">
                <Bot className="w-6 h-6 text-orange-500 mr-2" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Your CV Optimization History
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Review your past CV optimizations and AI feedback
              </p>
            </div>
            
            <Link
              href="/optimise-cv"
              className="mt-4 md:mt-0 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg flex items-center justify-center self-start"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Optimization
            </Link>
          </div>
        </motion.div>
        
        {/* Search and filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Search by job description..."
            />
          </div>
        </motion.div>
        
        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-300"
          >
            <p>{error}</p>
          </motion.div>
        )}
        
        {/* CV Optimisation list */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
        >
          {filteredOptimisations.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredOptimisations.map((opt, index) => (
                <motion.div
                  key={opt.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-start md:items-center justify-between flex-col md:flex-row">
                    <div className="flex items-center mb-4 md:mb-0">
                      <div className="relative w-14 h-14 flex-shrink-0 mr-4">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
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
                            stroke={getScoreColor(opt.overall_score)}
                            strokeWidth="10"
                            strokeLinecap="round"
                            strokeDasharray={`${opt.overall_score * 2.83} 283`}
                            transform="rotate(-90 50 50)"
                          />
                          <text
                            x="50"
                            y="50"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="text-xl font-bold fill-gray-900 dark:fill-white"
                          >
                            {opt.overall_score}
                          </text>
                        </svg>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                          {opt.job_description.split('\n')[0]}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Optimized on {formatDate(opt.created_at)}
                        </p>
                      </div>
                    </div>
                    
                    <Link
                      href={`/optimise-cv/history/${opt.id}`}
                      className="inline-flex items-center px-4 py-2 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg font-medium text-sm hover:bg-orange-200 dark:hover:bg-orange-900/40 transition-colors"
                    >
                      View Details
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              {searchTerm ? (
                <>
                  <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No matching optimizations found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                    We couldn't find any CV optimizations matching "{searchTerm}". Try a different search term.
                  </p>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Clear Search
                  </button>
                </>
              ) : (
                <>
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No CV Optimizations Yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                    You haven't optimized any CVs yet. Start by optimizing your CV for a specific apprenticeship.
                  </p>
                  <Link
                    href="/optimise-cv"
                    className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg"
                  >
                    Optimize Your CV Now
                  </Link>
                </>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}