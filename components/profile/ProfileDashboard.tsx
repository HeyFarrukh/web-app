'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  User, Edit2, Settings, Award, BookOpen, Bell, Clock, ExternalLink,
  Check, X, Save, ChevronRight, ToggleLeft, ToggleRight, Upload,
  MapPin, Calendar, Briefcase, Building, GraduationCap, Plus, Trash2, FileText,
  Loader, Search, AlertCircle
} from 'lucide-react';
import { SupabaseUserProfile } from '@/types/auth';
import { Analytics } from '@/services/analytics/analytics';
import { cvTrackingService } from '@/services/cv/cvTrackingService';
import { createLogger } from '@/services/logger/logger';
import { ListingType } from '@/types/listing';
import { vacancyService } from '@/services/supabase/vacancyService';
import { savedApprenticeshipService } from '@/services/supabase/savedApprenticeshipService';
import { ListingsFilter } from "@/components/listings/ListingsFilter";
import { apprenticeshipProgressService } from '@/services/supabase/apprenticeshipProgressService';

const logger = createLogger({ module: 'ProfileDashboard' });

// Interface for CV optimization record from database
interface CVOptimization {
  id: string;
  user_id: string;
  overall_score: number;
  created_at: string;
  job_description: string;
  cv_optimisation_improvements?: any[];
}

// Define the props interface for the ProfileDashboard component
interface ProfileDashboardProps {
  userData: SupabaseUserProfile;
}

// Interface for tracked apprenticeship
export interface TrackedApprenticeship {
  id: string;
  title: string;
  company: string;
  logo?: string;
  location: string;
  status: ApprenticeshipStatus;
  date: string;
  vacancyId?: string; // Reference to the original apprenticeship if from the platform
}

// Interface for notification state
interface NotificationState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
}

type ApprenticeshipStatus = 'Applied' | 'Online Assessment' | 'Interview' | 'Assessment Centre' | 'Offer' | 'Rejection';

const statusSteps: ApprenticeshipStatus[] = [
  'Applied',
  'Online Assessment',
  'Interview',
  'Assessment Centre',
  'Rejection',
  'Offer'
];

// Sample article recommendations
const recommendedArticles = [
  {
    id: 'art-1',
    title: 'How to Research Companies for Apprenticeships',
    category: 'Apprenticeship Preparation',
    image: 'https://cdn.apprenticewatch.com/resources/articles/research-companies.png',
    readTime: '7 min',
    date: '20 March 2025',
    slug: '/resources/ace-your-apprenticeship-interview'
  },
  {
    id: 'art-2',
    title: 'Learn How to Write a CV That Gets You Hired',
    category: 'CV GUIDE',
    image: 'https://cdn.apprenticewatch.com/resources/articles/cv-guide.png',
    readTime: '10 min',
    date: '15 March 2025',
    slug: '/resources/cv-guide'
  },
  {
    id: 'art-3',
    title: 'How to Apply for Work Experience: Complete Student Guide 2025',
    category: 'Career Development',
    image: 'https://cdn.apprenticewatch.com/resources/articles/work-experience.png',
    readTime: '5 min',
    date: '10 March 2025',
    slug: '/resources/online-assessments'
  }
];

// Component for the greeting section with user's name
const GreetingSection: React.FC<{ name: string | null }> = ({ name }) => {
  const [greeting, setGreeting] = useState<string>('');

  useEffect(() => {
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return 'Morning';
      if (hour < 18) return 'Afternoon';
      return 'Evening';
    };

    setGreeting(getGreeting());
  }, []);

  // Extract first name only
  const firstName = name ? name.split(' ')[0] : 'Apprentice';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-10 text-left"
    >
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
        {greeting}, <span className="font-playfair italic text-orange-500">{firstName}</span>
      </h1>
      <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">
        Track your CV optimisations, apprenticeship progress and more.
      </p>
    </motion.div>
  );
};

