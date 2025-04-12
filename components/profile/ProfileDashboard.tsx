'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  User, Edit2, Settings, Award, BookOpen, Bell, Clock, ExternalLink, 
  Check, X, Save, ChevronRight, ToggleLeft, ToggleRight, Upload, 
  MapPin, Calendar, Briefcase, Building, GraduationCap, Plus, Trash2
} from 'lucide-react';
import { SupabaseUserProfile } from '@/types/auth';
import { Analytics } from '@/services/analytics/analytics';

interface ProfileDashboardProps {
  userData: SupabaseUserProfile;
}

// Sample apprenticeship data
// In a real implementation, this would come from an API
const sampleSavedApprenticeships = [
  {
    id: 'app-1',
    title: 'Software Engineer Apprentice',
    company: 'BT',
    logo: '/assets/logos/bt.svg',
    location: 'London',
    status: 'Applied',
    date: '2025-03-15',
  },
  {
    id: 'app-2',
    title: 'Digital Marketing Apprentice',
    company: 'IBM',
    logo: '/assets/logos/ibm.svg',
    location: 'Manchester',
    status: 'Online Assessment',
    date: '2025-03-10',
  },
  {
    id: 'app-3',
    title: 'Data Analyst Degree Apprenticeship',
    company: 'Accenture',
    logo: '/assets/logos/accenture.svg',
    location: 'Birmingham',
    status: 'Interview',
    date: '2025-02-28',
  }
];

// Sample article recommendations
const recommendedArticles = [
  {
    id: 'art-1',
    title: 'How to Ace Your Apprenticeship Interview',
    category: 'INTERVIEW GUIDE',
    image: '/media/articles/interview.jpg',
    readTime: '7 min',
    date: '20 March 2025',
    slug: '/resources/ace-your-apprenticeship-interview'
  },
  {
    id: 'art-2',
    title: 'CV Writing Guide: Make a Lasting First Impression',
    category: 'CV GUIDE',
    image: '/media/articles/cv-guide.jpg',
    readTime: '10 min',
    date: '15 March 2025',
    slug: '/resources/cv-guide'
  },
  {
    id: 'art-3',
    title: 'Navigating Online Assessments with Confidence',
    category: 'ASSESSMENT TIPS',
    image: '/media/articles/assessment.jpg',
    readTime: '5 min',
    date: '10 March 2025',
    slug: '/resources/online-assessments'
  }
];

type ApprenticeshipStatus = 'Applied' | 'Online Assessment' | 'Interview' | 'Assessment Centre' | 'Offer' | 'Rejection';

const statusSteps: ApprenticeshipStatus[] = [
  'Applied',
  'Online Assessment',
  'Interview',
  'Assessment Centre',
  'Rejection',
  'Offer'
];

// Component for the greeting section with user's name
const GreetingSection: React.FC<{ name: string | null }> = ({ name }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="mb-10 text-left"
  >
    <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
      WELCOME, <span className="font-playfair italic text-orange-500">{name || 'Apprentice'}</span>
    </h1>
    <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">
      Track your apprenticeship journey and manage your preferences
    </p>
  </motion.div>
);

