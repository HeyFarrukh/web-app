import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Lock, AlertCircle, X, Sparkles, Zap, Bot, Cpu, Target, TrendingUp, FileText, Key, Copy, Check } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { geminiService } from '../services/ai/geminiService';
import { cvTrackingService } from '../services/cv/cvTrackingService';
import { useAuth } from '../hooks/useAuth';

interface ScoreCategory {
  name: string;
  score: number;
  description: string;
  icon: React.ElementType;
}

interface Improvement {
  section: string;
  score: number;
  suggestions: string[];
  impact: "high" | "medium" | "low";
  context?: string;
  optimisedContent?: string;
}

interface CopyState {
  [key: string]: boolean;
}

const MIN_CV_LENGTH = 200;
const MIN_JOB_DESC_LENGTH = 50;

const LoadingMessages = [
  "Let the AI cook fr fr... 👨‍🍳",
  "Giving your CV that rizz... ✨",
  "This bout to be fire! 🙏",
  "Analysing your CV (respectfully)... 👀",
];

export const OptimiseCV = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, userData } = useAuth();
  const [cvText, setCvText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [showIncompleteWarning, setShowIncompleteWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const [scoreCategories, setScoreCategories] = useState<ScoreCategory[]>([]);
  const [improvements, setImprovements] = useState<Improvement[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copyStates, setCopyStates] = useState<CopyState>({});
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnalyzing) {
      interval = setInterval(() => {
        setLoadingMessageIndex(prev => (prev + 1) % LoadingMessages.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  // Check authentication
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Save current location to redirect back after login
      console.log('[OptimiseCV] Redirecting to /signin, state:', { from: location }); // Add this line
      navigate('/signin', { 
        state: { from: location },
        replace: true 
      });
    }
  }, [isLoading, isAuthenticated, navigate, location]);

  const validateInput = () => {
    if (cvText.length < MIN_CV_LENGTH) {
      setWarningMessage('Please paste your complete CV. The content seems too short to be a valid CV.');
      setShowIncompleteWarning(true);
      return false;
    }

    if (jobDescription.length < MIN_JOB_DESC_LENGTH) {
      setWarningMessage('Please paste the job description. This helps us tailor your CV to the role.');
      setShowIncompleteWarning(true);
      return false;
    }

    return true;
  };

  const handleOptimise = async () => {
    if (!isAuthenticated) {
      navigate('/signin', { 
        state: { from: location },
        replace: true 
      });
      return;
    }

    if (!validateInput()) {
      return;
    }

    const startTime = Date.now();

    try {
      setIsAnalyzing(true);
      const analysis = await geminiService.analyzeCV(cvText, jobDescription);
      
      // Record the optimization
      if (userData?.id) {
        await cvTrackingService.recordOptimisation(
          userData.id,
          cvText,
          jobDescription,
          analysis,
          {
            tokenCount: cvText.split(/\s+/).length,
            processingTime: Date.now() - startTime,
            apiVersion: 'gemini-2.0-flash'
          }
        );
      }

      setScore(analysis.overallScore);
      setScoreCategories(analysis.categories.map(cat => ({
        ...cat,
        icon: getIconForCategory(cat.name)
      })));

      // Only show improvements that have suggestions or optimized content
      const validImprovements = analysis.improvements.filter(
        imp => (imp.suggestions?.length > 0 || imp.optimisedContent)
      );
      setImprovements(validImprovements);
      
    } catch (error) {
      console.error('Analysis failed:', error);
      setWarningMessage('Sorry, something went wrong while analyzing your CV. Please try again.');
      setShowIncompleteWarning(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyContent = async (sectionId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopyStates(prev => ({ ...prev, [sectionId]: true }));
      setTimeout(() => {
        setCopyStates(prev => ({ ...prev, [sectionId]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getIconForCategory = (name: string) => {
    switch (name.toLowerCase()) {
      case 'relevance':
        return Target;
      case 'impact':
        return TrendingUp;
      case 'clarity':
        return FileText;
      case 'keywords':
        return Key;
      default:
        return Sparkles;
    }
  };

  const getImpactColor = (impact: "high" | "medium" | "low"): string => {
    switch (impact) {
      case "high":
        return "text-red-500 dark:text-red-400";
      case "medium":
        return "text-orange-500 dark:text-orange-400";
      case "low":
        return "text-green-500 dark:text-green-400";
      default:
        return "text-gray-500 dark:text-gray-400";
    }
  };

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <>
 <Helmet>
  {/* Essential SEO Meta Tags */}
  <title>AI CV Optimisation Tool for Apprenticeships | ApprenticeWatch</title>
  <meta 
    name="description" 
    content="Get instant AI-powered CV feedback tailored for apprenticeships. Optimise with expert recommendations and boost interview chances. Free tool - try now!" 
  />
  <meta name="robots" content="index, follow, max-snippet: 155" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="canonical" href="https://apprenticewatch.com/optimise-cv" />

  {/* Open Graph (Social Sharing) */}
  <meta property="og:title" content="AI-Powered CV Optimisation for Apprenticeships | ApprenticeWatch" />
  <meta property="og:description" content="Stand out in apprenticeship applications with AI-analysed CV feedback. Get tailored optimisation tips instantly." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://apprenticewatch.com/optimise-cv" />
  <meta property="og:image" content="https://apprenticewatch.com/images/og-cv-optimiser.jpg" />

  {/* Twitter Card */}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Free AI CV Optimiser for Apprentice Applications" />
  <meta name="twitter:description" content="AI-powered analysis helps tailor your CV to apprenticeship job descriptions. Get interview-ready in minutes." />
  <meta name="twitter:image" content="https://apprenticewatch.com/images/twitter-cv-optimiser.jpg" />
  
</Helmet>

      <div className="min-h-screen pt-24 pb-12 bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* AI-branded Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center space-x-2 mb-4">
              <Bot className="w-8 h-8 text-orange-500" />
              <span className="text-sm font-medium px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 dark:bg-orange-500/20">
                Powered by AI
              </span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              AI CV <span className="text-orange-500">Optimisation ᵇᵉᵗᵃ</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Let our AI analyse and enhance your CV for better apprenticeship opportunities
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-[350px,1fr] gap-8">
            {/* Left Column - Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {/* PDF Upload Section */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-orange-500/20">
                <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent rounded-lg" />
                  <div className="relative">
                    <Lock className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      PDF Upload Coming Soon
                    </p>
                  </div>
                </div>
              </div>

              {/* CV Text Input */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-orange-500/20">
                <div className="flex items-center space-x-2 mb-2">
                  <Cpu className="w-4 h-4 text-orange-500" />
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Paste Your CV Text
                  </label>
                </div>
                <textarea
                  value={cvText}
                  onChange={(e) => setCvText(e.target.value)}
                  className="w-full h-48 p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-sm"
                  placeholder="Copy and paste your CV content here..."
                />
              </div>

              {/* Job Description Input */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-orange-500/20">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="w-4 h-4 text-orange-500" />
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Job Description
                  </label>
                </div>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full h-32 p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-sm"
                  placeholder="Paste the job description here..."
                />
              </div>

              <button
                onClick={handleOptimise}
                disabled={isAnalyzing}
                className="w-full py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-5 h-5" />
                <span>{isAnalyzing ? 'AI is Analyzing...' : 'Optimise with AI'}</span>
              </button>
            </motion.div>

            {/* Right Column - Results */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {isAnalyzing ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center space-y-6">
                    <div className="relative w-20 h-20 mx-auto">
                      <div className="absolute inset-0 rounded-full border-4 border-orange-500/30 animate-ping" />
                      <div className="absolute inset-0 rounded-full border-4 border-orange-500 animate-spin" />
                      <Bot className="absolute inset-0 m-auto w-10 h-10 text-orange-500" />
                    </div>
                    <motion.p 
                      key={loadingMessageIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-lg font-medium text-gray-600 dark:text-gray-300"
                    >
                      {LoadingMessages[loadingMessageIndex]}
                    </motion.p>
                  </div>
                </div>
              ) : score !== null ? (
                <>
                  {/* Overall Score */}
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-orange-500/20">
                    <div className="text-center mb-8">
                      <motion.div
                        className="relative w-48 h-48 mx-auto"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", duration: 1.5 }}
                      >
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
                          <motion.circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="url(#scoreGradient)"
                            strokeWidth="10"
                            strokeLinecap="round"
                            strokeDasharray={`${score * 2.83} 283`}
                            transform="rotate(-90 50 50)"
                            initial={{ strokeDasharray: "0 283" }}
                            animate={{ strokeDasharray: `${score * 2.83} 283` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                          />
                        </svg>
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                        >
                          <div className="text-center">
                            <div className="text-4xl font-bold text-gray-900 dark:text-white">
                              {score}
                            </div>
                            <div className="text-sm text-orange-500 font-medium">Overall Score</div>
                          </div>
                        </motion.div>
                      </motion.div>
                    </div>

                    {/* Score Categories */}
                    <div className="grid grid-cols-2 gap-4">
                      {scoreCategories.map((category, index) => (
                        <motion.div
                          key={category.name}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 + index * 0.1 }}
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
                              <motion.div
                                className="h-full bg-orange-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${category.score}%` }}
                                transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {category.score}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                            {category.description}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Detailed Improvements */}
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-orange-500/20">
                    <div className="flex items-center space-x-2 mb-6">
                      <Bot className="w-5 h-5 text-orange-500" />
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        AI Recommendations
                      </h3>
                    </div>
                    <div className="space-y-6">
                      {improvements.map((improvement, index) => (
                        <motion.div
                          key={improvement.section}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.2 }}
                          className="bg-gradient-to-br from-orange-500/5 to-transparent dark:from-orange-500/10 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                              <Sparkles className="w-4 h-4 text-orange-500" />
                              <span>{improvement.section}</span>
                            </h4>
                            <div className="flex items-center space-x-3">
                              <span className={`text-sm font-medium ${getImpactColor(improvement.impact)}`}>
                                {improvement.impact.toUpperCase()} IMPACT
                              </span>
                              <div className="flex items-center space-x-1">
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {improvement.score}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">/100</span>
                              </div>
                            </div>
                          </div>
                          
                          {improvement.context && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              {improvement.context}
                            </p>
                          )}

                          {/* Suggestions List */}
                          <ul className="space-y-2 mb-4">
                            {improvement.suggestions.map((suggestion, i) => (
                              <motion.li
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.2 + i * 0.1 }}
                                className="text-gray-600 dark:text-gray-300 flex items-start"
                              >
                                <Zap className="w-4 h-4 text-orange-500 mr-2 flex-shrink-0 mt-0.5" />
                                {suggestion}
                              </motion.li>
                            ))}
                          </ul>

                          {/* Optimized Content Section */}
                          {improvement.optimisedContent && (
                            <div className="mt-4 space-y-2">
                              <div className="flex items-center justify-between">
                                <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                                  Optimised {improvement.section}
                                </h5>
                                <button
                                  onClick={() => handleCopyContent(improvement.section, improvement.optimisedContent!)}
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
                                {improvement.optimisedContent}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <Bot className="w-16 h-16 text-orange-500/50 mx-auto" />
                    <p className="text-lg text-gray-500 dark:text-gray-400">
                      Paste your CV and job description to get AI-powered insights
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* AI Disclaimer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-16 text-center"
          >
            <div className="max-w-3xl mx-auto px-6 py-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-sm text-gray-600 dark:text-gray-400">
              <p className="mb-2">
                Our AI-powered CV optimisation is designed to provide valuable insights, but results may vary. We're always working to improve—if you spot anything that seems off, let us know at{' '}
                <a 
                  href="mailto:feedback@apprenticewatch.com" 
                  className="text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-500"
                >
                  feedback@apprenticewatch.com
                </a>.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Incomplete Warning Modal */}
      <AnimatePresence>
        {showIncompleteWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-start mb-4">
                <AlertCircle className="w-6 h-6 text-orange-500 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Hold Up!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">
                    {warningMessage}
                  </p>
                </div>
                <button
                  onClick={() => setShowIncompleteWarning(false)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowIncompleteWarning(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default OptimiseCV;