// Component for the apprenticeship progress timeline
const ApprenticeshipTrackerSection: React.FC<{ userId: string }> = ({ userId }) => {
  const [apprenticeships, setApprenticeships] = useState<TrackedApprenticeship[]>([]);
  const [activeApprenticeship, setActiveApprenticeship] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ListingType[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [savedApprenticeships, setSavedApprenticeships] = useState<ListingType[]>([]);
  const [isLoadingSaved, setIsLoadingSaved] = useState(true);
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    message: '',
    type: 'info'
  });

  const [modalFilters, setModalFilters] = useState({
    search: "",
    location: "",
    level: "",
    category: "",
  });
  const [modalVacancies, setModalVacancies] = useState<ListingType[]>([]);
  const [modalTotal, setModalTotal] = useState(0);
  const [modalPage, setModalPage] = useState(1);
  const [modalLoading, setModalLoading] = useState(false);
  const MODAL_ITEMS_PER_PAGE = 5;

  // Fetch tracked apprenticeships from Supabase
  useEffect(() => {
    if (!userId) return;
    const fetchProgress = async () => {
      try {
        const data = await apprenticeshipProgressService.getUserProgress(userId);
        setApprenticeships(data);
        if (data.length > 0) {
          setActiveApprenticeship(data[0].id);
        } else {
          setActiveApprenticeship(null);
        }
      } catch (error) {
        console.error('Error loading tracked apprenticeships from Supabase:', error);
      }
    };
    fetchProgress();
  }, [userId]);

  // Fetch saved apprenticeships from the database
  useEffect(() => {
    const fetchSavedApprenticeships = async () => {
      try {
        setIsLoadingSaved(true);
        const listings = await savedApprenticeshipService.getSavedApprenticeships(userId);
        setSavedApprenticeships(listings);
      } catch (error) {
        console.error('Error fetching saved apprenticeships:', error);
      } finally {
        setIsLoadingSaved(false);
      }
    };

    if (userId) {
      fetchSavedApprenticeships();
    }
  }, [userId]);

  // Fetch vacancies for modal when filters/page change
  useEffect(() => {
    if (!showAddModal) return;
    setModalLoading(true);
    vacancyService
      .getVacancies({
        page: modalPage,
        pageSize: MODAL_ITEMS_PER_PAGE,
        filters: modalFilters,
      })
      .then((result) => {
        setModalVacancies(result.vacancies || []);
        setModalTotal(result.total || 0);
      })
      .catch(() => {
        setModalVacancies([]);
        setModalTotal(0);
      })
      .finally(() => setModalLoading(false));
  }, [modalFilters, modalPage, showAddModal]);

  // Hide notification after timeout
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (notification.show) {
      timeout = setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, 5000);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [notification.show]);

  // Show notification helper
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ show: true, message, type });
  };

  const handleStatusUpdate = async (apprenticeshipId: string, newStatus: ApprenticeshipStatus) => {
    const app = apprenticeships.find(a => a.id === apprenticeshipId);
    if (!app) return;
    try {
      await apprenticeshipProgressService.updateProgress(apprenticeshipId, { status: newStatus });
      setApprenticeships(prev => prev.map(a => a.id === apprenticeshipId ? { ...a, status: newStatus } : a));
      Analytics.event('apprenticeship_tracker', 'update_status', newStatus);
    } catch (error) {
      showNotification('Failed to update status', 'error');
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const { vacancies } = await vacancyService.getVacancies({
        page: 1, pageSize: 5, filters: { search: query }
      });
      setSearchResults(vacancies && Array.isArray(vacancies) ? vacancies : []);
      Analytics.event('apprenticeship_tracker', 'search_apprenticeships', query);
    } catch (error) {
      console.error('Error searching apprenticeships:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const isApprenticeshipTracked = (apprenticeship: ListingType) => {
    return apprenticeships.some(
      app => (app.vacancyId && app.vacancyId === (apprenticeship.slug || apprenticeship.id)) ||
        (app.title === apprenticeship.title && app.company === apprenticeship.employerName)
    );
  };

  const addFromSearch = async (apprenticeship: ListingType) => {
    if (isApprenticeshipTracked(apprenticeship)) {
      showNotification('This apprenticeship is already in your tracker', 'info');
      return;
    }
    const newApp = {
      title: apprenticeship.title,
      company: apprenticeship.employerName,
      logo: apprenticeship.logo || `/assets/logos/default.svg`,
      location: apprenticeship.address?.addressLine3 || 'Unknown location',
      status: 'Applied' as ApprenticeshipStatus,
      date: new Date().toISOString().split('T')[0],
      vacancyId: apprenticeship.slug || apprenticeship.id,
    };
    try {
      const created = await apprenticeshipProgressService.addProgress(userId, newApp);
      if (created) {
        setApprenticeships(prev => [created, ...prev]);
        setActiveApprenticeship(created.id);
        setShowAddModal(false);
        showNotification(`Added ${apprenticeship.title} to your tracker!`, 'success');
        Analytics.event('apprenticeship_tracker', 'add_from_search', apprenticeship.title);
      }
    } catch (error) {
      showNotification('Failed to add apprenticeship', 'error');
    }
  };

  const addFromSaved = async (apprenticeship: ListingType) => {
    if (isApprenticeshipTracked(apprenticeship)) {
      showNotification('This apprenticeship is already in your tracker', 'info');
      return;
    }
    const newApp = {
      title: apprenticeship.title,
      company: apprenticeship.employerName,
      logo: apprenticeship.logo || `/assets/logos/default.svg`,
      location: apprenticeship.address?.addressLine3 || 'Unknown location',
      status: 'Applied' as ApprenticeshipStatus,
      date: new Date().toISOString().split('T')[0],
      vacancyId: apprenticeship.slug || apprenticeship.id,
    };
    try {
      const created = await apprenticeshipProgressService.addProgress(userId, newApp);
      if (created) {
        setApprenticeships(prev => [created, ...prev]);
        setActiveApprenticeship(created.id);
        showNotification(`Added ${apprenticeship.title} to your tracker!`, 'success');
        Analytics.event('apprenticeship_tracker', 'add_from_saved', apprenticeship.title);
      }
    } catch (error) {
      showNotification('Failed to add apprenticeship', 'error');
    }
  };

  const handleDeleteApprenticeship = async () => {
    if (!activeApprenticeship) return;
    const appToDelete = apprenticeships.find(app => app.id === activeApprenticeship);
    try {
      await apprenticeshipProgressService.deleteProgress(activeApprenticeship);
      const updatedApps = apprenticeships.filter(app => app.id !== activeApprenticeship);
      setApprenticeships(updatedApps);
      setShowDeleteConfirm(false);
      if (updatedApps.length > 0) {
        setActiveApprenticeship(updatedApps[0].id);
      } else {
        setActiveApprenticeship(null);
      }
      if (appToDelete) {
        showNotification(`Removed ${appToDelete.title} from your tracker`, 'info');
      }
      Analytics.event('apprenticeship_tracker', 'delete_apprenticeship');
    } catch (error) {
      showNotification('Failed to remove apprenticeship', 'error');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="mb-10"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white uppercase">
          YOUR APPRENTICESHIP PROGRESS
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-lg flex items-center space-x-2 text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Apprenticeship</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-4">
        {apprenticeships.length === 0 && !isLoadingSaved ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-orange-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-orange-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Apprenticeships Added
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
              Add your first apprenticeship to track your progress!
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg flex items-center justify-center mx-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Apprenticeship to Tracker
            </button>
          </div>
        ) : apprenticeships.length > 0 ? (
          <>
            <div className="mb-6 flex flex-wrap gap-3">
              {apprenticeships.map((app) => (
                <button
                  key={app.id}
                  onClick={() => setActiveApprenticeship(app.id)}
                  className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                    activeApprenticeship === app.id
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-orange-900/20'
                  }`}
                >
                  <div className="w-6 h-6 bg-white rounded-full flex-shrink-0 overflow-hidden">
                    <img src={app.logo || '/assets/logos/default.svg'} alt={app.company} className="w-full h-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.style.display = 'none';
                        const fallback = target.parentElement!.appendChild(document.createElement('div'));
                        fallback.className = "w-full h-full flex items-center justify-center bg-orange-500 text-white font-bold text-xs";
                        fallback.textContent = app.company ? app.company.charAt(0).toUpperCase() : '?';
                      }}
                    />
                  </div>
                  <span className="font-medium text-sm">{app.title}</span>
                </button>
              ))}
            </div>

            {activeApprenticeship && (
              <div className="mb-6 border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/30">
                {apprenticeships
                  .filter(app => app.id === activeApprenticeship)
                  .map(app => (
                    <div key={app.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-grow min-w-0">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 truncate">
                          {app.title}
                        </h3>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center truncate">
                            <Building className="w-4 h-4 mr-1.5 flex-shrink-0" />
                            <span className="truncate">{app.company}</span>
                          </div>
                          <div className="flex items-center truncate">
                            <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0" />
                            <span className="truncate">{app.location}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1.5 flex-shrink-0" />
                            <span>Applied: {new Date(app.date).toLocaleDateString('en-GB')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-end flex-shrink-0 gap-2 md:gap-4">
                        <div className="text-right md:text-left">
                          <span className="block text-xs text-gray-500 dark:text-gray-400">Current Stage</span>
                          <span className="font-semibold text-orange-500">{app.status}</span>
                        </div>
                        <button
                          onClick={() => setShowDeleteConfirm(true)}
                          className="p-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
                          title="Delete apprenticeship"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {activeApprenticeship && (
              <div className="relative pt-2 pb-4">
                <div className="flex justify-between items-center mb-3 px-1">
                  {statusSteps.map((status) => (
                    <div key={status + '-label'} className="flex-1 text-center px-1">
                      <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">
                        {status}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="relative flex justify-between items-center h-10">
                  <div className="absolute top-1/2 left-5 right-5 h-1 bg-gray-200 dark:bg-gray-700 transform -translate-y-1/2 rounded-full z-0"></div>

                  {statusSteps.map((status, index) => {
                    const activeApp = apprenticeships.find(app => app.id === activeApprenticeship);
                    const statusIndex = activeApp ? statusSteps.indexOf(activeApp.status) : -1;
                    const isActive = index === statusIndex;
                    const isCompleted = statusIndex !== -1 && index < statusIndex;
                    const isRejection = status === 'Rejection';

                    return (
                      <div key={status + '-button'} className="flex justify-center flex-1 relative z-10 px-1">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            if (activeApp) {
                              handleStatusUpdate(activeApp.id, status);
                            }
                          }}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out relative z-10 ${
                            isActive
                              ? isRejection
                                ? 'bg-red-500 shadow-lg shadow-red-500/30 scale-110 ring-2 ring-white dark:ring-gray-800'
                                : 'bg-orange-500 shadow-lg shadow-orange-500/30 scale-110 ring-2 ring-white dark:ring-gray-800'
                              : isCompleted
                              ? 'bg-green-500 shadow-md shadow-green-500/20'
                              : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                          }`}
                          title={`Set status to: ${status}`}
                        >
                          {isCompleted ? (
                            <Check className="w-5 h-5 text-white" />
                          ) : isRejection && isActive ? (
                            <X className="w-5 h-5 text-white" />
                          ) : (
                            <span className={`text-sm font-bold ${
                              isActive ? 'text-white' : isCompleted ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                            }`}>
                              {index + 1}
                            </span>
                          )}
                        </motion.button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        ) : null}

        {savedApprenticeships.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              Saved Apprenticeships
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedApprenticeships.map((app) => (
                <div
                  key={app.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/30 flex flex-col items-start"
                >
                  <h5 className="text-sm font-semibold text-gray-900 dark:text-white truncate overflow-hidden">
                    {app.title.length > 47 ? app.title.slice(0, 47) + '...' : app.title}
                  </h5>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate overflow-hidden">
                    {app.employerName} • {app.address?.addressLine3 || 'N/A'}
                  </p>
                  <button
                    onClick={() => addFromSaved(app)}
                    disabled={isApprenticeshipTracked(app)}
                    className={`mt-2 p-2 rounded-lg transition-colors ${
                      isApprenticeshipTracked(app)
                        ? 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        : 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/30'
                    }`}
                    title={isApprenticeshipTracked(app) ? 'Already in tracker' : 'Add to tracker'}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Apprenticeship Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Add Apprenticeship to Tracker
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Filters copied from listings page */}
              <div className="mb-6">
                <ListingsFilter
                  onFilterChange={(filters) => {
                    setModalFilters(filters);
                    setModalPage(1);
                  }}
                  initialFilters={modalFilters}
                />
              </div>

              {/* Vacancy list */}
              <div className="mb-6">
                {modalLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : modalVacancies.length > 0 ? (
                  <div className="space-y-2">
                    {modalVacancies.map((app) => (
                      <div
                        key={app.id}
                        className="p-3 border-b border-gray-200 dark:border-gray-600 last:border-b-0 flex justify-between items-center gap-2"
                      >
                        <div className="min-w-0 overflow-hidden">
                          <div className="font-medium text-gray-900 dark:text-white truncate overflow-hidden">
                            {app.title.length > 47 ? app.title.slice(0, 47) + "..." : app.title}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 truncate overflow-hidden">
                            {app.employerName} • {app.address?.addressLine3 || "N/A"}
                          </div>
                        </div>
                        <button
                          onClick={() => addFromSearch(app)}
                          disabled={isApprenticeshipTracked(app)}
                          className={`p-2 rounded-lg transition-colors ${
                            isApprenticeshipTracked(app)
                              ? "bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                              : "bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/30"
                          }`}
                          title={isApprenticeshipTracked(app) ? "Already in tracker" : "Add to tracker"}
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                    {/* Pagination controls */}
                    {modalTotal > MODAL_ITEMS_PER_PAGE && (
                      <div className="flex justify-center gap-2 mt-4">
                        <button
                          onClick={() => setModalPage((p) => Math.max(1, p - 1))}
                          disabled={modalPage === 1}
                          className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
                        >
                          Prev
                        </button>
                        <span className="px-2 py-1 text-sm">
                          Page {modalPage} of {Math.ceil(modalTotal / MODAL_ITEMS_PER_PAGE)}
                        </span>
                        <button
                          onClick={() => setModalPage((p) => p + 1)}
                          disabled={modalPage >= Math.ceil(modalTotal / MODAL_ITEMS_PER_PAGE)}
                          className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No apprenticeships found matching your filters.
                  </div>
                )}
              </div>

              {/* Saved apprenticeships section (unchanged) */}
              {savedApprenticeships.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    Saved Apprenticeships
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {savedApprenticeships.map((app) => (
                      <div
                        key={app.id}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/30 flex flex-col items-start"
                      >
                        <h5 className="text-sm font-semibold text-gray-900 dark:text-white truncate overflow-hidden">
                          {app.title.length > 47 ? app.title.slice(0, 47) + "..." : app.title}
                        </h5>
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate overflow-hidden">
                          {app.employerName} • {app.address?.addressLine3 || "N/A"}
                        </p>
                        <button
                          onClick={() => addFromSaved(app)}
                          disabled={isApprenticeshipTracked(app)}
                          className={`mt-2 p-2 rounded-lg transition-colors ${
                            isApprenticeshipTracked(app)
                              ? "bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                              : "bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/30"
                          }`}
                          title={isApprenticeshipTracked(app) ? "Already in tracker" : "Add to tracker"}
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Component for the CV optimizer section with score ring
interface CVOptimizerSectionProps {
  score: number;
}

const CVOptimizerSection: React.FC<CVOptimizerSectionProps> = ({ score }) => {
  const cvScore = score && score >= 0 && score <= 100 ? score : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mb-10"
    >
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white uppercase mb-4">
        YOUR LATEST CV SCORE
      </h2>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#fb923c" />
                </linearGradient>
              </defs>
              <circle
                cx="50" cy="50" r="45"
                fill="none"
                stroke="currentColor"
                className="text-gray-200 dark:text-gray-700"
                strokeWidth="10"
              />
              <motion.circle
                cx="50" cy="50" r="45"
                fill="none"
                stroke="url(#scoreGradient)"
                strokeWidth="10"
                strokeLinecap="round"
                pathLength="100"
                strokeDasharray="100"
                strokeDashoffset={100 - cvScore}
                transform="rotate(-90 50 50)"
                initial={{ strokeDashoffset: 100 }}
                animate={{ strokeDashoffset: 100 - cvScore }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
              <motion.text
                x="50"
                y="50"
                textAnchor="middle"
                dy="0.3em"
                className="text-2xl sm:text-3xl font-bold fill-gray-900 dark:fill-white"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                {cvScore}
                <tspan
                  x="50"
                  dy="1.2em"
                  className="text-sm sm:text-base font-medium fill-gray-500 dark:fill-gray-400"
                >
                  /100
                </tspan>
              </motion.text>
            </svg>
          </div>

          <div className="flex-grow">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2">
              Improve Your CV Score
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Get AI-powered recommendations to optimize your CV for specific apprenticeships.
            </p>
          </div>
        </div>

        <Link
          href="/optimise-cv"
          className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg flex items-center justify-center whitespace-nowrap w-full md:w-auto"
        >
          <Upload className="w-5 h-5 mr-2" />
          Optimise CV
        </Link>
      </div>
    </motion.div>
  );
};

export const ProfileDashboard: React.FC<ProfileDashboardProps> = ({ userData }) => {
  const [cvOptimizations, setCvOptimizations] = useState<CVOptimization[]>([]);
  const [isLoadingOptimizations, setIsLoadingOptimizations] = useState(true);
  const [visibleOptimizations, setVisibleOptimizations] = useState(3);
  const [hasMoreOptimizations, setHasMoreOptimizations] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [latestCvScore, setLatestCvScore] = useState<number>(0);

  useEffect(() => {
    const fetchCvOptimizations = async () => {
      if (!userData?.id) {
        setIsLoadingOptimizations(false);
        setLatestCvScore(0);
        return;
      };

      setIsLoadingOptimizations(true);
      try {
        const allOptimizations = await cvTrackingService.getUserOptimisations(userData.id);

        if (allOptimizations && allOptimizations.length > 0) {
          const sortedOptimizations = allOptimizations.sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          setCvOptimizations(sortedOptimizations);
          setHasMoreOptimizations(sortedOptimizations.length > visibleOptimizations);
          setLatestCvScore(sortedOptimizations[0]?.overall_score ?? 0);
        } else {
          setCvOptimizations([]);
          setHasMoreOptimizations(false);
          setLatestCvScore(0);
        }
      } catch (error) {
        logger.error('Failed to fetch CV optimizations history:', error);
        setCvOptimizations([]);
        setHasMoreOptimizations(false);
        setLatestCvScore(0);
      } finally {
        setIsLoadingOptimizations(false);
      }
    };

    fetchCvOptimizations();
  }, [userData?.id]);

  useEffect(() => {
    setHasMoreOptimizations(cvOptimizations.length > visibleOptimizations);
  }, [cvOptimizations, visibleOptimizations]);

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleOptimizations(prev => prev + 3);
      setIsLoadingMore(false);
    }, 300);
  };

  const displayedOptimizations = React.useMemo(() => {
    return cvOptimizations.slice(0, visibleOptimizations);
  }, [cvOptimizations, visibleOptimizations]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="mb-10">
        <GreetingSection name={userData.name} />
      </div>

      <CVOptimizerSection score={latestCvScore} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-10"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white uppercase mb-4">
          YOUR CV HISTORY
        </h2>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                Previous CV Optimisations
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Review your past CV optimisation scores and feedback.
              </p>
            </div>
            <Link
              href="/optimise-cv"
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg flex items-center justify-center flex-shrink-0"
            >
              <Upload className="w-4 h-4 mr-2" />
              Optimize New CV
            </Link>
          </div>

          {isLoadingOptimizations && (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading CV history...</p>
            </div>
          )}

          {!isLoadingOptimizations && cvOptimizations.length === 0 && (
            <div className="text-center py-12 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
              <div className="w-16 h-16 bg-orange-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No CV Optimisations Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                Optimize your CV with our AI tool to see your history here and improve your job prospects.
              </p>
              <Link
                href="/optimise-cv"
                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg inline-flex items-center"
              >
                <Upload className="w-4 h-4 mr-2" />
                Optimize Your CV Now
              </Link>
            </div>
          )}

          {!isLoadingOptimizations && displayedOptimizations.length > 0 && (
            <div className="space-y-4">
              {displayedOptimizations.map((cv) => (
                <div
                  key={cv.id}
                  className="p-4 md:p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors flex flex-col sm:flex-row items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 flex-grow w-full sm:w-auto">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" className="text-gray-200 dark:text-gray-700" strokeWidth="8" />
                        <motion.circle
                          cx="50" cy="50" r="45"
                          fill="none"
                          stroke={cv.overall_score >= 80 ? "#22c55e" : cv.overall_score >= 60 ? "#f97316" : "#ef4444"}
                          strokeWidth="8" strokeLinecap="round"
                          pathLength="100" strokeDasharray="100"
                          strokeDashoffset={100 - cv.overall_score}
                          transform="rotate(-90 50 50)"
                          initial={{ strokeDashoffset: 100 }}
                          animate={{ strokeDashoffset: 100 - cv.overall_score }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                        <text x="50" y="50" textAnchor="middle" dy="0.3em" className="text-2xl sm:text-3xl font-bold fill-gray-900 dark:fill-white">
                          {cv.overall_score}
                        </text>
                      </svg>
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200">
                        Optimised on:
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {new Date(cv.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                        {' at '}
                        {new Date(cv.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </div>
                      {cv.job_description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic line-clamp-1">
                          For: {cv.job_description}
                        </p>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/optimise-cv/history/${cv.id}`}
                    className="px-4 py-2 text-sm font-medium text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900/40 transition-colors flex items-center justify-center w-full sm:w-auto flex-shrink-0"
                  >
                    View Feedback
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              ))}
            </div>
          )}

          {!isLoadingOptimizations && hasMoreOptimizations && (
            <div className="text-center mt-6">
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="px-6 py-3 bg-orange-100 hover:bg-orange-200 dark:bg-orange-900/30 dark:hover:bg-orange-900/50 text-orange-600 dark:text-orange-400 font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingMore ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                    Loading...
                  </div>
                ) : (
                  'Load More History'
                )}
              </button>
            </div>
          )}
        </div>
      </motion.div>

      <ApprenticeshipTrackerSection userId={userData.id} />
    </div>
  );
};