/**
 * Type definitions for apprenticeship listings
 */

/**
 * Represents an apprenticeship listing
 * This interface defines the structure that both the API and frontend should follow
 */
export interface ListingType {
  id: string;              // Unique identifier
  company: string;         // Company name
  logo: string;           // URL to company logo
  title: string;          // Job title
  location: string;       // Job location
  type: string;          // Apprenticeship type (e.g., "Level 3", "Degree")
  description: string;    // Full job description
  salary?: {             // Salary information
    min: number;         // Minimum salary
    max: number;         // Maximum salary
    currency: string;    // Currency code (e.g., "GBP")
    period: string;      // Pay period (e.g., "annual", "monthly")
  };
  requirements?: string[]; // List of requirements/qualifications
  benefits?: string[];    // List of benefits
  skills?: {             // Required and desired skills
    required: string[];
    preferred: string[];
  };
  postedDate: string;    // ISO date string when listing was posted
  applicationDeadline?: string; // ISO date string for application deadline
  status: 'active' | 'filled' | 'expired'; // Current status of the listing
  applicationUrl?: string; // Direct application URL
  contactEmail?: string;  // Contact email for queries
  metadata?: {           // Additional metadata
    views: number;       // Number of views
    applications: number; // Number of applications
    lastModified: string; // ISO date string of last modification
  };
}

/**
 * Represents the response from the listings API
 */
export interface ListingsResponse {
  data: ListingType[];   // Array of listings
  total: number;         // Total number of listings
  page: number;          // Current page number
  limit: number;         // Items per page
  filters?: {           // Applied filters
    search?: string;
    location?: string;
    type?: string;
    salary_min?: number;
    salary_max?: number;
  };
}