'use client';

import React, { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { savedApprenticeshipService } from '@/services/supabase/savedApprenticeshipService';
import { Analytics } from '@/services/analytics/analytics';

interface SaveButtonProps {
  vacancyId: string;
  className?: string;
}

export const SaveButton: React.FC<SaveButtonProps> = ({ vacancyId, className = '' }) => {
  const { isAuthenticated, userData, isLoading } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSavedStatus = async () => {
      if (isAuthenticated && userData) {
        setIsCheckingStatus(true);
        const saved = await savedApprenticeshipService.isApprenticeshipSaved(userData.id, vacancyId);
        setIsSaved(saved);
        setIsCheckingStatus(false);
      } else {
        setIsCheckingStatus(false);
      }
    };

    if (!isLoading) {
      checkSavedStatus();
    }
  }, [isAuthenticated, userData, vacancyId, isLoading]);

  const handleSaveClick = async () => {
    if (!isAuthenticated) {
      // Simplify the approach - temporarily store the ID of what the user was trying to save
      // We'll look it up after authentication
      if (typeof window !== 'undefined') {
        // Store just the vacancy ID in different storage mechanisms for reliability
        localStorage.setItem('save_after_auth', vacancyId);
        sessionStorage.setItem('save_after_auth', vacancyId);
        console.log('[SaveButton] Stored vacancy ID for post-auth saving:', vacancyId);
      }
      
      Analytics.event('user_action', 'save_attempt_unauthenticated');
      router.push('/signin');
      return;
    }

    if (!userData) return;

    try {
      if (isSaved) {
        // Unsave the apprenticeship
        const success = await savedApprenticeshipService.unsaveApprenticeship(userData.id, vacancyId);
        if (success) {
          setIsSaved(false);
          Analytics.event('user_action', 'apprenticeship_unsaved');
        }
      } else {
        // Save the apprenticeship
        const success = await savedApprenticeshipService.saveApprenticeship(userData.id, vacancyId);
        if (success) {
          setIsSaved(true);
          Analytics.event('user_action', 'apprenticeship_saved');
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