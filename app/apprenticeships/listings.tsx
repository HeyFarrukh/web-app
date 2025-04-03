'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { ListingCard } from '@/components/listings/ListingCard';
import { ListingsFilter } from '@/components/listings/ListingsFilter';
import { Pagination } from '@/components/listings/Pagination';
import { ListingType } from '@/types/listing';
import { vacancyService } from '@/services/supabase/vacancyService';
import { ListingsMap } from '@/components/listings/ListingsMap';
import { List, Map as MapIcon, MapPin } from 'lucide-react';
import { ApprenticeshipListingsTracker } from '@/components/pages/ApprenticeshipListingsTracker';
import { Analytics } from '@/services/analytics/analytics';
import { PulseAnimation } from '@/components/ui/PulseAnimation';
import { Info } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

interface FilterParams {
  search: string;
  location: string;
  level: string;
  category: string;
}

export default function Listings() { 
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [currentPage, setCurrentPage] = useState(() => {
    const page = searchParams?.get('page');
    return page ? parseInt(page, 10) : 1;
  });

  const [listings, setListings] = useState<ListingType[]>([]); 
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>(() => {
    return searchParams?.get('view') === 'map' ? 'map' : 'list';
  });
  const [filters, setFilters] = useState<FilterParams>({
    search: searchParams?.get('search') || '',
    location: searchParams?.get('location') || '',
    level: searchParams?.get('level') || '',
    category: searchParams?.get('category') || ''
  });
  const [showMapAnimation, setShowMapAnimation] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000; // 2 seconds

  // Track view mode changes
  const handleViewModeChange = (mode: 'list' | 'map') => {
    if (typeof window !== 'undefined') {
      Analytics.event('ui_interaction', 'view_mode_change', mode);
    }
    setViewMode(mode);
    
    // Update URL with view mode
    const queryString = createQueryString({
      ...filters,
      page: currentPage.toString(),
      view: mode
    });
    router.push(`${pathname}?${queryString}`, { scroll: false });
    
    // If user switches to map view, don't show the animation anymore
    if (mode === 'map') {
      setShowMapAnimation(false);
      // Mark as seen in localStorage to prevent showing again
      if (typeof window !== 'undefined') {
        localStorage.setItem('feature-hint-map-view', 'true');
      }
    }
  };

  // Enhanced filter change handler with analytics
  const handleFilterChange = (newFilters: FilterParams) => {
    setFilters(newFilters);
    setCurrentPage(1);
    
    // Track filter changes
    if (typeof window !== 'undefined') {
      // Track search term if present
      if (newFilters.search) {
        Analytics.event('search', 'apprenticeship_search', newFilters.search);
      }
      
      // Track location filter if present
      if (newFilters.location) {
        Analytics.event('filter', 'location_filter', newFilters.location);
      }
      
      // Track level filter if present
      if (newFilters.level) {
        Analytics.event('filter', 'level_filter', newFilters.level);
      }
      // Track category filter if present
      if (newFilters.category) {
        Analytics.event('filter', 'category_filter', newFilters.category);
      }
    }
    
    const queryString = createQueryString({
      ...newFilters,
      page: '1',
      view: viewMode
    });
    router.push(`${pathname}?${queryString}`, { scroll: false });
  };

  useEffect(() => {
    const fetchListings = async (attempt = 0) => {
      let fetchError = false;
      try {
        setLoading(true);
        
        let result;
        if (viewMode === 'map') {
          // Only fetch for map view if a category is selected
          if (filters.category) {
            const vacancies = await vacancyService.getAllVacanciesForMap(filters);
            result = { vacancies, total: vacancies.length };
          } else {
            // Return empty result if no category selected
            result = { vacancies: [], total: 0 };
          }
        } else {
          // For list view, use pagination
          result = await vacancyService.getVacancies({
            page: currentPage,
            pageSize: ITEMS_PER_PAGE,
            filters,
          });
        }

        setListings(result.vacancies);
        setTotalItems(result.total);
        setError(null);
        setRetryCount(0); // Reset retry count on success
      } catch (err: any) {
        fetchError = true;
        console.error('Error fetching listings:', err);
        
        if (attempt < MAX_RETRIES) {
          // Set error message to show we're retrying
          setError(`Failed to fetch apprenticeships. Retrying in ${RETRY_DELAY/1000} seconds... (Attempt ${attempt + 1}/${MAX_RETRIES})`);
          
          // Wait for RETRY_DELAY milliseconds before retrying
          setTimeout(() => {
            fetchListings(attempt + 1);
          }, RETRY_DELAY);
        } else {
          setError(
            `We're sorry! We couldn't fetch apprenticeship listings after multiple attempts. 
             Please try again later or contact us at feedback@apprenticewatch.com for assistance.`
          );
          setRetryCount(0); // Reset retry count
        }
      } finally {
        if (attempt === MAX_RETRIES || !fetchError) {
          setLoading(false);
        }
      }
    };

    fetchListings();
  }, [currentPage, filters, viewMode]);

  // Handle scrolling to specific listing when returning from detail page
  useEffect(() => {
    if (!loading) {
      const scrollToId = searchParams?.get('scrollToId');
      if (scrollToId) {
        setTimeout(() => {
          const element = document.getElementById(`listing-${scrollToId}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 300); // Small delay to ensure the DOM is fully rendered
      }
    }
  }, [loading, searchParams]);

  const createQueryString = (params: Record<string, string>) => {
    const newSearchParams = new URLSearchParams(searchParams?.toString() || '');
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newSearchParams.set(key, value);
      } else {
        newSearchParams.delete(key);
      }
    });
    return newSearchParams.toString();
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    const queryString = createQueryString({ 
      ...filters,
      page: newPage.toString(),
      view: viewMode
    });
    router.push(`${pathname}?${queryString}`, { scroll: false });
    
    // Scroll to the top of the page with smooth scrolling
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
      <ApprenticeshipListingsTracker />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-0">
              Available Apprenticeships
            </h1>
            {currentPage > 1 && (
              <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base mt-1">
                Page {currentPage} of {totalPages}
              </p>
            )}
          </div>
          <div className="flex items-center mt-4 sm:mt-0">
            <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <button
                onClick={() => handleViewModeChange('list')}
                className={`p-2 rounded-l-lg ${viewMode === 'list' ? 'bg-orange-500 text-white' : 'text-gray-600 dark:text-gray-300'}`}
                aria-label="List View"
              >
                <List className="w-5 h-5" />
              </button>
              {viewMode === 'list' && showMapAnimation ? (
                <PulseAnimation persistKey="map-view">
                  <button
                    onClick={() => handleViewModeChange('map')}
                    className="p-2 rounded-r-lg text-gray-600 dark:text-gray-300 hover:text-orange-500 transition-colors"
                    aria-label="Map View"
                  >
                    <MapIcon className="w-5 h-5" />
                  </button>
                </PulseAnimation>
              ) : (
                <button
                  onClick={() => handleViewModeChange('map')}
                  className="p-2 rounded-r-lg text-gray-600 dark:text-gray-300 hover:text-orange-500 transition-colors"
                  aria-label="Map View"
                >
                  <MapIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 lg:sticky lg:top-24 lg:self-start">
            <ListingsFilter onFilterChange={handleFilterChange} initialFilters={filters} />
          </div>
          <div className="lg:col-span-3">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6">
                {error}
              </div>
            )}
            
            {viewMode === 'list' ? (
              <>
                <div className="space-y-6 mb-8">
                  {loading ? (
                    <div className="space-y-6">
                      {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
                        <div
                          key={i}
                          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-pulse"
                        >
                          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                        </div>
                      ))}
                    </div>
                  ) : listings.length > 0 ? (
                    listings.map((listing) => (
                      <ListingCard key={listing.id} listing={listing} />
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-600 dark:text-gray-400">
                      No apprenticeships found matching your criteria.
                    </div>
                  )}
                </div>
                {totalItems > ITEMS_PER_PAGE && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={currentPage}
                      totalItems={totalItems}
                      itemsPerPage={ITEMS_PER_PAGE}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg h-[500px] relative">
                  {loading ? (
                    <div className="h-full animate-pulse">
                      <div className="h-full bg-gray-200 dark:bg-gray-700 rounded-lg" />
                    </div>
                  ) : (
                    <>
                      <ListingsMap listings={listings} />
                      {!filters.category && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                          <div className="text-center p-4">
                            <MapPin className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Please Select a Category</h3>
                            <p className="text-gray-600 dark:text-gray-300 mt-1">
                            Select a category from the filters above or our poor little map might overheat and explode 🫠🔥
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
                {listings.length > 0 && filters.category && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
                    Showing {listings.length} of {totalItems} apprenticeships. 
                    {totalItems > 100 && ' Zoom in or apply filters to see more specific results.'}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}