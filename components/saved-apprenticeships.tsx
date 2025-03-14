'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ListingCard } from '@/components/listings/ListingCard';
import { ListingType } from '@/types/listing';
import { savedApprenticeshipService } from '@/services/supabase/savedApprenticeshipService';
import { useAuth } from '@/hooks/useAuth';
import { Bookmark, Trash2 } from 'lucide-react';

export default function SavedApprenticeships() {
  const { isAuthenticated, userData, isLoading } = useAuth();
  const [savedListings, setSavedListings] = useState<ListingType[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSavedApprenticeships = async () => {
      if (userData) {
        setLoading(true);
        const listings = await savedApprenticeshipService.getSavedApprenticeships(userData.id);
        setSavedListings(listings);
        setLoading(false);
      }
    };

    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/signin?redirect=/saved-apprenticeships');
      } else {
        fetchSavedApprenticeships();
      }
    }
  }, [isAuthenticated, userData, isLoading, router]);

  const handleDelete = async (vacancyId: string) => {
    if (!userData) return;
    
    try {
      const success = await savedApprenticeshipService.unsaveApprenticeship(userData.id, vacancyId);
      if (success) {
        setSavedListings(prevListings => prevListings.filter(listing => listing.id !== vacancyId));
      }
    } catch (error) {
      console.error('Error deleting saved apprenticeship:', error);
    }
  };

  const handleDeleteAll = async () => {
    if (!userData) return;
    
    try {
      const success = await savedApprenticeshipService.removeAllSavedApprenticeships(userData.id);
      if (success) {
        setSavedListings([]);
      }
    } catch (error) {
      console.error('Error removing all saved apprenticeships:', error);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Saved Apprenticeships
          </h1>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Saved Apprenticeships
        </h1>

        {savedListings.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
            <Bookmark className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              No saved apprenticeships yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Save apprenticeships you're interested in to view them later.
            </p>
            <button
              onClick={() => router.push('/apprenticeships')}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Browse Apprenticeships
            </button>
          </div>
        ) : (
          <div>
            <div className="flex justify-end mb-6">
              <button
                onClick={handleDeleteAll}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                Remove All
              </button>
            </div>
            <div className="space-y-6">
              {savedListings.map((listing) => (
                <div key={listing.id} className="relative">
                  <button 
                    onClick={() => handleDelete(listing.id)}
                    className="absolute top-4 right-4 z-10 p-2 bg-white dark:bg-gray-700 rounded-full shadow-md hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                    aria-label="Delete saved apprenticeship"
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </button>
                  <ListingCard 
                    listing={listing} 
                    hideSaveButton={true} 
                    customLinkUrl={`/apprenticeships/${listing.id}?fromPage=saved&scrollToId=${listing.id}&fromSaved=true`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
