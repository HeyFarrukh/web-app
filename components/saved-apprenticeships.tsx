"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ListingCard } from "@/components/listings/ListingCard";
import { ListingType } from "@/types/listing";
import { savedApprenticeshipService } from "@/services/supabase/savedApprenticeshipService";
import { useAuth } from "@/hooks/useAuth";
import { useAuthProtection } from "@/hooks/useAuthProtection";
import { Bookmark, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  savedApprenticeshipEvents,
  APPRENTICESHIP_UNSAVED,
  ALL_APPRENTICESHIPS_REMOVED,
} from "@/services/events/savedApprenticeshipEvents";

export default function SavedApprenticeships() {
  const { userData, isLoading: authLoading } = useAuth();
  const { isAuthenticated } = useAuthProtection();
  const [savedListings, setSavedListings] = useState<ListingType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRemoveAllDialog, setShowRemoveAllDialog] = useState(false);
  const [showRemoveSingleDialog, setShowRemoveSingleDialog] = useState(false);
  const [selectedVacancySlug, setSelectedVacancySlug] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const fetchSavedApprenticeships = async () => {
      if (userData) {
        setLoading(true);
        const listings =
          await savedApprenticeshipService.getSavedApprenticeships(userData.id);
        setSavedListings(listings);
        setLoading(false);
      }
    };

    if (!authLoading && isAuthenticated && userData) {
      fetchSavedApprenticeships();
    }
  }, [isAuthenticated, userData, authLoading]);

  const handleDeleteConfirm = async () => {
    if (!userData || !selectedVacancySlug) return;

    try {
      const success = await savedApprenticeshipService.unsaveApprenticeship(
        userData.id,
        selectedVacancySlug
      );
      if (success) {
        setSavedListings((prevListings) =>
          prevListings.filter((listing) => listing.slug !== selectedVacancySlug)
        );
        setShowRemoveSingleDialog(false);
        // Emit event that this apprenticeship was unsaved
        savedApprenticeshipEvents.emit(
          APPRENTICESHIP_UNSAVED,
          selectedVacancySlug
        );
      } else {
        throw new Error("Failed to delete saved apprenticeship");
      }
    } catch (error) {
      console.error("Error deleting saved apprenticeship:", error);
      // Show error to the user
      alert(
        error instanceof Error
          ? error.message
          : "Error deleting saved apprenticeship"
      );
    }
  };

  const promptDeleteSingle = (vacancySlug: string) => {
    setSelectedVacancySlug(vacancySlug);
    setShowRemoveSingleDialog(true);
  };

  const handleDeleteAll = async () => {
    if (!userData) return;

    try {
      const success =
        await savedApprenticeshipService.removeAllSavedApprenticeships(
          userData.id
        );
      if (success) {
        // Store the slugs of all listings that were removed
        const removedSlugs = savedListings.map((listing) => listing.slug);

        // Clear the listings
        setSavedListings([]);
        setShowRemoveAllDialog(false);

        // Emit events for each removed listing
        removedSlugs.forEach((slug) => {
          savedApprenticeshipEvents.emit(APPRENTICESHIP_UNSAVED, slug);
        });

        // Also emit the 'all removed' event
        savedApprenticeshipEvents.emit(ALL_APPRENTICESHIPS_REMOVED, "");
      } else {
        throw new Error("Failed to remove all saved apprenticeships");
      }
    } catch (error) {
      console.error("Error removing all saved apprenticeships:", error);
      // Show error to the user
      alert(
        error instanceof Error
          ? error.message
          : "Error removing all saved apprenticeships"
      );
    }
  };

  if (authLoading || loading) {
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
              onClick={() => router.push("/apprenticeships")}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              aria-label="Browse apprenticeships"
            >
              Browse Apprenticeships
            </button>
          </div>
        ) : (
          <div>
            <div className="flex justify-end mb-6">
              <button
                onClick={() => setShowRemoveAllDialog(true)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                Remove All
              </button>
            </div>
            <div className="space-y-6">
              {savedListings.map((listing) => (
                <div key={listing.slug} className="relative">
                  <button
                    onClick={() => promptDeleteSingle(listing.slug)}
                    className="absolute top-4 right-4 z-10 p-2 bg-white dark:bg-gray-700 rounded-full shadow-md hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                    aria-label="Delete saved apprenticeship"
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </button>
                  <ListingCard
                    listing={listing}
                    hideSaveButton={true}
                    customLinkUrl={`/apprenticeships/${listing.slug}?fromPage=saved&scrollToId=${listing.slug}&fromSaved=true`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Remove All Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showRemoveAllDialog}
          title="Remove All Saved Apprenticeships"
          message="Are you sure you want to remove all saved apprenticeships? This action cannot be undone."
          confirmLabel="Remove All"
          cancelLabel="Cancel"
          variant="danger"
          onConfirm={handleDeleteAll}
          onCancel={() => setShowRemoveAllDialog(false)}
        />

        {/* Remove Single Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showRemoveSingleDialog}
          title="Remove Saved Apprenticeship"
          message="Are you sure you want to remove this apprenticeship from your saved list?"
          confirmLabel="Remove"
          cancelLabel="Cancel"
          variant="danger"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowRemoveSingleDialog(false)}
        />
      </div>
    </div>
  );
}
