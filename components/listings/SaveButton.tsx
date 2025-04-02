'use client';

import React, { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { savedApprenticeshipService } from '@/services/supabase/savedApprenticeshipService';
import { Analytics } from '@/services/analytics/analytics';
import { savedApprenticeshipEvents, APPRENTICESHIP_UNSAVED, APPRENTICESHIP_SAVED, ALL_APPRENTICESHIPS_REMOVED } from '@/services/events/savedApprenticeshipEvents';

interface SaveButtonProps {
  vacancyId: string; // This is now the slug, keeping prop name for backward compatibility
  className?: string;
}

export const SaveButton: React.FC<SaveButtonProps> = ({ vacancyId: slug, className = '' }) => {
  const { isAuthenticated, userData, isLoading } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSavedStatus = async () => {
      if (isAuthenticated && userData) {
        setIsCheckingStatus(true);
        const saved = await savedApprenticeshipService.isApprenticeshipSaved(userData.id, slug);
        setIsSaved(saved);
        setIsCheckingStatus(false);
      } else {
        setIsCheckingStatus(false);
      }
    };

    if (!isLoading) {
      checkSavedStatus();
    }
  }, [isAuthenticated, userData, slug, isLoading]);

  // Listen for save/unsave events to keep state in sync across components
  useEffect(() => {
    // Subscribe to unsave events
    const unsaveListener = savedApprenticeshipEvents.on(APPRENTICESHIP_UNSAVED, (id) => {
      if (id === slug) {
        console.log(`[SaveButton] Received unsave event for vacancy ${id}`);
        setIsSaved(false);
      }
    });
    
    // Subscribe to save events
    const saveListener = savedApprenticeshipEvents.on(APPRENTICESHIP_SAVED, (id) => {
      if (id === slug) {
        console.log(`[SaveButton] Received save event for vacancy ${id}`);
        setIsSaved(true);
      }
    });
    
    // Subscribe to "remove all" events
    const removeAllListener = savedApprenticeshipEvents.on(ALL_APPRENTICESHIPS_REMOVED, () => {
      console.log(`[SaveButton] Received remove all event, resetting save status for ${slug}`);
      setIsSaved(false);
    });
    
    // Cleanup subscriptions when component unmounts
    return () => {
      unsaveListener();
      saveListener();
      removeAllListener();
    };
  }, [slug]); // Only re-subscribe if slug changes

  const handleSaveClick = async () => {
    if (!isAuthenticated) {
      // Simplify the approach - temporarily store the slug of what the user was trying to save
      // We'll look it up after authentication
      if (typeof window !== 'undefined') {
        // Store just the vacancy slug in different storage mechanisms for reliability
        localStorage.setItem('save_after_auth', slug);
        sessionStorage.setItem('save_after_auth', slug);
        console.log('[SaveButton] Stored vacancy slug for post-auth saving:', slug);
      }
      
      Analytics.event('user_action', 'save_attempt_unauthenticated');
      router.push('/signin');
      return;
    }

    if (!userData) return;

    try {
      if (isSaved) {
        // Unsave the apprenticeship
        const success = await savedApprenticeshipService.unsaveApprenticeship(userData.id, slug);
        if (success) {
          setIsSaved(false);
          Analytics.event('user_action', 'apprenticeship_unsaved');
          // Emit event for other components to update
          savedApprenticeshipEvents.emit(APPRENTICESHIP_UNSAVED, slug);
        }
      } else {
        // Save the apprenticeship
        const success = await savedApprenticeshipService.saveApprenticeship(userData.id, slug);
        if (success) {
          setIsSaved(true);
          Analytics.event('user_action', 'apprenticeship_saved');
          // Emit event for other components to update
          savedApprenticeshipEvents.emit(APPRENTICESHIP_SAVED, slug);
        }
      }
    } catch (error) {
      console.error('Error toggling save status:', error);
    }
  };

  return (
    <button
      onClick={handleSaveClick}
      className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${className}`}
      aria-label={isSaved ? 'Unsave apprenticeship' : 'Save apprenticeship'}
      disabled={isCheckingStatus}
    >
      {isSaved ? (
        <BookmarkCheck className="w-5 h-5 text-orange-500" />
      ) : (
        <Bookmark className="w-5 h-5 text-gray-500 hover:text-orange-500" />
      )}
    </button>
  );
};