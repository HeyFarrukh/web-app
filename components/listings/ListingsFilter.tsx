'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, BookOpen, Briefcase } from 'lucide-react';
import { vacancyService } from '@/services/supabase/vacancyService';
import { Analytics } from '@/services/analytics/analytics';
import { debounce } from '@/utils/debounce';
import { displayCategories, getDbCategory, getDisplayCategory } from '@/utils/categoryMapping';

interface ListingsFilterProps {
  onFilterChange: (filters: { search: string; location: string; level: string; category: string }) => void;
  initialFilters: { search: string; location: string; level: string; category: string };
}

export const ListingsFilter: React.FC<ListingsFilterProps> = ({ onFilterChange, initialFilters }) => {
  const [filters, setFilters] = useState(initialFilters);
  const [searchInputValue, setSearchInputValue] = useState(initialFilters.search);
  const [locations, setLocations] = useState<string[]>([]);
  const [levels, setLevels] = useState<number[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Create a debounced version of the filter change function for search
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearchChange = useCallback(
    debounce((value: string) => {
      const newFilters = { ...filters, search: value };
      setFilters(newFilters);
      
      // Track search analytics
      if (typeof window !== 'undefined' && value.length >= 3) {
        Analytics.event('search_detail', 'search_term_entered', value);
      }
      
      onFilterChange(newFilters);
    }, 500), // 500ms delay
    [filters, onFilterChange]
  );

  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        setLoading(true);
        const [availableLocations, availableLevels, availableCategories] = await Promise.all([
          vacancyService.getAvailableLocations(),
          vacancyService.getAvailableLevels(),
          vacancyService.getAvailableCategories()
        ]);
        setLocations(availableLocations);
        setLevels(availableLevels);
        setCategories(availableCategories);
      } catch (error) {
        console.error('Error loading filter options:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFilterOptions();
  }, []);

  // Handle immediate filter change for dropdown selects
  const handleFilterChange = (field: string, value: string) => {
    if (field === 'search') {
      setSearchInputValue(value);
      debouncedSearchChange(value);
    } else {
      const newValue = field === 'category' ? getDbCategory(value) : value;
      const newFilters = { ...filters, [field]: newValue };
      setFilters(newFilters);
      
      // Track specific filter interactions with more detailed analytics
      if (typeof window !== 'undefined') {
        // Only track when a value is selected (not when cleared)
        if (value) {
          if (field === 'location') {
            Analytics.event('filter_detail', 'location_selected', value);
          } else if (field === 'level') {
            Analytics.event('filter_detail', 'level_selected', value);
          } else if (field === 'category') {
            Analytics.event('filter_detail', 'category_selected', value);
          }
        } else {
          // Track when filters are cleared
          Analytics.event('filter_detail', `${field}_cleared`, 'Filter Cleared');
        }
      }
      
      onFilterChange(newFilters);
    }
  };
  
  // Handle form submission (when user presses Enter)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newFilters = { ...filters, search: searchInputValue };
    setFilters(newFilters);
    
    // Track search analytics on submit
    if (typeof window !== 'undefined' && searchInputValue.length >= 3) {
      Analytics.event('search_detail', 'search_submitted', searchInputValue);
    }
    
    onFilterChange(newFilters);
  };
  
  return (
    <div className="backdrop-blur-md bg-white/90 dark:bg-gray-800/90 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 w-full max-w-md mx-auto">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-5">Find Your Perfect Apprenticeship</h2>
      
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="relative group">
          <input
            type="text"
            placeholder="Search apprenticeships..."
            value={searchInputValue}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 font-medium transition-all duration-300 focus:ring-4 focus:ring-orange-300 dark:focus:ring-orange-800 focus:border-orange-500 hover:border-orange-300 dark:hover:border-orange-700 shadow-sm text-sm"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 dark:text-orange-400 w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
        </div>
      </form>

      <div className="space-y-4">
        <div className="relative">
          <label htmlFor="location" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <MapPin className="w-4 h-4 mr-2 text-orange-500 dark:text-orange-400" />
            Location
          </label>
          <div className="relative">
            <select
              id="location"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2.5 rounded-xl bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 disabled:opacity-50 transition-all duration-300 focus:ring-4 focus:ring-orange-300 dark:focus:ring-orange-800 focus:border-orange-500 hover:border-orange-300 dark:hover:border-orange-700 font-medium shadow-sm appearance-none text-sm"
            >
              <option value="">All Locations</option>
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="relative">
          <label htmlFor="level" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <BookOpen className="w-4 h-4 mr-2 text-orange-500 dark:text-orange-400" />
            Apprenticeship Level
          </label>
          <div className="relative">
            <select
              id="level"
              value={filters.level}
              onChange={(e) => handleFilterChange('level', e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2.5 rounded-xl bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 disabled:opacity-50 transition-all duration-300 focus:ring-4 focus:ring-orange-300 dark:focus:ring-orange-800 focus:border-orange-500 hover:border-orange-300 dark:hover:border-orange-700 font-medium shadow-sm appearance-none text-sm"
            >
              <option value="">All Levels</option>
              {levels.map(level => (
                <option key={level} value={level.toString()}>
                  Level {level}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="relative">
          <label htmlFor="category" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Briefcase className="w-4 h-4 mr-2 text-orange-500 dark:text-orange-400" />
            Category
          </label>
          <div className="relative">
            <select
              id="category"
              value={filters.category ? getDisplayCategory(filters.category) : ''}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2.5 rounded-xl bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 disabled:opacity-50 transition-all duration-300 focus:ring-4 focus:ring-orange-300 dark:focus:ring-orange-800 focus:border-orange-500 hover:border-orange-300 dark:hover:border-orange-700 font-medium shadow-sm appearance-none text-sm"
            >
              <option value="">All Categories</option>
              {displayCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center mt-4 space-x-2">
          <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse"></div>
          <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse delay-75"></div>
          <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse delay-150"></div>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400 ml-2">Loading options...</span>
        </div>
      )}
    </div>
  );
};