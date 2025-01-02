/**
 * Listings API Service
 * 
 * This service handles all API calls related to apprenticeship listings.
 * 
 * Expected API Response Format:
 * {
 *   data: Array<ListingType>,
 *   total: number,
 *   page: number,
 *   limit: number
 * }
 * 
 * API Endpoints:
 * - GET /listings - List all apprenticeships with filtering
 * - GET /listings/:id - Get specific apprenticeship details
 * - POST /listings - Create new listing (requires auth)
 * - PUT /listings/:id - Update listing (requires auth)
 * - DELETE /listings/:id - Delete listing (requires auth)
 */

import { ListingType } from '../../types/listing';

const API_BASE_URL = process.env.VITE_API_BASE_URL || 'https://api.apprenticewatch.com';

/**
 * API service for handling apprenticeship listings
 */
export const listingsApi = {
  /**
   * Fetch listings with optional filtering
   * @param params - Query parameters for filtering listings
   * @returns Promise with listings data and total count
   */
  getListings: async (params: {
    page?: number;        // Page number for pagination
    limit?: number;       // Items per page
    search?: string;      // Search query
    location?: string;    // Location filter
    industry?: string;    // Industry filter
    salary_min?: number;  // Minimum salary
    salary_max?: number;  // Maximum salary
    type?: string;        // Apprenticeship type (e.g., "Level 3", "Degree")
    sort?: string;        // Sort field (e.g., "posted_date", "salary")
    order?: 'asc' | 'desc'; // Sort order
  }): Promise<{ 
    data: ListingType[]; 
    total: number;
    page: number;
    limit: number;
  }> => {
    const queryParams = new URLSearchParams(params as any).toString();
    const response = await fetch(`${API_BASE_URL}/listings?${queryParams}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch listings');
    }
    
    return response.json();
  },

  /**
   * Fetch a single listing by ID
   * @param id - Listing ID
   * @returns Promise with listing details
   */
  getListing: async (id: string): Promise<ListingType> => {
    const response = await fetch(`${API_BASE_URL}/listings/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch listing');
    }
    
    return response.json();
  },

  /**
   * Create a new listing (requires authentication)
   * @param listing - New listing data
   * @returns Promise with created listing
   */
  createListing: async (listing: Omit<ListingType, 'id'>): Promise<ListingType> => {
    const response = await fetch(`${API_BASE_URL}/listings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify(listing)
    });
    
    if (!response.ok) {
      throw new Error('Failed to create listing');
    }
    
    return response.json();
  }
};