'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { ListingCard } from './ListingCard';
import { ListingsFilter } from './ListingsFilter';
import { Pagination } from './Pagination';
import { ListingType } from '@/types/listing';
import { vacancyService } from '@/services/supabase/vacancyService';

const ITEMS_PER_PAGE = 10;

interface FilterParams {
  search: string;
  location: string;
  level: string;
  category: string;
}

export const Listings = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  // Initialize state from URL parameters
  const [currentPage, setCurrentPage] = useState(() => {
    const page = searchParams?.get('page');
    return page ? parseInt(page) : 1;
  });
  
  const [listings, setListings] = useState<ListingType[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterParams>({
    search: searchParams?.get('search') || '',
    location: searchParams?.get('location') || '',
    level: searchParams?.get('level') || '',
    category: searchParams?.get('category') || ''
  });

  // Create a function to update URL and maintain state
  const createQueryString = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    
    // Update or remove parameters
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    
    return params.toString();
  };

  // Fetch listings when page or filters change
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await vacancyService.getVacancies({
          page: currentPage,
          pageSize: ITEMS_PER_PAGE,
          filters
        });

        setListings(result.vacancies);
        setTotalItems(result.total);
      } catch (err) {
        console.error('Error fetching listings:', err);
        setError('Failed to fetch apprenticeships. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [currentPage, filters]);

  // Update URL when page or filters change
  useEffect(() => {
    const queryString = createQueryString({
      page: currentPage.toString(),
      ...filters
    });
    router.push(`${pathname}?${queryString}`, { scroll: false });
  }, [currentPage, filters, pathname, router]);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (newFilters: FilterParams) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to page 1 when filters change
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ListingsFilter onFilterChange={handleFilterChange} initialFilters={filters} />
      
      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {listings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No apprenticeships found matching your criteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
          
          {totalItems > ITEMS_PER_PAGE && (
            <Pagination
              currentPage={currentPage}
              totalItems={totalItems}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
};