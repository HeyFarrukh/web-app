"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  AlertCircle,
  X,
  Sparkles,
  Zap,
  Bot,
  Cpu,
  Target,
  TrendingUp,
  FileText,
  Key,
  Copy,
  Check,
  Upload,
  Search,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { geminiService } from "@/services/ai/geminiService";
import { cvTrackingService } from "@/services/cv/cvTrackingService";
import { useAuth } from "@/hooks/useAuth";
import { Analytics } from "@/services/analytics/analytics";
import { FileUpload } from "@/components/ui/FileUpload";
import { pdfService } from "@/services/pdf/pdfService";
import { pdfStorageService } from "@/services/storage/pdfStorageService";
import { createLogger } from "@/services/logger/logger";
import { vacancyService } from "@/services/supabase/vacancyService";
import { ListingType } from "@/types/listing";

const logger = createLogger({ module: "OptimiseCV" });

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
const ANALYSIS_COOLDOWN = 20000; // 20 seconds cooldown
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

const LoadingMessages = [
  "Let the AI cook... 👨‍🍳🔥",
  "Scanning for W's... 📄🔍",
  "Giving your CV main character energy... ✨",
  "This about to be fire! 🙏",
  "Analysing your CV (respectfully)... 👀",
];

interface WarningState {
  show: boolean;
  message: string;
}

// Utility functions
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + " bytes";
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  else return (bytes / 1048576).toFixed(1) + " MB";
};

// Define error messages in one place
export const errorMessages = {
  fileTooLarge: `File size exceeds ${formatFileSize(
    MAX_FILE_SIZE
  )} limit. Please upload a smaller PDF file. 📄`,
  tooManyFiles: "Please upload only one PDF file at a time. 📄",
  fileInvalidType:
    "Please upload a PDF file. Other file types are not supported. 📄",
  processingError:
    "Failed to process PDF. Please try again or paste your CV text manually. 📄",
  uploadError: "Failed to upload PDF. Please try again. 📄",
  insufficientText:
    "The extracted text seems too short. Please ensure your PDF contains readable text or try pasting your CV manually. 📄",
  authError: "Please sign in to upload and process your CV. 📄",
};

