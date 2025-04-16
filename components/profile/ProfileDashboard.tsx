'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  User, Edit2, Settings, Award, BookOpen, Bell, Clock, ExternalLink,
  Check, X, Save, ChevronRight, ToggleLeft, ToggleRight, Upload,
  MapPin, Calendar, Briefcase, Building, GraduationCap, Plus, Trash2, FileText,
  Loader, Search, AlertCircle, Star,
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
  vacancy_title: string;
  vacancy_company: string;
  logo?: string;
  location: string;
  status: ApprenticeshipStatus;
  date: string;
  vacancy_id?: string; // Reference to the original apprenticeship if from the platform
  notes?: string;
  applied_to: string;
  started_at: string;
  updated_at: string;
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
    slug: '/resources/ace-your-apprenticeship-interview',
    description: 'Learn how to effectively research companies to find the best apprenticeship opportunities.'
  },
  {
    id: 'art-2',
    title: 'Learn How to Write a CV That Gets You Hired',
    category: 'CV GUIDE',
    image: 'https://cdn.apprenticewatch.com/resources/articles/cv-guide.png',
    readTime: '10 min',
    date: '15 March 2025',
    slug: '/resources/cv-guide',
    description: 'Discover tips and tricks to craft a CV that stands out to employers.'
  },
  {
    id: 'art-3',
    title: 'How to Apply for Work Experience: Complete Student Guide 2025',
    category: 'Career Development',
    image: 'https://cdn.apprenticewatch.com/resources/articles/work-experience.png',
    readTime: '5 min',
    date: '10 March 2025',
    slug: '/resources/online-assessments',
    description: 'A comprehensive guide to applying for work experience as a student.'
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

  // New state for manual entry
  const [showManualEntryForm, setShowManualEntryForm] = useState(false);
  const [manualEntryData, setManualEntryData] = useState({
    title: '',
    company: '',
    location: '',
    notes: ''
  });

  // New state for direct search
  const [directSearchQuery, setDirectSearchQuery] = useState('');
  const [isDirectSearching, setIsDirectSearching] = useState(false);

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

  // Reset form when modal closes
  useEffect(() => {
    if (!showAddModal) {
      setShowManualEntryForm(false);
      setManualEntryData({
        title: '',
        company: '',
        location: '',
        notes: ''
      });
      setDirectSearchQuery('');
    }
  }, [showAddModal]);

  // Show notification helper
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ show: true, message, type });
  };

  const handleAddProgress = async (vacancyId: string, title: string, company: string, location: string, notes: string) => {
    try {
      const created = await apprenticeshipProgressService.addProgress(userId, {
        vacancy_id: vacancyId,
        vacancy_title: title,
        vacancy_company: company,
        location,
        applied_to: new Date().toISOString(),
        status: 'Applied',
        notes,
      });
      if (created) {
        setApprenticeships((prev) => [created, ...prev]);
        setActiveApprenticeship(created.id);
        setShowAddModal(false);
        showNotification('Apprenticeship added successfully!', 'success');
      }
    } catch (error) {
      showNotification('Failed to add apprenticeship', 'error');
    }
  };

  const handleUpdateProgress = async (id: string, updates: Partial<{ status: string; notes: string }>) => {
    try {
      await apprenticeshipProgressService.updateProgress(id, updates);
      setApprenticeships((prev) =>
        prev.map((app) =>
          app.id === id
            ? {
                ...app,
                ...updates,
                status: updates.status as ApprenticeshipStatus,
                updated_at: new Date().toISOString(),
              }
            : app
        )
      );
      showNotification('Apprenticeship updated successfully!', 'success');
    } catch (error) {
      showNotification('Failed to update apprenticeship', 'error');
    }
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
      app => (app.vacancy_id && app.vacancy_id === (apprenticeship.slug || apprenticeship.id)) ||
        (app.vacancy_title === apprenticeship.title && app.vacancy_company === apprenticeship.employerName)
    );
  };

  const addFromSearch = async (apprenticeship: ListingType) => {
    if (isApprenticeshipTracked(apprenticeship)) {
      showNotification('This apprenticeship is already in your tracker', 'info');
      return;
    }
    const newApp = {
      vacancy_id: apprenticeship.slug || apprenticeship.id,
      vacancy_title: apprenticeship.title,
      vacancy_company: apprenticeship.employerName,
      location: apprenticeship.address?.addressLine3 || 'Unknown location',
      applied_to: new Date().toISOString(),
      status: 'Applied',
      notes: '',
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
      vacancy_id: apprenticeship.slug || apprenticeship.id,
      vacancy_title: apprenticeship.title,
      vacancy_company: apprenticeship.employerName,
      location: apprenticeship.address?.addressLine3 || 'Unknown location',
      applied_to: new Date().toISOString(),
      status: 'Applied',
      notes: '',
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
      await apprenticeshipProgressService.deleteProgress(activeApprenticeship); // Delete from database
      const updatedApps = apprenticeships.filter(app => app.id !== activeApprenticeship);
      setApprenticeships(updatedApps); // Update state
      setShowDeleteConfirm(false);
      if (updatedApps.length > 0) {
        setActiveApprenticeship(updatedApps[0].id);
      } else {
        setActiveApprenticeship(null);
      }
      if (appToDelete) {
        showNotification(`Removed ${appToDelete.vacancy_title} from your tracker`, 'info');
      }
      Analytics.event('apprenticeship_tracker', 'delete_apprenticeship');
    } catch (error) {
      showNotification('Failed to remove apprenticeship', 'error');
    }
  };

  // New function to handle direct search
  const handleDirectSearch = async () => {
    if (!directSearchQuery.trim()) {
      setModalVacancies([]);
      setModalTotal(0);
      return;
    }

    setIsDirectSearching(true);
    setModalLoading(true);

    try {
      const { vacancies, total } = await vacancyService.getVacancies({
        page: 1,
        pageSize: 10,
        filters: { search: directSearchQuery }
      });

      setModalVacancies(vacancies || []);
      setModalTotal(total || 0);
      Analytics.event('apprenticeship_tracker', 'direct_search', directSearchQuery);
    } catch (error) {
      console.error('Error searching apprenticeships:', error);
      setModalVacancies([]);
      setModalTotal(0);
      showNotification('Failed to search apprenticeships', 'error');
    } finally {
      setIsDirectSearching(false);
      setModalLoading(false);
    }
  };

  // New function to handle manual entry submission
  const handleManualEntrySubmit = async () => {
    if (!manualEntryData.title || !manualEntryData.company) {
      showNotification('Title and company are required', 'error');
      return;
    }

    try {
      const created = await apprenticeshipProgressService.addProgress(userId, {
        vacancy_id: `manual-${Date.now()}`, // Add a generated vacancy_id for manual entries
        vacancy_title: manualEntryData.title,
        vacancy_company: manualEntryData.company,
        location: manualEntryData.location || 'Not specified',
        applied_to: new Date().toISOString(),
        status: 'Applied',
        notes: manualEntryData.notes,
      });

      if (created) {
        setApprenticeships(prev => [created, ...prev]);
        setActiveApprenticeship(created.id);
        setShowAddModal(false);
        setShowManualEntryForm(false);
        setManualEntryData({
          title: '',
          company: '',
          location: '',
          notes: ''
        });
        showNotification('Apprenticeship added successfully!', 'success');
        Analytics.event('apprenticeship_tracker', 'add_manual_entry');
      }
    } catch (error) {
      showNotification('Failed to add apprenticeship', 'error');
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
                    <img
                      src={app.logo || '/assets/logos/default.svg'}
                      alt={app.vacancy_company || 'Company Logo'}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.style.display = 'none';
                        const fallback = target.parentElement!.appendChild(document.createElement('div'));
                        fallback.className = "w-full h-full flex items-center justify-center bg-orange-500 text-white font-bold text-xs";
                        fallback.textContent = app.vacancy_company
                          ? app.vacancy_company.charAt(0).toUpperCase()
                          : '-';
                      }}
                    />
                  </div>
                  <span className="font-medium text-sm">{app.vacancy_title || 'Untitled Apprenticeship'}</span>
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
                          {app.vacancy_title || 'Untitled Apprenticeship'}
                        </h3>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center truncate">
                            <Building className="w-4 h-4 mr-1.5 flex-shrink-0" />
                            <span className="truncate">{app.vacancy_company || 'Unknown Company'}</span>
                          </div>
                          <div className="flex items-center truncate">
                            <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0" />
                            <span className="truncate">{app.location || 'Unknown Location'}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1.5 flex-shrink-0" />
                            <span>Applied To: {new Date(app.applied_to).toLocaleDateString('en-GB')}</span>
                          </div>
                          <div className="flex items-center">
                            <span>Notes: {app.notes || 'No notes added'}</span>
                          </div>
                          <div className="flex items-center">
                            <span>Started: {new Date(app.started_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center">
                            <span>Last Updated: {new Date(app.updated_at).toLocaleDateString()}</span>
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

            {showDeleteConfirm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg max-w-sm w-full">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Confirm Deletion</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Are you sure you want to delete this apprenticeship? This action cannot be undone.
                  </p>
                  <div className="flex justify-end gap-4">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteApprenticeship}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
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

        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add Apprenticeship</h3>

              {!showManualEntryForm ? (
                <>
                  {/* Direct search input */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="Search for an apprenticeship..."
                          value={directSearchQuery}
                          onChange={(e) => setDirectSearchQuery(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleDirectSearch()}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                        />
                        {isDirectSearching && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <Loader className="w-4 h-4 animate-spin text-orange-500" />
                          </div>
                        )}
                      </div>
                      <button
                        onClick={handleDirectSearch}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors flex items-center"
                      >
                        <Search className="w-4 h-4 mr-1" />
                        Search
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-1">
                      Enter the exact name of the apprenticeship you're looking for
                    </p>
                  </div>

                  {/* Search results */}
                  <div className="overflow-y-auto flex-1 custom-scrollbar mb-4">
                    {modalLoading ? (
                      <div className="text-center py-6">
                        <Loader className="w-6 h-6 animate-spin text-orange-500 mx-auto" />
                        <p className="text-gray-600 dark:text-gray-400 mt-2">Searching apprenticeships...</p>
                      </div>
                    ) : directSearchQuery && modalVacancies.length > 0 ? (
                      <div>
                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Search Results</h4>
                        {modalVacancies.map((vacancy) => (
                          <div
                            key={vacancy.id}
                            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/30 mb-4 flex items-start justify-between"
                          >
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                {vacancy.title}
                              </h4>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {vacancy.employerName} • {vacancy.address?.addressLine3 || 'N/A'}
                              </p>
                            </div>
                            <button
                              onClick={() => addFromSearch(vacancy)}
                              disabled={isApprenticeshipTracked(vacancy)}
                              className={`ml-4 p-2 rounded-lg transition-colors ${
                                isApprenticeshipTracked(vacancy)
                                  ? 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                  : 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/30'
                              }`}
                              title={isApprenticeshipTracked(vacancy) ? 'Already in tracker' : 'Add to tracker'}
                            >
                              <Plus className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : directSearchQuery ? (
                      <div className="text-center py-8 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                        <AlertCircle className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                        <p className="text-gray-700 dark:text-gray-300 font-medium">No apprenticeships found</p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 max-w-md mx-auto">
                          We couldn't find any apprenticeships matching "{directSearchQuery}"
                        </p>
                        <button
                          onClick={() => setShowManualEntryForm(true)}
                          className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
                        >
                          Add Manually
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-8 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                        <Search className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 dark:text-gray-400">
                          Search for an apprenticeship by name
                        </p>
                      </div>
                    )}
                  </div>

                  {/* "Not finding what you're looking for" section - only show when search has results */}
                  {!modalLoading && directSearchQuery && modalVacancies.length > 0 && (
                    <div className="mt-2 mb-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-gray-700 dark:text-gray-300 text-center font-medium">
                        Not finding what you're looking for?
                      </p>
                      <button
                        onClick={() => setShowManualEntryForm(true)}
                        className="mt-2 w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Manually
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Manual entry form */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Enter Apprenticeship Details
                    </h4>

                    <div className="space-y-4">
                      <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Apprenticeship Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="title"
                          type="text"
                          value={manualEntryData.title}
                          onChange={(e) => setManualEntryData({...manualEntryData, title: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                          placeholder="e.g. Software Development Apprenticeship"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Company <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="company"
                          type="text"
                          value={manualEntryData.company}
                          onChange={(e) => setManualEntryData({...manualEntryData, company: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                          placeholder="e.g. Tech Solutions Ltd"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Location
                        </label>
                        <input
                          id="location"
                          type="text"
                          value={manualEntryData.location}
                          onChange={(e) => setManualEntryData({...manualEntryData, location: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                          placeholder="e.g. London"
                        />
                      </div>

                      <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Notes
                        </label>
                        <textarea
                          id="notes"
                          rows={3}
                          value={manualEntryData.notes}
                          onChange={(e) => setManualEntryData({...manualEntryData, notes: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white resize-none"
                          placeholder="Any additional information about this apprenticeship"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Footer buttons */}
              <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    if (showManualEntryForm) {
                      setShowManualEntryForm(false);
                    } else {
                      setShowAddModal(false);
                    }
                  }}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  {showManualEntryForm ? 'Back to Search' : 'Cancel'}
                </button>

                {showManualEntryForm && (
                  <button
                    onClick={handleManualEntrySubmit}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
                  >
                    <Save className="w-4 h-4 mr-2 inline-block" />
                    Save Apprenticeship
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
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

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Link
            href="/optimise-cv/history"
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors shadow-md hover:shadow-lg flex items-center justify-center whitespace-nowrap w-full md:w-auto"
          >
            <FileText className="w-5 h-5 mr-2" />
            View Past Optimisations
          </Link>
          <Link
            href="/optimise-cv"
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg flex items-center justify-center whitespace-nowrap w-full md:w-auto"
          >
            <Upload className="w-5 h-5 mr-2" />
            Optimise CV
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

// Article card component to display recommended resources
const ArticleCard = ({ article }: { article: any }) => (
  <Link key={article.id} href={article.slug} className="group">
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg overflow-hidden transition-all duration-300 border border-gray-100 dark:border-gray-700">
      {article.image && (
        <div className="relative h-48 w-full">
          <img
            src={article.image}
            alt={article.title}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
          />
          {article.featured && (
            <div className="absolute top-3 right-3 bg-orange-500 text-white rounded-full p-1.5 shadow-md">
              <Star className="w-4 h-4" />
            </div>
          )}
        </div>
      )}
      <div className="p-6">
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="inline-block px-3 py-1 text-sm font-medium text-orange-700 bg-orange-50 dark:bg-orange-900/30 dark:text-orange-300 rounded-full">
            {article.category}
          </span>
          <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded-full">
            <Clock className="w-3.5 h-3.5 mr-1" />
            {article.readTime || "5 min read"}
          </span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-orange-500 transition-colors line-clamp-2">
          {article.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
          {article.description || `Gain insights and tips about ${article.category.toLowerCase()} to enhance your apprenticeship journey.`}
        </p>
        <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {article.date}
          </span>
          <span className="inline-flex items-center text-orange-500 font-medium group-hover:translate-x-1 transition-transform">
            Read more
            <ChevronRight className="w-4 h-4 ml-1" />
          </span>
        </div>
      </div>
    </div>
  </Link>
);

// Section for recommended articles
const RecommendedArticlesSection = () => {
  // Map and enhance the existing recommendedArticles with additional properties
  const articlesWithFeatures = recommendedArticles.map((article, index) => ({
    ...article,
    featured: index === 0, // Make the first article featured
    description: article.description || `Discover valuable insights and practical advice about ${article.category.toLowerCase()} to boost your apprenticeship journey.`
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="mb-10"
    >
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white uppercase mb-4">
        RECOMMENDED RESOURCES
      </h2>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
              Curated Content for Your Journey
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Explore resources to help you succeed in your apprenticeship path.
            </p>
          </div>
          <Link
            href="/resources"
            className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg flex items-center justify-center flex-shrink-0"
          >
            View All Resources
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articlesWithFeatures.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export const ProfileDashboard: React.FC<ProfileDashboardProps> = ({ userData }) => {
  const [cvOptimizations, setCvOptimizations] = useState<CVOptimization[]>([]);
  const [isLoadingOptimizations, setIsLoadingOptimizations] = useState(true);
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
          setLatestCvScore(sortedOptimizations[0]?.overall_score ?? 0);
        } else {
          setCvOptimizations([]);
          setLatestCvScore(0);
        }
      } catch (error) {
        logger.error('Failed to fetch CV optimizations history:', error);
        setCvOptimizations([]);
        setLatestCvScore(0);
      } finally {
        setIsLoadingOptimizations(false);
      }
    };

    fetchCvOptimizations();
  }, [userData?.id]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="mb-10">
        <GreetingSection name={userData.name} />
      </div>

      <CVOptimizerSection score={latestCvScore} />

      <ApprenticeshipTrackerSection userId={userData.id} />

      <RecommendedArticlesSection />
    </div>
  );
};