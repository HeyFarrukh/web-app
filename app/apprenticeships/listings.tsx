'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { ListingCard } from '@/components/listings/ListingCard';
import { ListingsFilter } from '@/components/listings/ListingsFilter';
import { Pagination } from '@/components/listings/Pagination';
import { ListingType } from '@/types/listing';
import { vacancyService } from '@/services/supabase/vacancyService';

const ITEMS_PER_PAGE = 10;

interface FilterParams {
  search: string;
  location: string;
  level: string;
}

export default function Apprenticeships() { // This is now a named export
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Initialize state from URL params *once* on component mount.
  const [currentPage, setCurrentPage] = useState(() => {
    const page = searchParams.get('page');
    return page ? parseInt(page, 10) : 1;
  });

  const [listings, setListings] = useState<ListingType[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize filters from URL params *once* on component mount.
  const [filters, setFilters] = useState<FilterParams>({
    search: searchParams.get('search') || '',
    location: searchParams.get('location') || '',
    level: searchParams.get('level') || ''
  });

  // Consolidated useEffect for fetching data
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const result = await vacancyService.getVacancies({
          page: currentPage,
          pageSize: ITEMS_PER_PAGE,
          filters,
        });

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
  }, [currentPage, filters]);

  // Function to construct the query string
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

  // Handle page changes
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    const queryString = createQueryString({ page: newPage.toString() });
    router.push(`${pathname}?${queryString}`, { scroll: false });
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: FilterParams) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to page 1 when filters change
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Available Apprenticeships
        </h1>
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
          </div>
        </div>
      </div>
    </div>
  );
}