export const OptimiseCV = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading, userData } = useAuth();
  const [cvText, setCvText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isManualMode, setIsManualMode] = useState(false);
  const [selectedApprenticeship, setSelectedApprenticeship] =
    useState<ListingType | null>(null);
  const [apprenticeships, setApprenticeships] = useState<ListingType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingApprenticeships, setIsLoadingApprenticeships] =
    useState(false);
  const [warning, setWarning] = useState<WarningState>({
    show: false,
    message: "",
  });
  const [score, setScore] = useState<number | null>(null);
  const [scoreCategories, setScoreCategories] = useState<ScoreCategory[]>([]);
  const [improvements, setImprovements] = useState<Improvement[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copyStates, setCopyStates] = useState<CopyState>({});
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [lastAnalysis, setLastAnalysis] = useState<{
    cv: string;
    jobDesc: string;
    timestamp: number;
  } | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isPdfProcessing, setIsPdfProcessing] = useState(false);
  const [pdfError, setPdfError] = useState<string | undefined>(undefined);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 10; // Preload more items at once for smoother experience
  const VISIBLE_ITEMS = 3; // Only show 3 items in the UI
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Track CV Optimisation page view
    Analytics.event("page_view", "optimise_cv_page");
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnalyzing) {
      interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % LoadingMessages.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const currentPath = window.location.pathname + window.location.search;
      router.push(`/signin?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    const loadApprenticeships = async () => {
      try {
        setIsLoadingApprenticeships(true);
        const { vacancies, total } = await vacancyService.getVacancies({
          page,
          pageSize: ITEMS_PER_PAGE,
          filters: {
            search: searchQuery || undefined,
          },
        });

        if (page === 1) {
          setApprenticeships(vacancies || []);
        } else {
          setApprenticeships((prev) => [...prev, ...(vacancies || [])]);
        }

        setHasMore((vacancies || []).length === ITEMS_PER_PAGE);
      } catch (error) {
        console.error("Failed to load apprenticeships:", error);
        showWarning("Failed to load apprenticeships. Please try again.");
      } finally {
        setIsLoadingApprenticeships(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      setPage(1);
      loadApprenticeships();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Load more when scrolling
  useEffect(() => {
    if (page > 1) {
      const loadMore = async () => {
        try {
          setIsLoadingApprenticeships(true);
          const { vacancies } = await vacancyService.getVacancies({
            page,
            pageSize: ITEMS_PER_PAGE,
            filters: {
              search: searchQuery || undefined,
            },
          });

          setApprenticeships((prev) => [...prev, ...(vacancies || [])]);
          setHasMore((vacancies || []).length === ITEMS_PER_PAGE);
        } catch (error) {
          console.error("Failed to load more apprenticeships:", error);
        } finally {
          setIsLoadingApprenticeships(false);
        }
      };

      loadMore();
    }
  }, [page]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingApprenticeships) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.5 }
    );

    const currentRef = listRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, isLoadingApprenticeships]);

  useEffect(() => {
    // If apprenticeship ID is in URL, select it
    const apprenticeshipId = searchParams?.get("apprenticeshipId");
    if (apprenticeshipId) {
      const apprenticeship = apprenticeships.find(
        (a) => a.id === apprenticeshipId
      );
      if (apprenticeship) {
        setSelectedApprenticeship(apprenticeship);
        const formattedDescription = formatJobDescription(apprenticeship);
        setJobDescription(formattedDescription);
      }
    }
  }, [searchParams, apprenticeships]);

  const formatJobDescription = (apprenticeship: ListingType): string => {
    const sections = [
      `Role: ${apprenticeship.title}`,
      `Company: ${apprenticeship.employerName}`,
      apprenticeship.description && `Overview:\n${apprenticeship.description}`,
      apprenticeship.fullDescription &&
        `Detailed Requirements:\n${apprenticeship.fullDescription}`,
      apprenticeship.skills &&
        apprenticeship.skills.length > 0 &&
        `Required Skills:\n- ${apprenticeship.skills.join("\n- ")}`,
      apprenticeship.qualifications &&
        apprenticeship.qualifications.length > 0 &&
        `Required Qualifications:\n- ${apprenticeship.qualifications
          .map((qual) =>
            typeof qual === "string" ? qual : qual.subject || qual.name
          )
          .join("\n- ")}`,
      apprenticeship.wage &&
        `Salary: ${
          apprenticeship.wage.wageType === "CompetitiveSalary"
            ? "Competitive Salary"
            : apprenticeship.wage.wageAdditionalInformation ||
              `${apprenticeship.wage.wageType} (${apprenticeship.wage.wageUnit})`
        }`,
      apprenticeship.hoursPerWeek &&
        `Hours: ${apprenticeship.hoursPerWeek} hours per week`,
      apprenticeship.workingWeekDescription &&
        `Working Pattern: ${apprenticeship.workingWeekDescription}`,
      apprenticeship.expectedDuration &&
        `Duration: ${apprenticeship.expectedDuration}`,
      apprenticeship.course &&
        `Course Details: Level ${apprenticeship.course.level} - ${apprenticeship.course.title} (${apprenticeship.course.route})`,
    ].filter(Boolean);

    return sections.join("\n\n");
  };

  useEffect(() => {
    if (selectedApprenticeship && !isManualMode) {
      const formattedDescription = formatJobDescription(selectedApprenticeship);
      setJobDescription(formattedDescription);
    }
  }, [selectedApprenticeship, isManualMode]);

  const showWarning = (message: string) => {
    setWarning({
      show: true,
      message,
    });
    // Increased timeout to give users more time to read the message
    setTimeout(() => {
      setWarning({ show: false, message: "" });
    }, 7000); // 7 seconds instead of 5
  };

  const validateInput = () => {
    if (cvText.length < MIN_CV_LENGTH) {
      showWarning(
        "Please paste your complete CV. The content seems too short to be a valid CV."
      );
      return false;
    }

    if (!isManualMode && !selectedApprenticeship) {
      showWarning(
        "Please select an apprenticeship or switch to manual mode to enter a job description."
      );
      return false;
    }

    if (isManualMode && jobDescription.length < MIN_JOB_DESC_LENGTH) {
      showWarning(
        "Please paste the job description. This helps us tailor your CV to the role."
      );
      return false;
    }

    return true;
  };

  const checkDuplicateAnalysis = () => {
    if (!lastAnalysis) return false;

    const isDuplicateCV = cvText === lastAnalysis.cv;
    const isDuplicateJobDesc = jobDescription === lastAnalysis.jobDesc;

    if (isDuplicateCV && isDuplicateJobDesc) {
      showWarning(
        "You've already analysed this exact CV and job description. Make some changes before analysing again."
      );
      return true;
    }

    return false;
  };

  const checkCooldown = () => {
    if (!lastAnalysis) return false;

    const timeSinceLastAnalysis = Date.now() - lastAnalysis.timestamp;
    if (timeSinceLastAnalysis < ANALYSIS_COOLDOWN) {
      const remainingTime = Math.ceil(
        (ANALYSIS_COOLDOWN - timeSinceLastAnalysis) / 1000
      );
      showWarning(
        `Thanks for waiting ${remainingTime} seconds! You're a legend for being patient, and it helps us keep CV optimisations free! 🫶🚀`
      );
      return true;
    }

    return false;
  };

  const handleOptimise = async () => {
    if (!isAuthenticated) {
      Analytics.event("cv_optimization", "auth_required");
      router.push("/signin");
      return;
    }

    if (!validateInput()) {
      Analytics.event("cv_optimization", "validation_error");
      return;
    }

    if (checkDuplicateAnalysis() || checkCooldown()) {
      Analytics.event("cv_optimization", "rate_limit");
      return;
    }

    const startTime = Date.now();

    try {
      setIsAnalyzing(true);
      Analytics.event("cv_optimization", "start_analysis");

      const analysis = await geminiService.analyzeCV(cvText, jobDescription);

      if (userData?.id && userData?.email) {
        await cvTrackingService.recordOptimisation(
          userData.id,
          cvText,
          jobDescription,
          analysis,
          {
            tokenCount: cvText.split(/\s+/).length,
            processingTime: Date.now() - startTime,
            apiVersion: "gemini-2.0-flash",
          },
          userData.email
        );

        Analytics.event(
          "cv_optimization",
          "complete",
          `Score: ${analysis.overallScore}`
        );
      }

      setScore(analysis.overallScore);
      setScoreCategories(
        analysis.categories.map((cat) => ({
          ...cat,
          icon: getIconForCategory(cat.name),
        }))
      );

      const validImprovements = analysis.improvements.filter(
        (imp) => imp.suggestions?.length > 0 || imp.optimisedContent
      );
      setImprovements(validImprovements);

      setLastAnalysis({
        cv: cvText,
        jobDesc: jobDescription,
        timestamp: Date.now(),
      });
    } catch (error) {
      logger.error("Analysis failed:", error);
      showWarning(
        "Sorry, something went wrong while analysing your CV. Please try again."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyContent = async (sectionId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopyStates((prev) => ({ ...prev, [sectionId]: true }));
      setTimeout(() => {
        setCopyStates((prev) => ({ ...prev, [sectionId]: false }));
      }, 2000);
    } catch (err) {
      logger.error("Failed to copy:", err);
    }
  };

  const getIconForCategory = (name: string) => {
    switch (name.toLowerCase()) {
      case "relevance":
        return Target;
      case "impact":
        return TrendingUp;
      case "clarity":
        return FileText;
      case "keywords":
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

  const handlePdfSelect = async (file: File) => {
    try {
      setPdfFile(file);
      setPdfError(undefined);
      setIsPdfProcessing(true);

      // Ensure user is authenticated
      if (!userData?.id) {
        setPdfError(errorMessages.authError);
        Analytics.event("cv_optimization", "pdf_upload_error", "auth_required");
        return;
      }

      try {
        // Track PDF upload start
        Analytics.event("cv_optimization", "pdf_upload_start");

        // Upload to Supabase storage
        const { path, error: uploadError } = await pdfStorageService.uploadPdf(
          file,
          userData.id
        );

        if (uploadError) {
          logger.error("PDF upload error:", uploadError);
          setPdfError(errorMessages.uploadError);
          Analytics.event(
            "cv_optimization",
            "pdf_upload_error",
            "storage_failed"
          );
          return;
        }

        try {
          // Extract text from PDF
          const extractedText = await pdfService.smartExtractTextFromPDF(file);

          if (extractedText.length < MIN_CV_LENGTH) {
            setPdfError(errorMessages.insufficientText);
            Analytics.event(
              "cv_optimization",
              "pdf_extraction_error",
              "insufficient_text"
            );
          } else {
            setCvText(extractedText);
            Analytics.event("cv_optimization", "pdf_extraction_success");
          }
        } catch (extractError) {
          logger.error("PDF extraction error:", extractError);
          setPdfError(errorMessages.processingError);
          Analytics.event(
            "cv_optimization",
            "pdf_extraction_error",
            "extraction_failed"
          );
        }
      } catch (uploadError) {
        logger.error("PDF upload error:", uploadError);
        setPdfError(errorMessages.uploadError);
        Analytics.event("cv_optimization", "pdf_upload_error", "upload_failed");
      }
    } catch (error) {
      logger.error("PDF processing error:", error);
      setPdfError(errorMessages.processingError);
      Analytics.event(
        "cv_optimization",
        "pdf_processing_error",
        "unknown_error"
      );
    } finally {
      setIsPdfProcessing(false);
    }
  };

  const handlePdfRemove = () => {
    setPdfFile(null);
    setPdfError(undefined);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            Let our AI analyse and enhance your CV for better apprenticeship
            opportunities
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[350px,1fr] gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-orange-500/20">
              <FileUpload
                onFileSelect={handlePdfSelect}
                onFileRemove={handlePdfRemove}
                selectedFile={pdfFile}
                isProcessing={isPdfProcessing}
                error={pdfError}
                onError={showWarning}
              />
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-orange-500/20">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="w-4 h-4 text-orange-500" />
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Job Description
                </label>
              </div>
              <div className="flex items-center space-x-2 mb-4">
                <button
                  onClick={() => setIsManualMode(false)}
                  className={`px-4 py-2 text-sm font-medium ${
                    isManualMode
                      ? "text-gray-500 dark:text-gray-400"
                      : "text-orange-500 dark:text-orange-400"
                  }`}
                >
                  Select Apprenticeship
                </button>
                <button
                  onClick={() => setIsManualMode(true)}
                  className={`px-4 py-2 text-sm font-medium ${
                    isManualMode
                      ? "text-orange-500 dark:text-orange-400"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  Enter Manually
                </button>
              </div>
              {!isManualMode ? (
                <div className="flex flex-col space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                      placeholder="Search for apprenticeships..."
                    />
                  </div>

                  <div
                    className="overflow-y-auto space-y-2 custom-scrollbar"
                    style={{
                      maxHeight: `${VISIBLE_ITEMS * 84}px`, // Fixed height for 3 items (each item is approximately 84px high)
                      position: "relative",
                    }}
                  >
                    {apprenticeships.map((apprenticeship) => (
                      <button
                        key={apprenticeship.id}
                        onClick={() =>
                          setSelectedApprenticeship(apprenticeship)
                        }
                        className={`w-full p-4 rounded-lg border ${
                          selectedApprenticeship?.id === apprenticeship.id
                            ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                            : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                        } hover:border-orange-500 transition-colors duration-200 text-left group`}
                      >
                        <div className="flex flex-col space-y-1">
                          <span className="font-medium text-gray-900 dark:text-white group-hover:text-orange-500">
                            {apprenticeship.title}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {apprenticeship.employerName}
                          </span>
                        </div>
                      </button>
                    ))}

                    {/* Loading indicator and scroll sentinel */}
                    <div ref={listRef} className="h-4">
                      {isLoadingApprenticeships && (
                        <div className="flex items-center justify-center py-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                        </div>
                      )}
                    </div>
                  </div>

                  {apprenticeships.length === 0 &&
                    !isLoadingApprenticeships && (
                      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                        No apprenticeships found
                      </div>
                    )}
                </div>
              ) : (
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full h-32 p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-sm"
                  placeholder="Paste the job description here..."
                />
              )}
            </div>

            <button
              onClick={handleOptimise}
              disabled={isAnalyzing}
              className="w-full py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>
                {isAnalyzing ? "AI is Analysing..." : "Optimise with AI"}
              </span>
            </button>
          </motion.div>

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
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-orange-500/20">
                  <div className="text-center mb-8" aria-label={`CV score`}>
                    <motion.div
                      className="relative w-48 h-48 mx-auto"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", duration: 1.5 }}
                    >
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <defs>
                          <linearGradient
                            id="scoreGradient"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="0%"
                          >
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
                          <div className="text-sm text-orange-500 font-medium">
                            Overall Score
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  </div>

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
                              transition={{
                                duration: 1,
                                delay: 0.5 + index * 0.1,
                              }}
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

                        {improvement.optimisedContent && (
                          <div className="mt-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                                Optimised {improvement.section}
                              </h5>
                              <button
                                onClick={() =>
                                  handleCopyContent(
                                    improvement.section,
                                    improvement.optimisedContent!
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

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="max-w-3xl mx-auto px-6 py-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-sm text-gray-600 dark:text-gray-400">
            <p className="mb-2">
              Our AI-powered CV optimisation is designed to provide valuable
              insights, but results may vary. We're always working to improve—if
              you spot anything that seems off, let us know at{" "}
              <a
                href="mailto:feedback@apprenticewatch.com"
                className="text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-500"
              >
                feedback@apprenticewatch.com
              </a>
              .
            </p>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {warning.show && (
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
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    {warning.message}
                  </p>
                </div>
                <button
                  onClick={() => setWarning({ show: false, message: "" })}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setWarning({ show: false, message: "" })}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
