import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { ListingCard } from '../components/listings/ListingCard';
import { ListingsFilter } from '../components/listings/ListingsFilter';
import { Pagination } from '../components/listings/Pagination';
import { ListingType } from '../types/listing';
import { vacancyService } from '../supabase/vacancyService'; // CORRECT IMPORT PATH!
// import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore'; // REMOVE Firebase imports

const ITEMS_PER_PAGE = 10; // Changed to 10 to match your requirement

export const Listings = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [listings, setListings] = useState<ListingType[]>([]);
  const [totalItems, setTotalItems] = useState(0); // Will now hold total count from Supabase
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null); // REMOVE Firebase lastDoc
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    level: ''
  });

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const result = await vacancyService.getVacancies({ // Use vacancyService from Supabase!
          page: currentPage,
          pageSize: ITEMS_PER_PAGE,
          filters: filters
        });

        setListings(result.vacancies);
        setTotalItems(result.total); // Total count is directly from Supabase now
        // setLastDoc(result.lastDoc); // No need for lastDoc with Supabase pagination
        setError(null);
      } catch (err) {
        setError('Failed to fetch apprenticeships. Please try again later.');
        console.error('Error fetching listings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [currentPage, filters]);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
    // setLastDoc(null); // No need to reset lastDoc - Supabase pagination is offset-based
  };

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  return (
    <>
      <Helmet>
        <title>Apprenticeship Listings | ApprenticeWatch - Find Your Perfect Opportunity</title>
        <meta
          name="description"
          content="Browse the latest apprenticeship opportunities from top UK companies. Filter by location, industry, and more to find your perfect apprenticeship match."
        />
      </Helmet>

      <div className="min-h-screen pt-24 pb-12 bg-gradient-to-b from-orange-50  dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Available Apprenticeships
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <ListingsFilter onFilterChange={handleFilterChange} />
            </div>

            <div className="lg:col-span-3">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6">
                  {error}
                </div>
              )}

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
                <>
                  <div className="space-y-6 mb-8">
                    {listings.map((listing) => (
                      <ListingCard
                        key={listing.id}
                        listing={listing}
                      />
                    ))}
                  </div>

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
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};