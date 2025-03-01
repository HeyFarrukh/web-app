'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { ListingCard } from '@/components/listings/ListingCard';
import { ListingsFilter } from '@/components/listings/ListingsFilter';
import { Pagination } from '@/components/listings/Pagination';
import { ListingType } from '@/types/listing';
import { vacancyService } from '@/services/supabase/vacancyService';
import { ListingsMap } from '@/components/listings/ListingsMap';
import { List, Map as MapIcon } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

interface FilterParams {
  search: string;
  location: string;
  level: string;
}

export default function Listings() { 
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [currentPage, setCurrentPage] = useState(() => {
    const page = searchParams.get('page');
    return page ? parseInt(page, 10) : 1;
  });

  const [listings, setListings] = useState<ListingType[]>([]); 
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const [filters, setFilters] = useState<FilterParams>({
    search: searchParams.get('search') || '',
    location: searchParams.get('location') || '',
    level: searchParams.get('level') || ''
  });

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        
        let result;
        if (viewMode === 'map') {
          // For map view, fetch all vacancies
          console.log("Fetching all vacancies for map view");
          const allVacancies = await vacancyService.getAllVacanciesForMap(filters);
          console.log(`Fetched ${allVacancies.length} vacancies for map view`);
          result = {
            vacancies: allVacancies,
            total: allVacancies.length
          };
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
      } catch (err: any) {
        setError('Failed to fetch apprenticeships. Please try again later.');
        console.error('Error fetching listings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, [currentPage, filters, viewMode]);

  const createQueryString = (params: Record<string, string>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
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
    const queryString = createQueryString({ page: newPage.toString() });
    router.push(`${pathname}?${queryString}`, { scroll: false });
  };

  const handleFilterChange = (newFilters: FilterParams) => {
    setFilters(newFilters);
    setCurrentPage(1);
    const queryString = createQueryString({
      ...newFilters,
      page: '1',
    });
    router.push(`${pathname}?${queryString}`, { scroll: false });
  };

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-0">
            Available Apprenticeships
          </h1>
          <div className="flex items-center">
            <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-l-lg ${viewMode === 'list' ? 'bg-orange-500 text-white' : 'text-gray-600 dark:text-gray-300'}`}
                aria-label="List View"
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-2 rounded-r-lg ${viewMode === 'map' ? 'bg-orange-500 text-white' : 'text-gray-600 dark:text-gray-300'}`}
                aria-label="Map View"
              >
                <MapIcon className="w-5 h-5" />
              </button>
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
                {totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="mb-8">
                {loading ? (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 h-[500px] animate-pulse">
                    <div className="h-full bg-gray-200 dark:bg-gray-700 rounded-lg" />
                  </div>
                ) : listings.length > 0 ? (
                  <>
                    <ListingsMap listings={listings} />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
                      Showing {listings.length} of {totalItems} apprenticeships. 
                      {totalItems > 100 && ' Zoom in or apply filters to see more specific results.'}
                    </p>
                  </>
                ) : (
                  <div className="text-center py-12 text-gray-600 dark:text-gray-400">
                    No apprenticeships found matching your criteria.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}