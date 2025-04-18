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
    slug: '/resources/how-to-research-companies',
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
    slug: '/resources/how-to-apply-for-work-experience',
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
      className="mb-8 md:mb-10 text-left" // Adjusted margin
    >
      {/* Responsive Font Size */}
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
        {greeting}, <span className="font-playfair italic text-orange-500">{firstName}</span>
      </h1>
      {/* Responsive Font Size */}
      <p className="mt-2 sm:mt-3 text-base sm:text-lg text-gray-600 dark:text-gray-300">
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
          // Sort by update time descending, then created time descending
          const sortedData = data.sort((a, b) => {
              const dateA = a.updated_at ? new Date(a.updated_at) : new Date(a.started_at);
              const dateB = b.updated_at ? new Date(b.updated_at) : new Date(b.started_at);
              return dateB.getTime() - dateA.getTime();
          });
          setActiveApprenticeship(sortedData[0].id);
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
    if (!showAddModal || showManualEntryForm) return; // Don't fetch if manual form is open

    setModalLoading(true);
    setIsDirectSearching(true); // Use same loading state for consistency

    const filtersToUse = directSearchQuery ? { search: directSearchQuery } : modalFilters;
    const pageToUse = directSearchQuery ? 1 : modalPage; // Reset page for direct search
    const pageSizeToUse = directSearchQuery ? 10 : MODAL_ITEMS_PER_PAGE; // Show more results for direct search


    vacancyService
      .getVacancies({
        page: pageToUse,
        pageSize: pageSizeToUse,
        filters: filtersToUse,
      })
      .then((result) => {
        setModalVacancies(result.vacancies || []);
        setModalTotal(result.total || 0);
      })
      .catch(() => {
        setModalVacancies([]);
        setModalTotal(0);
      })
      .finally(() => {
          setModalLoading(false);
          setIsDirectSearching(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalFilters, modalPage, showAddModal, directSearchQuery, showManualEntryForm]); // Added dependencies

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
      setModalVacancies([]); // Clear modal vacancies when closing
      setModalTotal(0);
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
        setApprenticeships((prev) => [created, ...prev].sort((a, b) => new Date(b.updated_at || b.started_at).getTime() - new Date(a.updated_at || a.started_at).getTime()));
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
        ).sort((a, b) => new Date(b.updated_at || b.started_at).getTime() - new Date(a.updated_at || a.started_at).getTime()) // Re-sort after update
      );
    } catch (error) {
      showNotification('Failed to update apprenticeship', 'error');
    }
  };

  const handleStatusUpdate = async (apprenticeshipId: string, newStatus: ApprenticeshipStatus) => {
    const app = apprenticeships.find(a => a.id === apprenticeshipId);
    if (!app) return;
    try {
      // Use the update function which handles DB and state updates
      await handleUpdateProgress(apprenticeshipId, { status: newStatus });
      Analytics.event('apprenticeship_tracker', 'update_status', newStatus);
    } catch (error) {
      // Notification handled within handleUpdateProgress
      logger.error('Failed to update status', error);
    }
  };

  // DEPRECATED: No longer used directly for searching inside tracker section
  const handleSearch = async (query: string) => {
      setSearchQuery(query);
      // ... rest of the function (can be removed if not used elsewhere)
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
        setApprenticeships((prev) => [created, ...prev].sort((a, b) => new Date(b.updated_at || b.started_at).getTime() - new Date(a.updated_at || a.started_at).getTime()));
        setActiveApprenticeship(created.id);
        setShowAddModal(false); // Close modal after adding
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
        setApprenticeships((prev) => [created, ...prev].sort((a, b) => new Date(b.updated_at || b.started_at).getTime() - new Date(a.updated_at || a.started_at).getTime()));
        setActiveApprenticeship(created.id);
        // Maybe remove from saved list visually here if desired
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
        // Find the next logical active apprenticeship (e.g., the first one in the sorted list)
        setActiveApprenticeship(updatedApps.sort((a, b) => new Date(b.updated_at || b.started_at).getTime() - new Date(a.updated_at || a.started_at).getTime())[0].id);
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

  // Function to handle direct search (triggers useEffect)
  const handleDirectSearch = () => {
      // This function just triggers the effect by updating directSearchQuery
      // The actual API call happens in the useEffect hook
      // We can add instant feedback if needed, but useEffect handles the core logic
      if(directSearchQuery.trim()) {
          setModalPage(1); // Reset page when initiating a new search
          // The useEffect hook listening to directSearchQuery will handle the rest
          Analytics.event('apprenticeship_tracker', 'direct_search', directSearchQuery);
      } else {
           // If search is cleared, reset results
           setModalVacancies([]);
           setModalTotal(0);
      }
  };

   // Debounce direct search input
  useEffect(() => {
    const handler = setTimeout(() => {
      if (directSearchQuery) {
        handleDirectSearch();
      } else {
        // Clear results if search query is empty
        setModalVacancies([]);
        setModalTotal(0);
      }
    }, 500); // 500ms delay

    return () => {
      clearTimeout(handler);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [directSearchQuery]); // Only re-run if directSearchQuery changes


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
        setApprenticeships(prev => [created, ...prev].sort((a, b) => new Date(b.updated_at || b.started_at).getTime() - new Date(a.updated_at || a.started_at).getTime()));
        setActiveApprenticeship(created.id);
        setShowAddModal(false); // Close modal after adding
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
      className="mb-8 md:mb-10" // Adjusted margin
    >
      {/* Responsive Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3 sm:gap-0">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white uppercase">
          YOUR APPRENTICESHIP PROGRESS
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-lg flex items-center justify-center sm:justify-start space-x-2 text-sm font-medium transition-colors shadow-sm w-full sm:w-auto" // Full width on mobile
        >
          <Plus className="w-4 h-4" />
          <span>Add Apprenticeship</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 mb-4"> {/* Adjusted padding */}
        {apprenticeships.length === 0 && !isLoadingSaved ? (
          <div className="text-center py-6 sm:py-8">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Apprenticeships Added
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto px-4 sm:px-0">
              Add your first apprenticeship to track your progress!
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 sm:px-6 sm:py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg flex items-center justify-center mx-auto text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Apprenticeship to Tracker
            </button>
          </div>
        ) : apprenticeships.length > 0 ? (
          <>
            {/* Responsive Apprenticeship Selection Tabs - allow wrapping */}
            <div className="mb-6 flex flex-wrap gap-2 sm:gap-3">
              {apprenticeships.map((app) => (
                <button
                  key={app.id}
                  onClick={() => setActiveApprenticeship(app.id)}
                  className={`flex items-center space-x-2 sm:space-x-3 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm ${ // Smaller padding/text on mobile
                    activeApprenticeship === app.id
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-orange-900/20'
                  }`}
                >
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full flex-shrink-0 overflow-hidden"> {/* Slightly smaller logo */}
                    <img
                      src={app.logo || '/assets/logos/default.svg'}
                      alt={app.vacancy_company || 'Company Logo'}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.style.display = 'none';
                        const fallback = target.parentElement!.appendChild(document.createElement('div'));
                        fallback.className = "w-full h-full flex items-center justify-center bg-orange-500 text-white font-bold text-xs sm:text-xs"; // Keep text small
                        fallback.textContent = app.vacancy_company
                          ? app.vacancy_company.charAt(0).toUpperCase()
                          : '-';
                      }}
                    />
                  </div>
                  <span className="font-medium truncate max-w-[150px] sm:max-w-[200px]">{app.vacancy_title || 'Untitled Apprenticeship'}</span> {/* Limit width */}
                </button>
              ))}
            </div>

            {activeApprenticeship && (
              <div className="mb-6 border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/30"> {/* Adjusted padding */}
                {apprenticeships
                  .filter(app => app.id === activeApprenticeship)
                  .map(app => (
                    // Responsive Layout for Details
                    <div key={app.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                      <div className="flex-grow min-w-0">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 truncate">
                          {app.vacancy_title || 'Untitled Apprenticeship'}
                        </h3>
                        {/* Responsive Info Items - wrap on small screens */}
                        <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                           <div className="flex items-center min-w-0"> {/* Added min-w-0 for truncation */}
                                <Building className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 flex-shrink-0" />
                                <span className="truncate">{app.vacancy_company || 'Unknown Company'}</span>
                            </div>
                            <div className="flex items-center min-w-0"> {/* Added min-w-0 for truncation */}
                                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 flex-shrink-0" />
                                <span className="truncate">{app.location || 'Unknown Location'}</span>
                            </div>
                            <div className="flex items-center">
                                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 flex-shrink-0" />
                                <span>Applied: {new Date(app.applied_to).toLocaleDateString('en-GB')}</span>
                            </div>
                             <div className="flex items-center min-w-0"> {/* Added min-w-0 for truncation */}
                                <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 flex-shrink-0" />
                                <span className="truncate">Notes: {app.notes || 'N/A'}</span>
                            </div>
                            <div className="flex items-center">
                               <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 flex-shrink-0" />
                               <span>Started: {new Date(app.started_at).toLocaleDateString('en-GB')}</span>
                            </div>
                            <div className="flex items-center">
                                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 flex-shrink-0" />
                                <span>Updated: {new Date(app.updated_at).toLocaleDateString('en-GB')}</span>
                            </div>
                        </div>
                      </div>
                      {/* Responsive Controls */}
                      <div className="flex items-center justify-end flex-shrink-0 gap-2 sm:gap-4 mt-3 sm:mt-0">
                        <div className="text-right">
                          <span className="block text-xs text-gray-500 dark:text-gray-400">Stage</span>
                          <span className="font-semibold text-orange-500 text-sm sm:text-base">{app.status}</span>
                        </div>
                        <button
                          onClick={() => setShowDeleteConfirm(true)}
                          className="p-1.5 sm:p-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
                          title="Delete apprenticeship"
                        >
                          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" /> {/* Slightly smaller icon */}
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {showDeleteConfirm && (
              // Keep modal as is, generally okay on mobile unless content is very large
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg max-w-sm w-full">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Confirm Deletion</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Are you sure you want to delete this apprenticeship? This action cannot be undone.
                  </p>
                  <div className="flex justify-end gap-3 sm:gap-4">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm sm:text-base"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteApprenticeship}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm sm:text-base"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Responsive Timeline */}
            {activeApprenticeship && (
               <div className="relative pt-2 pb-4 overflow-x-auto sm:overflow-x-visible"> {/* Allow horizontal scroll on very small screens */}
                 <div className="flex justify-between items-center mb-3 px-1 min-w-[600px] sm:min-w-0"> {/* Min width for scrollable labels */}
                  {statusSteps.map((status) => (
                    <div key={status + '-label'} className="flex-1 text-center px-1">
                      {/* Smaller text on mobile */}
                      <span className="text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">
                        {status}
                      </span>
                    </div>
                  ))}
                </div>

                 <div className="relative flex justify-between items-center h-8 sm:h-10 min-w-[600px] sm:min-w-0"> {/* Min width for scrollable circles */}
                   {/* Adjusted line positioning */}
                   <div className="absolute top-1/2 left-3 right-3 sm:left-5 sm:right-5 h-0.5 sm:h-1 bg-gray-200 dark:bg-gray-700 transform -translate-y-1/2 rounded-full z-0"></div>

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
                           // Responsive Circle Size
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out relative z-10 ${
                            isActive
                              ? isRejection
                                ? 'bg-red-500 shadow-lg shadow-red-500/30 scale-110 ring-1 sm:ring-2 ring-white dark:ring-gray-800' // Adjusted ring
                                : 'bg-orange-500 shadow-lg shadow-orange-500/30 scale-110 ring-1 sm:ring-2 ring-white dark:ring-gray-800' // Adjusted ring
                              : isCompleted
                              ? 'bg-green-500 shadow-md shadow-green-500/20'
                              : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                          }`}
                          title={`Set status to: ${status}`}
                        >
                          {isCompleted ? (
                             <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white" /> // Adjusted icon size
                          ) : isRejection && isActive ? (
                             <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" /> // Adjusted icon size
                          ) : (
                            // Responsive Font Size
                            <span className={`text-xs sm:text-sm font-bold ${
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

        {/* Saved Apprenticeships - Responsive Grid */}
        {savedApprenticeships.length > 0 && (
          <div className="mt-6 sm:mt-8 pt-4 border-t border-gray-200 dark:border-gray-700"> {/* Added top margin/border */}
            <h4 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-3">
              Saved Apprenticeships
            </h4>
            {/* Responsive Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {savedApprenticeships.map((app) => (
                <div
                  key={app.id}
                  className="p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/30 flex flex-row sm:flex-col items-center sm:items-start justify-between sm:justify-start" // Adjusted flex for mobile
                >
                  <div className="flex-grow min-w-0 mr-2 sm:mr-0 sm:mb-2"> {/* Margin right on mobile */}
                    <h5 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {app.title} {/* Let truncate handle length */}
                    </h5>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {app.employerName} • {app.address?.addressLine3 || 'N/A'}
                    </p>
                  </div>
                  <button
                    onClick={() => addFromSaved(app)}
                    disabled={isApprenticeshipTracked(app)}
                     // Adjusted padding/margin for mobile tap target
                    className={`flex-shrink-0 mt-0 sm:mt-2 p-1.5 sm:p-2 rounded-lg transition-colors ${
                      isApprenticeshipTracked(app)
                        ? 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        : 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/30'
                    }`}
                    title={isApprenticeshipTracked(app) ? 'Already in tracker' : 'Add to tracker'}
                  >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" /> {/* Adjusted icon size */}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Modal - Optimizations for Mobile */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"> {/* Added padding for modal */}
             <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"> {/* Adjusted padding */}
               <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 flex-shrink-0">Add Apprenticeship</h3>

              {!showManualEntryForm ? (
                <>
                  {/* Responsive Search Input */}
                  <div className="mb-4 flex-shrink-0">
                     <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="Search for an apprenticeship..."
                          value={directSearchQuery}
                          onChange={(e) => setDirectSearchQuery(e.target.value)}
                          // onKeyDown={(e) => e.key === 'Enter' && handleDirectSearch()} // Debounced now
                          className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white text-sm sm:text-base" // Adjusted padding/text size
                        />
                        {isDirectSearching && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <Loader className="w-4 h-4 animate-spin text-orange-500" />
                          </div>
                        )}
                      </div>
                      {/* Removed explicit search button, search is debounced */}
                      {/* <button
                        onClick={handleDirectSearch}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center w-full sm:w-auto text-sm sm:text-base" // Full width on mobile
                      >
                        <Search className="w-4 h-4 mr-1" />
                        Search
                      </button> */}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-1">
                      Start typing the name of the apprenticeship...
                    </p>
                  </div>

                  {/* Search results - ensure scrollable */}
                  <div className="overflow-y-auto flex-1 custom-scrollbar mb-4 min-h-[150px]"> {/* Added min-height */}
                    {modalLoading ? (
                      <div className="text-center py-6">
                        <Loader className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-orange-500 mx-auto" />
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Searching...</p>
                      </div>
                    ) : directSearchQuery && modalVacancies.length > 0 ? (
                      <div>
                        <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2 px-1">Search Results</h4>
                        {modalVacancies.map((vacancy) => (
                           <div
                             key={vacancy.id}
                              className="p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/30 mb-3 sm:mb-4 flex items-center justify-between gap-2" // Adjusted padding/gap
                          >
                            <div className="flex-grow min-w-0"> {/* Added min-w-0 */}
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                {vacancy.title}
                              </h4>
                              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                {vacancy.employerName} • {vacancy.address?.addressLine3 || 'N/A'}
                              </p>
                            </div>
                            <button
                              onClick={() => addFromSearch(vacancy)}
                              disabled={isApprenticeshipTracked(vacancy)}
                               className={`ml-2 sm:ml-4 p-1.5 sm:p-2 rounded-lg transition-colors flex-shrink-0 ${ // Adjusted padding/margin
                                isApprenticeshipTracked(vacancy)
                                  ? 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                  : 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/30'
                              }`}
                              title={isApprenticeshipTracked(vacancy) ? 'Already in tracker' : 'Add to tracker'}
                            >
                              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                          </div>
                        ))}
                        {/* Basic Pagination (Optional for Modal) */}
                        {modalTotal > MODAL_ITEMS_PER_PAGE && !directSearchQuery && (
                            <div className="flex justify-center mt-4 text-sm">
                                <button
                                    onClick={() => setModalPage(p => Math.max(1, p - 1))}
                                    disabled={modalPage === 1}
                                    className="px-3 py-1 border rounded-l disabled:opacity-50"
                                >Prev</button>
                                <span className="px-3 py-1 border-t border-b">Page {modalPage} of {Math.ceil(modalTotal / MODAL_ITEMS_PER_PAGE)}</span>
                                <button
                                    onClick={() => setModalPage(p => Math.min(Math.ceil(modalTotal / MODAL_ITEMS_PER_PAGE), p + 1))}
                                    disabled={modalPage * MODAL_ITEMS_PER_PAGE >= modalTotal}
                                    className="px-3 py-1 border rounded-r disabled:opacity-50"
                                >Next</button>
                            </div>
                        )}
                      </div>
                    ) : directSearchQuery ? (
                      <div className="text-center py-6 sm:py-8 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                        <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500 mx-auto mb-2" />
                        <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-medium">No results found</p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xs sm:max-w-md mx-auto">
                          Try adjusting your search or add manually.
                        </p>
                        <button
                          onClick={() => setShowManualEntryForm(true)}
                          className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors text-sm"
                        >
                          Add Manually
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-6 sm:py-8 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                        <Search className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Search by name or add manually
                        </p>
                         <button
                          onClick={() => setShowManualEntryForm(true)}
                          className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors text-sm"
                        >
                          <Plus className="w-4 h-4 mr-1 inline"/> Add Manually
                        </button>
                      </div>
                    )}
                  </div>

                   {/* "Not finding what you're looking for" section */}
                  {/* Removed condition: !modalLoading && directSearchQuery && modalVacancies.length > 0 */}
                  {/* Show always if not in manual mode */}
                   {!showManualEntryForm && (
                        <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                            <p className="text-gray-700 dark:text-gray-300 text-center text-sm font-medium mb-2">
                                Can't find it?
                            </p>
                            <button
                                onClick={() => setShowManualEntryForm(true)}
                                className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors flex items-center justify-center text-sm"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Manually
                            </button>
                        </div>
                    )}
                </>
              ) : (
                <>
                  {/* Manual entry form - Ensure scrollable */}
                  <div className="mb-4 overflow-y-auto flex-1 custom-scrollbar">
                    <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-3">
                      Enter Apprenticeship Details
                    </h4>

                    <div className="space-y-3 sm:space-y-4">
                      <div>
                         <label htmlFor="title" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="title"
                          type="text"
                          value={manualEntryData.title}
                          onChange={(e) => setManualEntryData({...manualEntryData, title: e.target.value})}
                           className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white text-sm sm:text-base"
                          placeholder="e.g. Software Dev Apprenticeship"
                          required
                        />
                      </div>

                      <div>
                         <label htmlFor="company" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Company <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="company"
                          type="text"
                          value={manualEntryData.company}
                          onChange={(e) => setManualEntryData({...manualEntryData, company: e.target.value})}
                           className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white text-sm sm:text-base"
                          placeholder="e.g. Tech Solutions Ltd"
                          required
                        />
                      </div>

                      <div>
                         <label htmlFor="location" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Location
                        </label>
                        <input
                          id="location"
                          type="text"
                          value={manualEntryData.location}
                          onChange={(e) => setManualEntryData({...manualEntryData, location: e.target.value})}
                          className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white text-sm sm:text-base"
                          placeholder="e.g. London / Remote"
                        />
                      </div>

                      <div>
                         <label htmlFor="notes" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Notes
                        </label>
                        <textarea
                          id="notes"
                          rows={3}
                          value={manualEntryData.notes}
                          onChange={(e) => setManualEntryData({...manualEntryData, notes: e.target.value})}
                           className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white resize-none text-sm sm:text-base"
                          placeholder="e.g., Application deadline, contact person..."
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Responsive Footer Buttons */}
              <div className={`flex flex-col sm:flex-row ${showManualEntryForm ? 'justify-between' : 'justify-end'} items-center mt-auto pt-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 gap-3`}>
                <button
                  onClick={() => {
                    if (showManualEntryForm) {
                      setShowManualEntryForm(false);
                      // Reset search results when going back? Optional.
                      // setDirectSearchQuery('');
                      // setModalVacancies([]);
                    } else {
                      setShowAddModal(false);
                    }
                  }}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors w-full sm:w-auto text-sm" // Full width on mobile
                >
                  {showManualEntryForm ? 'Back to Search' : 'Cancel'}
                </button>

                {showManualEntryForm && (
                  <button
                    onClick={handleManualEntrySubmit}
                     className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors w-full sm:w-auto flex items-center justify-center text-sm" // Full width on mobile
                  >
                    <Save className="w-4 h-4 mr-2 inline-block" />
                    Save Manually
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
        {/* Notification Area */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm w-full"
            style={{
              backgroundColor: notification.type === 'success' ? '#10B981' : notification.type === 'error' ? '#EF4444' : '#3B82F6', // Green, Red, Blue
              color: 'white',
            }}
          >
             <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{notification.message}</span>
                <button onClick={() => setNotification(prev => ({ ...prev, show: false }))} className="ml-2 p-1 rounded-full hover:bg-black/10">
                    <X className="w-4 h-4" />
                </button>
            </div>
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
      className="mb-8 md:mb-10" // Adjusted margin
    >
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white uppercase mb-4">
        YOUR LATEST CV SCORE
      </h2>

       {/* Responsive Layout */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6"> {/* Adjusted padding/gap */}
         <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full md:w-auto"> {/* Stack vertically on mobile */}
           {/* Responsive SVG Size */}
           <div className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 flex-shrink-0"> {/* Adjusted size */}
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
               {/* Responsive Text Size */}
              <motion.text
                x="50"
                y="50"
                textAnchor="middle"
                dy="0.3em"
                className="text-2xl sm:text-3xl font-bold fill-gray-900 dark:fill-white" // Adjusted size
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                {cvScore}
                <tspan
                  x="50"
                  dy="1.2em"
                  className="text-xs sm:text-sm md:text-base font-medium fill-gray-500 dark:fill-gray-400" // Adjusted size
                >
                  /100
                </tspan>
              </motion.text>
            </svg>
          </div>

          <div className="flex-grow text-center sm:text-left">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2">
              Improve Your CV Score
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Get AI recommendations to optimize your CV.
            </p>
          </div>
        </div>

         {/* Responsive Buttons - Stack on mobile */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-4 md:mt-0">
          <Link
            href="/optimise-cv/history"
            className="px-5 py-2.5 sm:px-6 sm:py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors shadow-md hover:shadow-lg flex items-center justify-center whitespace-nowrap w-full md:w-auto text-sm sm:text-base" // Full width on mobile
          >
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> {/* Adjusted icon size */}
            View History
          </Link>
          <Link
            href="/optimise-cv"
            className="px-5 py-2.5 sm:px-6 sm:py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg flex items-center justify-center whitespace-nowrap w-full md:w-auto text-sm sm:text-base" // Full width on mobile
          >
            <Upload className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> {/* Adjusted icon size */}
            Optimise Now
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

// Article card component to display recommended resources
const ArticleCard = ({ article }: { article: any }) => (
  <Link key={article.id} href={article.slug} className="group block"> {/* Ensure block for layout */}
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg overflow-hidden transition-all duration-300 border border-gray-100 dark:border-gray-700 h-full flex flex-col"> {/* Ensure full height */}
      {article.image && (
        <div className="relative h-40 sm:h-48 w-full flex-shrink-0"> {/* Adjusted height */}
          <img
            src={article.image}
            alt={article.title}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
          />
          {article.featured && (
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-orange-500 text-white rounded-full p-1 sm:p-1.5 shadow-md"> {/* Adjusted position/padding */}
              <Star className="w-3 h-3 sm:w-4 sm:h-4" /> {/* Adjusted icon size */}
            </div>
          )}
        </div>
      )}
      <div className="p-4 sm:p-6 flex flex-col flex-grow"> {/* Adjusted padding, flex-grow */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="inline-block px-2.5 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm font-medium text-orange-700 bg-orange-50 dark:bg-orange-900/30 dark:text-orange-300 rounded-full"> {/* Adjusted padding/text size */}
            {article.category}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm font-medium text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded-full"> {/* Adjusted padding/text size */}
            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" /> {/* Adjusted icon size */}
            {article.readTime || "5 min"} {/* Shorter text */}
          </span>
        </div>
         {/* Responsive Title Size */}
        <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-orange-500 transition-colors line-clamp-2 flex-grow"> {/* Adjusted size, flex-grow */}
          {article.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
          {article.description || `Gain insights and tips about ${article.category.toLowerCase()} to enhance your apprenticeship journey.`}
        </p>
        <div className="mt-auto pt-2 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center"> {/* mt-auto pushes to bottom */}
          <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {article.date}
          </span>
          <span className="inline-flex items-center text-orange-500 font-medium group-hover:translate-x-1 transition-transform text-sm">
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
      className="mb-8 md:mb-10" // Adjusted margin
    >
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white uppercase mb-4">
        RECOMMENDED RESOURCES
      </h2>

       <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6"> {/* Adjusted padding */}
         {/* Responsive Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-3 md:gap-4">
          <div className="flex-grow">
             <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-1">
              Curated For Your Journey
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Explore resources to help you succeed.
            </p>
          </div>
          <Link
            href="/resources"
             className="px-4 py-2 sm:px-5 sm:py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg flex items-center justify-center flex-shrink-0 w-full md:w-auto text-sm sm:text-base" // Full width on mobile
          >
            View All Resources
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

         {/* Responsive Grid */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8"> {/* Adjusted gap */}
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
    // Adjusted padding for overall container
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
      <div className="mb-8 md:mb-10"> {/* Adjusted margin */}
        <GreetingSection name={userData.name} />
      </div>

      <CVOptimizerSection score={latestCvScore} />

      <ApprenticeshipTrackerSection userId={userData.id} />

      <RecommendedArticlesSection />
    </div>
  );
};