// Component for the apprenticeship progress timeline
const ApprenticeshipProgressSection: React.FC<{ apprenticeships: typeof sampleSavedApprenticeships }> = ({ apprenticeships: initialApprenticeships }) => {
  const [apprenticeships, setApprenticeships] = useState([...initialApprenticeships]);
  const [activeApprenticeship, setActiveApprenticeship] = useState<string | null>(initialApprenticeships[0]?.id || null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newApprenticeshipData, setNewApprenticeshipData] = useState({
    title: '',
    company: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Applied' as ApprenticeshipStatus
  });
  
  const handleStatusUpdate = (apprenticeshipId: string, newStatus: ApprenticeshipStatus) => {
    setUpdatingStatus(true);
    
    // Simulate API call
    setTimeout(() => {
      // Update the status in our local state
      setApprenticeships(prev => 
        prev.map(app => 
          app.id === apprenticeshipId ? { ...app, status: newStatus } : app
        )
      );
      
      setUpdatingStatus(false);
      setShowSuccessMessage(true);
      
      // Track analytics event
      Analytics.event('apprenticeship_tracker', 'update_status', newStatus);
      
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    }, 800);
  };

  const handleAddApprenticeship = () => {
    // Validate form
    if (!newApprenticeshipData.title || !newApprenticeshipData.company || !newApprenticeshipData.location) {
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
    Analytics.event('apprenticeship_tracker', 'add_apprenticeship');
  };
  
  const handleDeleteApprenticeship = () => {
    if (!activeApprenticeship) return;
    
    // Filter out the active apprenticeship
    const updatedApprenticeships = apprenticeships.filter(app => app.id !== activeApprenticeship);
    setApprenticeships(updatedApprenticeships);
    
    // Select the first apprenticeship in the list or null if empty
    setActiveApprenticeship(updatedApprenticeships[0]?.id || null);
    setShowDeleteConfirm(false);
    
    // Track analytics event
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
            {/* Apprenticeship selector */}
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
                        // If image fails to load, replace with first letter of company
                        const target = e.target as HTMLImageElement;
                        target.onerror = null; // Prevent infinite loop
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-orange-500 text-white font-bold">${app.company.charAt(0)}</div>`;
                      }}
                    />
                  </div>
                  <span className="font-medium">{app.title}</span>
                </button>
              ))}
            </div>
            
            {/* Active apprenticeship details */}
            {activeApprenticeship && (
              <div className="mb-6">
                {apprenticeships
                  .filter(app => app.id === activeApprenticeship)
                  .map(app => (
                    <div key={app.id} className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="mb-4 md:mb-0">
                        <div className="flex items-center">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{app.title}</h3>
                          <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="ml-3 text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                            aria-label="Delete apprenticeship"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex flex-wrap items-center text-gray-600 dark:text-gray-300 mt-2 gap-4">
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
                      <div className="flex items-center">
                        <span className="text-gray-700 dark:text-gray-300 mr-2">Current Stage:</span>
                        <span className="font-semibold text-orange-500">{app.status}</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
            
            {/* Timeline */}
            {activeApprenticeship && (
              <>
                <div className="relative">
                  {/* Timeline track */}
                  <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 -translate-y-1/2 rounded-full"></div>
                  
                  {/* Timeline nodes */}
                  <div className="relative flex justify-between">
                    {statusSteps.map((status, index) => {
                      const activeApp = apprenticeships.find(app => app.id === activeApprenticeship);
                      const statusIndex = statusSteps.indexOf(activeApp?.status as ApprenticeshipStatus);
                      const isActive = index === statusIndex;
                      const isCompleted = index < statusIndex;
                      const isRejection = status === 'Rejection';
                      
                      return (
                        <div key={status} className="flex flex-col items-center relative">
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
                                ? 'bg-green-500'
                                : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                          >
                            {isActive && isRejection ? (
                              <X className="w-5 h-5 text-white" />
                            ) : isCompleted ? (
                              <Check className="w-5 h-5 text-white" />
                            ) : (
                              <span className="text-white font-medium">{index + 1}</span>
                            )}
                          </motion.button>
                          
                          <span className="absolute -bottom-8 transform -translate-x-1/2 left-1/2 text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                            {status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Status update message */}
                <div className="h-8 mt-12 flex justify-center">
                  {updatingStatus && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center text-orange-500"
                    >
                      <div className="w-4 h-4 mr-2 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                      Updating status...
                    </motion.div>
                  )}
                  
                  {showSuccessMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center text-green-500"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Progress Updated!
                    </motion.div>
                  )}
                </div>
              </>
            )}
          </>
        )}
        
        <div className="mt-8 text-center">
          <Link 
            href="/apprenticeships" 
            className="inline-flex items-center text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 font-medium"
          >
            <span>APPLY TO MORE APPRENTICESHIPS</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
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
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Add New Apprenticeship
                </h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Apprenticeship Title
                  </label>
                  <input
                    type="text"
                    value={newApprenticeshipData.title}
                    onChange={(e) => setNewApprenticeshipData({...newApprenticeshipData, title: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g. Software Engineer Apprentice"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    value={newApprenticeshipData.company}
                    onChange={(e) => setNewApprenticeshipData({...newApprenticeshipData, company: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g. Google"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={newApprenticeshipData.location}
                    onChange={(e) => setNewApprenticeshipData({...newApprenticeshipData, location: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g. London"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Application Date
                  </label>
                  <input
                    type="date"
                    value={newApprenticeshipData.date}
                    onChange={(e) => setNewApprenticeshipData({...newApprenticeshipData, date: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Current Status
                  </label>
                  <select
                    value={newApprenticeshipData.status}
                    onChange={(e) => setNewApprenticeshipData({...newApprenticeshipData, status: e.target.value as ApprenticeshipStatus})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {statusSteps.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddApprenticeship}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
                >
                  Add Apprenticeship
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Delete Apprenticeship
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Are you sure you want to delete this apprenticeship? This action cannot be undone.
                </p>
              </div>
              
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteApprenticeship}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
                >
                  Delete
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
          {/* Score ring - increased size from w-32 to w-40 */}
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
              {/* Increased font size for score */}
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
              {/* Improved /100 display */}
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
        
        {/* Fixed button text to be on one line */}
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

// Component for the Edit Profile section
const EditProfileSection: React.FC<{ userData: SupabaseUserProfile }> = ({ userData }) => {
  const [formData, setFormData] = useState({
    name: userData.name || '',
    email: userData.email,
    bio: '',
    picture: userData.picture || null
  });
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    // Simulate API call
    setTimeout(() => {
      // In a real implementation, this would update the database
      setIsUpdating(false);
      setShowSuccess(true);
      
      // Track event
      Analytics.event('profile', 'update_profile');
      
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    }, 800);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mb-10"
    >
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white uppercase mb-4">
        EDIT PROFILE
      </h2>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Profile picture */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 border-2 border-orange-500 flex items-center justify-center">
                  {formData.picture ? (
                    <img 
                      src={formData.picture} 
                      alt={formData.name || 'User'} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 text-gray-400" />
                  )}
                </div>
                <button
                  type="button"
                  className="absolute bottom-0 right-0 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-2 shadow-md"
                >
                  <Upload className="w-4 h-4" />
                </button>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                PNG, JPG or GIF (max. 1MB)
              </span>
            </div>
            
            {/* Form fields */}
            <div className="flex-1 space-y-4 w-full">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Your full name"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white cursor-not-allowed"
                  disabled
                />
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                  Email cannot be changed
                </span>
              </div>
              
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Short Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Tell us a bit about yourself (e.g. Aspiring Software Engineer)"
                ></textarea>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end items-center space-x-4">
            {showSuccess && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-green-500 flex items-center"
              >
                <Check className="w-4 h-4 mr-1" />
                Profile Updated!
              </motion.span>
            )}
            <button
              type="submit"
              disabled={isUpdating}
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg flex items-center justify-center disabled:opacity-70"
            >
              {isUpdating ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

// Component for cookie preferences and accessibility settings
const PreferencesSection: React.FC = () => {
  const [cookiePreferences, setCookiePreferences] = useState({
    essential: true,
    analytics: true,
    marketing: false
  });
  
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    highContrast: false,
    largeFont: false,
    screenReader: false
  });
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const handleCookieToggle = (key: keyof typeof cookiePreferences) => {
    if (key === 'essential') return; // Essential cookies cannot be disabled
    
    setCookiePreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  const handleAccessibilityToggle = (key: keyof typeof accessibilitySettings) => {
    setAccessibilitySettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  const handleSavePreferences = () => {
    setIsUpdating(true);
    
    // Simulate API call
    setTimeout(() => {
      // In a real implementation, this would update the database and cookie settings
      setIsUpdating(false);
      setShowSuccess(true);
      
      // Track event
      Analytics.event('preferences', 'update_preferences');
      
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    }, 800);
  };
  
  const resetAccessibilitySettings = () => {
    setAccessibilitySettings({
      highContrast: false,
      largeFont: false,
      screenReader: false
    });
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="mb-10"
    >
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white uppercase mb-4">
        PREFERENCES & ACCESSIBILITY
      </h2>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Cookie Preferences */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Cookie Preferences
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Essential Cookies</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Required for the website to function
                  </p>
                </div>
                <button 
                  disabled
                  className="text-gray-400 cursor-not-allowed"
                >
                  <ToggleRight className="w-10 h-6 text-orange-500" />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Analytics Cookies</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Help us improve your experience
                  </p>
                </div>
                <button onClick={() => handleCookieToggle('analytics')}>
                  {cookiePreferences.analytics ? (
                    <ToggleRight className="w-10 h-6 text-orange-500" />
                  ) : (
                    <ToggleLeft className="w-10 h-6 text-gray-400 dark:text-gray-500" />
                  )}
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Marketing Cookies</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Show personalized content
                  </p>
                </div>
                <button onClick={() => handleCookieToggle('marketing')}>
                  {cookiePreferences.marketing ? (
                    <ToggleRight className="w-10 h-6 text-orange-500" />
                  ) : (
                    <ToggleLeft className="w-10 h-6 text-gray-400 dark:text-gray-500" />
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {/* Accessibility Options */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Accessibility Options
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">High Contrast Mode</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Increase visual contrast
                  </p>
                </div>
                <button onClick={() => handleAccessibilityToggle('highContrast')}>
                  {accessibilitySettings.highContrast ? (
                    <ToggleRight className="w-10 h-6 text-orange-500" />
                  ) : (
                    <ToggleLeft className="w-10 h-6 text-gray-400 dark:text-gray-500" />
                  )}
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Increase Font Size</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Make text larger
                  </p>
                </div>
                <button onClick={() => handleAccessibilityToggle('largeFont')}>
                  {accessibilitySettings.largeFont ? (
                    <ToggleRight className="w-10 h-6 text-orange-500" />
                  ) : (
                    <ToggleLeft className="w-10 h-6 text-gray-400 dark:text-gray-500" />
                  )}
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Screen Reader Support</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Optimize for screen readers
                  </p>
                </div>
                <button onClick={() => handleAccessibilityToggle('screenReader')}>
                  {accessibilitySettings.screenReader ? (
                    <ToggleRight className="w-10 h-6 text-orange-500" />
                  ) : (
                    <ToggleLeft className="w-10 h-6 text-gray-400 dark:text-gray-500" />
                  )}
                </button>
              </div>
              
              <button 
                onClick={resetAccessibilitySettings}
                className="text-orange-500 hover:text-orange-600 dark:text-orange-400 text-sm font-medium"
              >
                Reset to Default
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end items-center space-x-4">
          {showSuccess && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-green-500 flex items-center"
            >
              <Check className="w-4 h-4 mr-1" />
              Preferences Saved!
            </motion.span>
          )}
          <button
            onClick={handleSavePreferences}
            disabled={isUpdating}
            className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg flex items-center justify-center disabled:opacity-70"
          >
            {isUpdating ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Preferences
              </>
            )}
          </button>
        </div>
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
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Welcome section at the top */}
      <div className="mb-10">
        <GreetingSection name={userData.name} />
      </div>
      
      {/* CV Score section */}
      <CVOptimizerSection />
      
      {/* Middle: Articles Section */}
      <RecommendedResourcesSection articles={recommendedArticles} />
      
      {/* Bottom: Application Tracking Section */}
      <ApprenticeshipProgressSection apprenticeships={sampleSavedApprenticeships} />
      
      {/* Other sections - kept but now below the main required sections */}
      <EditProfileSection userData={userData} />
      
      <PreferencesSection />
    </div>
  );
};