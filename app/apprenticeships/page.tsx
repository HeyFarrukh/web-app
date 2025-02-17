'use client';

import React, { useState, useEffect, Suspense } from 'react'; // Remove Suspense import if not used directly here
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { ListingCard } from '@/components/listings/ListingCard';
import { ListingsFilter } from '@/components/listings/ListingsFilter';
import { Pagination } from '@/components/listings/Pagination';
import { ListingType } from '@/types/listing';
import { vacancyService } from '@/services/supabase/vacancyService';

const ITEMS_PER_PAGE = 10;

function ApprenticeshipsContent() { //Separate Component
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [currentPage, setCurrentPage] = useState(() => {
      const page = searchParams.get('page');
      return page ? parseInt(page) : 1;
    });

    const [listings, setListings] = useState<ListingType[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState({
      search: searchParams.get('search') || '',
      location: searchParams.get('location') || '',
      level: searchParams.get('level') || ''
    });

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

    // Fetch listings
    const fetchListings = async () => {
      try {
        setLoading(true);
        const result = await vacancyService.getVacancies({
          page: currentPage,
          pageSize: ITEMS_PER_PAGE,
          filters: filters
        });

        setListings(result.vacancies);
        setTotalItems(result.total);
        setError(null);
      } catch (err) {
        setError('Failed to fetch apprenticeships. Please try again later.');
        console.error('Error fetching listings:', err);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchListings();
    }, [currentPage, filters]);

    useEffect(() => {
      const queryString = createQueryString({ page: currentPage.toString() });
      router.push(`${pathname}?${queryString}`, { scroll: false });
    }, [currentPage, pathname, router, searchParams]); //added searchParams to dependecy array

    const handlePageChange = (pageNumber: number) => {
      setCurrentPage(pageNumber);
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    };

    const handleFilterChange = (newFilters: typeof filters) => {
      setCurrentPage(1);
      setFilters(newFilters);
      const queryString = createQueryString({
        ...newFilters,
        page: '1'
      });
      router.push(`${pathname}?${queryString}`);
    };

    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    return (
        <>
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
            ) : (
              listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))
            )}

            {listings.length === 0 && !loading && (
              <div className="text-center py-12 text-gray-600 dark:text-gray-400">
                No apprenticeships found matching your criteria.
              </div>
            )}

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
      </>
    )

}

export default function Apprenticeships() {
    return(
        <div className="min-h-screen pt-24 pb-12 bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Available Apprenticeships
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1 lg:sticky lg:top-24 lg:self-start">
              <ListingsFilter onFilterChange={() => {}} initialFilters={{search: '', location: '', level: ''}} />
            </div>
            <div className="lg:col-span-3">
            <Suspense fallback={<div>Loading...</div>}>
                <ApprenticeshipsContent />
              </Suspense>
            </div>
            </div>
          </div>
        </div>
    )
}