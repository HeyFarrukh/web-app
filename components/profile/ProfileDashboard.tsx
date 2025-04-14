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
interface TrackedApprenticeship {
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
  const [newApprenticeshipData, setNewApprenticeshipData] = useState({
    title: '',
    company: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Applied' as ApprenticeshipStatus
  });
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    message: '',
    type: 'info'
  });
  
  // Load tracked apprenticeships from localStorage
  useEffect(() => {
    const loadTrackedApprenticeships = () => {
      try {
        // Only run in browser environment
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem(`apprenticeships_${userId}`);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
              setApprenticeships(parsed);
              
              // Set active apprenticeship if we have items but none selected
              if (parsed.length > 0 && !activeApprenticeship) {
                setActiveApprenticeship(parsed[0].id);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error loading tracked apprenticeships from localStorage:', error);
      }
    };
    
    loadTrackedApprenticeships();
  }, [userId]);
  
  // Save tracked apprenticeships to localStorage whenever they change
  useEffect(() => {
    try {
      // Only run in browser environment
      if (typeof window !== "undefined") {
        // Always save apprenticeships array, even when empty (to clear previously stored data)
        localStorage.setItem(`apprenticeships_${userId}`, JSON.stringify(apprenticeships));
        
        // If we have apprenticeships but no active one selected, select the first one
        if (apprenticeships.length > 0 && !activeApprenticeship) {
          setActiveApprenticeship(apprenticeships[0].id);
        }
      }
    } catch (error) {
      console.error('Error saving tracked apprenticeships to localStorage:', error);
    }
  }, [apprenticeships, userId, activeApprenticeship]);
  
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

  // Hide notification after timeout
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (notification.show) {
      timeout = setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, 5000); // Hide after 5 seconds
    }
    
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [notification.show]);
  
  // Show notification helper
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({
      show: true,
      message,
      type
    });
  };
  
  const handleStatusUpdate = (apprenticeshipId: string, newStatus: ApprenticeshipStatus) => {
    setApprenticeships(prev => 
      prev.map(app => 
        app.id === apprenticeshipId ? { ...app, status: newStatus } : app
      )
    );
    Analytics.event('apprenticeship_tracker', 'update_status', newStatus);
  };

  const handleAddApprenticeship = () => {
    // Validate form
    if (!newApprenticeshipData.title || !newApprenticeshipData.company || !newApprenticeshipData.location) {
      showNotification('Please fill in all required fields', 'error');
      return; // Don't proceed if required fields are missing
    }
    
    // Create new apprenticeship
    const newApprenticeship = {
      id: `app-${Date.now()}`, // Generate a unique ID
      title: newApprenticeshipData.title,
      company: newApprenticeshipData.company,
      logo: `/assets/logos/default.svg`, // Use a default logo
      location: newApprenticeshipData.location,
      status: newApprenticeshipData.status,
      date: newApprenticeshipData.date,
    };
    
    // Add to list and select it
    setApprenticeships(prev => [...prev, newApprenticeship]);
    setActiveApprenticeship(newApprenticeship.id);
    
    // Show confirmation
    showNotification(`Added ${newApprenticeshipData.title} at ${newApprenticeshipData.company} to your tracker!`, 'success');
    
    // Reset form and close modal
    setNewApprenticeshipData({
      title: '',
      company: '',
      location: '',
      date: new Date().toISOString().split('T')[0],
      status: 'Applied' as ApprenticeshipStatus
    });
    setShowAddModal(false);
    
    // Track analytics event
    Analytics.event('apprenticeship_tracker', 'add_apprenticeship_manual');
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
        page: 1,
        pageSize: 5,
        filters: {
          search: query,
        }
      });
      
      if (vacancies && Array.isArray(vacancies)) {
        setSearchResults(vacancies);
      } else {
        setSearchResults([]);
      }
      
      setIsSearching(false);
      Analytics.event('apprenticeship_tracker', 'search_apprenticeships', query);
    } catch (error) {
      console.error('Error searching apprenticeships:', error);
      setIsSearching(false);
      setSearchResults([]);
    }
  };

  // Check if an apprenticeship is already being tracked
  const isApprenticeshipTracked = (apprenticeship: ListingType) => {
    return apprenticeships.some(
      app => (app.vacancyId && app.vacancyId === apprenticeship.slug) || 
             (app.title === apprenticeship.title && app.company === apprenticeship.employerName)
    );
  };

  const addFromSearch = (apprenticeship: ListingType) => {
    // Check if already tracked
    if (isApprenticeshipTracked(apprenticeship)) {
      showNotification('This apprenticeship is already in your tracker', 'info');
      return;
    }
    
    const newApprenticeship = {
      id: `app-${Date.now()}`,
      title: apprenticeship.title,
      company: apprenticeship.employerName,
      logo: apprenticeship.logo || `/assets/logos/default.svg`,
      location: apprenticeship.address?.addressLine3 || 'Unknown location',
      status: 'Applied' as ApprenticeshipStatus,
      date: new Date().toISOString().split('T')[0],
      vacancyId: apprenticeship.slug || apprenticeship.id, // Store reference to the original listing
    };
    
    setApprenticeships(prev => [...prev, newApprenticeship]);
    setActiveApprenticeship(newApprenticeship.id);
    setShowAddModal(false);
    
    // Show a confirmation message
    showNotification(`Added ${apprenticeship.title} to your tracker!`, 'success');
    
    Analytics.event('apprenticeship_tracker', 'add_from_search', apprenticeship.title);
  };
  
  const addFromSaved = (apprenticeship: ListingType) => {
    // Check if already tracked
    if (isApprenticeshipTracked(apprenticeship)) {
      showNotification('This apprenticeship is already in your tracker', 'info');
      return;
    }
    
    const newApprenticeship = {
      id: `app-${Date.now()}`,
      title: apprenticeship.title,
      company: apprenticeship.employerName,
      logo: apprenticeship.logo || `/assets/logos/default.svg`,
      location: apprenticeship.address?.addressLine3 || 'Unknown location',
      status: 'Applied' as ApprenticeshipStatus,
      date: new Date().toISOString().split('T')[0],
      vacancyId: apprenticeship.slug || apprenticeship.id,
    };
    
    setApprenticeships(prev => [...prev, newApprenticeship]);
    setActiveApprenticeship(newApprenticeship.id);
    
    // Show a confirmation toast or message
    showNotification(`Added ${apprenticeship.title} to your tracker!`, 'success');
    
    Analytics.event('apprenticeship_tracker', 'add_from_saved', apprenticeship.title);
  };
  
  const handleDeleteApprenticeship = () => {
    if (!activeApprenticeship) return;
    
    const apprenticeshipToDelete = apprenticeships.find(app => app.id === activeApprenticeship);
    const updatedApprenticeships = apprenticeships.filter(app => app.id !== activeApprenticeship);
    setApprenticeships(updatedApprenticeships);
    setActiveApprenticeship(updatedApprenticeships[0]?.id || null);
    setShowDeleteConfirm(false);
    
    // Show notification
    if (apprenticeshipToDelete) {
      showNotification(`Removed ${apprenticeshipToDelete.title} from your tracker`, 'info');
    }
    
    Analytics.event('apprenticeship_tracker', 'delete_apprenticeship');
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
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Saved Apprenticeships
          </h3>
          
          {isLoadingSaved ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : savedApprenticeships.length === 0 ? (
            <div className="text-center py-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400">
                You haven't saved any apprenticeships yet.
              </p>
              <Link 
                href="/apprenticeships" 
                className="mt-2 inline-flex items-center text-orange-500 hover:text-orange-600"
              >
                Browse Apprenticeships
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedApprenticeships.map((app) => (
                <div 
                  key={app.slug || app.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-white rounded-full flex-shrink-0 overflow-hidden mr-3">
                      <img
                        src={app.logo || '/assets/logos/default.svg'}
                        alt={app.employerName}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.style.display = 'none';
                          target.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-orange-500 text-white font-bold">${app.employerName.charAt(0)}</div>`;
                        }}
                      />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{app.title}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {app.employerName} • {app.address?.addressLine3 || 'Unknown location'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => addFromSaved(app)}
                    disabled={isApprenticeshipTracked(app)}
                    className={`ml-4 p-2 rounded-lg transition-colors ${
                      isApprenticeshipTracked(app)
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        : 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/30'
                    }`}
                    title={isApprenticeshipTracked(app) ? "Already in tracker" : "Add to tracker"}
                  >
                    {isApprenticeshipTracked(app) ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Plus className="w-5 h-5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {apprenticeships.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-orange-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-orange-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Apprenticeships Added Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
              Track your application progress by adding the apprenticeships you've applied to.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg flex items-center justify-center mx-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Apprenticeship
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 flex flex-wrap gap-3">
              {apprenticeships.map((app) => (
                <button
                  key={app.id}
                  onClick={() => setActiveApprenticeship(app.id)}
                  className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                    activeApprenticeship === app.id
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-orange-900/20'
                  }`}
                >
                  <div className="w-6 h-6 bg-white rounded-full flex-shrink-0 overflow-hidden">
                    <img src={app.logo} alt={app.company} className="w-full h-full object-contain" 
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-orange-500 text-white font-bold">${app.company.charAt(0)}</div>`;
                      }}
                    />
                  </div>
                  <span className="font-medium">{app.title}</span>
                </button>
              ))}
            </div>
            
            {activeApprenticeship && (
              <div className="mb-6">
                {apprenticeships
                  .filter(app => app.id === activeApprenticeship)
                  .map(app => (
                    <div key={app.id} className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="mb-4 md:mb-0">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          {app.title}
                        </h3>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center">
                            <Building className="w-4 h-4 mr-1.5" />
                            <span>{app.company}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1.5" />
                            <span>{app.location}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1.5" />
                            <span>Applied: {new Date(app.date).toLocaleDateString('en-GB')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-gray-700 dark:text-gray-300">Current Stage:</span>
                        <span className="font-semibold text-orange-500">{app.status}</span>
                        <button
                          onClick={() => setShowDeleteConfirm(true)}
                          className="ml-4 p-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
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
              <>
                <div className="relative py-8">
                  {/* Line that goes through all status steps */}
                  <div className="absolute top-20 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 -translate-y-1/2 rounded-full z-0"></div>
                  
                  <div className="relative flex justify-between">
                    {statusSteps.map((status, index) => {
                      const activeApp = apprenticeships.find(app => app.id === activeApprenticeship);
                      const statusIndex = statusSteps.indexOf(activeApp?.status as ApprenticeshipStatus);
                      const isActive = index === statusIndex;
                      const isCompleted = index < statusIndex;
                      const isRejection = status === 'Rejection';
                      
                      return (
                        <div key={status} className="flex flex-col items-center">
                          <span className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            {status}
                          </span>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              if (activeApp) {
                                handleStatusUpdate(activeApp.id, status);
                              }
                            }}
                            className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all ${
                              isActive
                                ? isRejection
                                  ? 'bg-red-500 shadow-lg shadow-red-500/30 scale-110'
                                  : 'bg-orange-500 shadow-lg shadow-orange-500/30 scale-110'
                                : isCompleted
                                ? 'bg-green-500 shadow-lg shadow-green-500/20'
                                : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                          >
                            {isCompleted ? (
                              <Check className="w-5 h-5 text-white" />
                            ) : isRejection ? (
                              <X className="w-5 h-5 text-white" />
                            ) : (
                              <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                {index + 1}
                              </span>
                            )}
                          </motion.button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Notification System */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 right-4 z-50 max-w-md"
          >
            <div className={`rounded-lg shadow-lg flex items-start p-4 ${
              notification.type === 'success' ? 'bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500' :
              notification.type === 'error' ? 'bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500' :
              'bg-orange-50 dark:bg-orange-900/30 border-l-4 border-orange-500'
            }`}>
              <div className={`flex-shrink-0 mr-3 ${
                notification.type === 'success' ? 'text-green-500' :
                notification.type === 'error' ? 'text-red-500' :
                'text-orange-500'
              }`}>
                {notification.type === 'success' ? (
                  <Check className="w-5 h-5" />
                ) : notification.type === 'error' ? (
                  <AlertCircle className="w-5 h-5" />
                ) : (
                  <Bell className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1 pr-6">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {notification.message}
                </p>
              </div>
              <button
                onClick={() => setNotification(prev => ({ ...prev, show: false }))}
                className="flex-shrink-0 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal for confirming deletion */}
      <AnimatePresence>
        {showDeleteConfirm && (
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
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Delete Apprenticeship
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Are you sure you want to delete this apprenticeship? This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteApprenticeship}
                  className="px-4 py-2 rounded-lg text-white bg-red-500 hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal for adding a new apprenticeship */}
      <AnimatePresence>
        {showAddModal && (
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
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Add Apprenticeship
                </h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Search Apprenticeships
                </h4>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-10 p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    placeholder="Search for apprenticeships..."
                  />
                </div>
                
                {isSearching ? (
                  <div className="flex justify-center py-4">
                    <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                    {searchResults.map((apprenticeship) => (
                      <div
                        key={apprenticeship.id}
                        className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors flex justify-between items-center"
                      >
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{apprenticeship.title}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {apprenticeship.employerName} • {apprenticeship.address?.addressLine3 || 'Unknown location'}
                          </div>
                        </div>
                        <button
                          onClick={() => addFromSearch(apprenticeship)}
                          disabled={isApprenticeshipTracked(apprenticeship)}
                          className={`p-2 rounded-lg transition-colors ${
                            isApprenticeshipTracked(apprenticeship)
                              ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                              : 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/30'
                          }`}
                          title={isApprenticeshipTracked(apprenticeship) ? "Already in tracker" : "Add to tracker"}
                        >
                          {isApprenticeshipTracked(apprenticeship) ? (
                            <Check className="w-5 h-5" />
                          ) : (
                            <Plus className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : searchQuery.length > 0 ? (
                  <div className="text-center py-3 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                    <p className="text-gray-500 dark:text-gray-400">No apprenticeships found</p>
                  </div>
                ) : null}
              </div>
              
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Manual Entry
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Apprenticeship Title*
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={newApprenticeshipData.title}
                      onChange={(e) => setNewApprenticeshipData({...newApprenticeshipData, title: e.target.value})}
                      className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                      placeholder="e.g. Data Analyst Apprentice"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Company Name*
                    </label>
                    <input
                      type="text"
                      id="company"
                      value={newApprenticeshipData.company}
                      onChange={(e) => setNewApprenticeshipData({...newApprenticeshipData, company: e.target.value})}
                      className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                      placeholder="e.g. Google"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Location*
                    </label>
                    <input
                      type="text"
                      id="location"
                      value={newApprenticeshipData.location}
                      onChange={(e) => setNewApprenticeshipData({...newApprenticeshipData, location: e.target.value})}
                      className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                      placeholder="e.g. London"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Application Date
                    </label>
                    <input
                      type="date"
                      id="date"
                      value={newApprenticeshipData.date}
                      onChange={(e) => setNewApprenticeshipData({...newApprenticeshipData, date: e.target.value})}
                      className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Current Status
                    </label>
                    <select
                      id="status"
                      value={newApprenticeshipData.status}
                      onChange={(e) => setNewApprenticeshipData({
                        ...newApprenticeshipData, 
                        status: e.target.value as ApprenticeshipStatus
                      })}
                      className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    >
                      {statusSteps.map(status => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 mr-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddApprenticeship}
                  className="px-4 py-2 rounded-lg text-white bg-orange-500 hover:bg-orange-600 transition-colors"
                >
                  Add Apprenticeship
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
const CVOptimizerSection: React.FC = () => {
  // Sample CV score - in a real implementation, this would come from an API
  const cvScore = 75;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mb-10"
    >
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white uppercase mb-4">
        YOUR CV SCORE
      </h2>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col md:flex-row items-center justify-between">
        <div className="mb-6 md:mb-0 flex items-center">
          <div className="relative w-40 h-40 mr-6">
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
                strokeDasharray={`${cvScore * 2.83} 283`}
                transform="rotate(-90 50 50)"
                initial={{ strokeDasharray: "0 283" }}
                animate={{ strokeDasharray: `${cvScore * 2.83} 283` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
              <motion.text
                x="50"
                y="50"
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-3xl font-bold fill-gray-900 dark:fill-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {cvScore}
              </motion.text>
              <motion.text
                x="50"
                y="68"
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-sm fill-orange-500 font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                /100
              </motion.text>
            </svg>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Improve Your CV Score
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Get AI-powered recommendations to optimize your CV for specific apprenticeships.
            </p>
          </div>
        </div>

        <Link
          href="/optimise-cv"
          className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg flex items-center justify-center whitespace-nowrap"
        >
          Optimise CV
        </Link>
      </div>
    </motion.div>
  );
};

// Component for recommended resources section
const RecommendedResourcesSection: React.FC<{ articles: typeof recommendedArticles }> = ({ articles }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.5 }}
    className="mb-10"
  >
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white uppercase mb-4">
      RECOMMENDED RESOURCES
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {articles.map((article) => (
        <motion.div
          key={article.id}
          whileHover={{ y: -5 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
        >
          <div className="h-40 overflow-hidden">
            <img 
              src={article.image} 
              alt={article.title} 
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-6">
            <span className="text-xs font-semibold text-orange-500 uppercase tracking-wider">
              {article.category}
            </span>

            <h3 className="mt-2 text-lg font-bold text-gray-900 dark:text-white mb-3">
              {article.title}
            </h3>

            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {article.readTime}
              </span>

              <span>{article.date}</span>
            </div>

            <Link
              href={article.slug}
              className="mt-4 inline-flex items-center text-orange-500 hover:text-orange-600 dark:text-orange-400 text-sm font-medium"
            >
              Read Article
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </motion.div>
      ))}
    </div>

    <div className="mt-6 text-center">
      <Link 
        href="/resources" 
        className="inline-flex items-center text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 font-medium"
      >
        <span>VIEW ALL RESOURCES</span>
        <ChevronRight className="w-4 h-4 ml-1" />
      </Link>
    </div>
  </motion.div>
);

export const ProfileDashboard: React.FC<ProfileDashboardProps> = ({ userData }) => {
  const [cvOptimizations, setCvOptimizations] = useState<CVOptimization[]>([]);
  const [isLoadingOptimizations, setIsLoadingOptimizations] = useState(false);
  const [visibleOptimizations, setVisibleOptimizations] = useState(3);
  const [hasMoreOptimizations, setHasMoreOptimizations] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    const fetchCvOptimizations = async () => {
      if (!userData?.id) return;

      try {
        setIsLoadingOptimizations(true);
        const optimizations = await cvTrackingService.getUserOptimisations(userData.id); // Get all optimizations

        if (optimizations && optimizations.length > 0) {
          setCvOptimizations(optimizations);
          setHasMoreOptimizations(optimizations.length > visibleOptimizations);
        }
      } catch (error) {
        logger.error('Failed to fetch CV optimizations history:', error);
      } finally {
        setIsLoadingOptimizations(false);
      }
    };

    fetchCvOptimizations();
  }, [userData?.id, visibleOptimizations]);

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    // Add a small delay to show the loading state
    setTimeout(() => {
      setVisibleOptimizations(prev => prev + 3);
      setHasMoreOptimizations(cvOptimizations.length > visibleOptimizations + 3);
      setIsLoadingMore(false);
    }, 500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-10">
        <GreetingSection name={userData.name} />
      </div>

      <CVOptimizerSection />

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
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Previous CV Optimisations
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 md:mb-0">
                Review your past CV optimisations and feedback
              </p>
            </div>

            <Link
              href="/optimise-cv"
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg flex items-center justify-center"
            >
              <Upload className="w-4 h-4 mr-2" />
              Optimize New CV
            </Link>
          </div>

          <div className="space-y-4">
            {[...cvOptimizations].slice(0, visibleOptimizations).map((cv) => (
              <div 
                key={cv.id}
                className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center">
                  <div className="relative w-28 h-28 flex-shrink-0">
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
                        stroke={cv.overall_score >= 80 ? "#22c55e" : cv.overall_score >= 70 ? "#f97316" : "#ef4444"}
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={`${cv.overall_score * 2.83} 283`}
                        transform="rotate(-90 50 50)"
                      />
                      <text
                        x="50"
                        y="45"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-3xl font-bold fill-gray-900 dark:fill-white"
                      >
                        {cv.overall_score}
                      </text>
                      <text
                        x="50"
                        y="68"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-sm font-medium fill-gray-500 dark:fill-gray-400"
                      >
                        /100
                      </text>
                    </svg>
                  </div>

                  <div className="ml-6">
                    <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                      {new Date(cv.created_at).toLocaleDateString('en-GB', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric'
                      })}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(cv.created_at).toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>

                <Link
                  href={`/optimise-cv/history/${cv.id}`}
                  className="px-6 py-3 text-orange-500 hover:text-orange-600 dark:text-orange-400 text-base font-medium flex items-center bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
                >
                  View Feedback
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Link>
              </div>
            ))}

            {cvOptimizations.length === 0 && !isLoadingOptimizations && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-orange-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No CV Optimizations Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                  Optimize your CV with our AI-powered tool to get personalized feedback and improve your chances of success.
                </p>
                <Link
                  href="/optimise-cv"
                  className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg"
                >
                  Optimize Your CV Now
                </Link>
              </div>
            )}
            {isLoadingOptimizations && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-orange-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Loading CV Optimizations...
                </h3>
              </div>
            )}
          </div>

          {hasMoreOptimizations && (
            <div className="text-center mt-6">
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg"
              >
                {isLoadingMore ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Loading...
                  </div>
                ) : (
                  'Load More'
                )}
              </button>
            </div>
          )}
        </div>
      </motion.div>

      <ApprenticeshipTrackerSection userId={userData.id} />

      <RecommendedResourcesSection articles={recommendedArticles} />
    </div>
  );
};