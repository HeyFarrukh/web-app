/**
 * Custom hook for managing listings data and state
 */

import { useState, useEffect } from 'react';
import { ListingType } from '../types/listing';
import { listingsApi } from '../services/api/listings';

interface UseListingsParams {
  initialPage?: number;
  limit?: number;
  filters?: {
    search?: string;
    location?: string;
    industry?: string;
  };
}

export const useListings = ({ 
  initialPage = 1, 
  limit = 10,
  filters = {} 
}: UseListingsParams = {}) => {
  const [listings, setListings] = useState<ListingType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(initialPage);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const response = await listingsApi.getListings({
          page,
          limit,
          ...filters
        });
        setListings(response.data);
        setTotal(response.total);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch listings'));
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [page, limit, JSON.stringify(filters)]);

  return {
    listings,
    loading,
    error,
    page,
    setPage,
    total,
    hasMore: page * limit < total
  };
};