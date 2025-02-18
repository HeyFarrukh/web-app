'use client';

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { vacancyService } from '@/services/supabase/vacancyService';

interface ListingsFilterProps {
  onFilterChange: (filters: { search: string; location: string; level: string }) => void;
  initialFilters: { search: string; location: string; level: string };
}

export const ListingsFilter: React.FC<ListingsFilterProps> = ({ onFilterChange, initialFilters }) => {
  const [filters, setFilters] = useState(initialFilters);
  const [locations, setLocations] = useState<string[]>([]);
  const [levels, setLevels] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        setLoading(true);
        const [availableLocations, availableLevels] = await Promise.all([
          vacancyService.getAvailableLocations(),
          vacancyService.getAvailableLevels()
        ]);
        setLocations(availableLocations);
        setLevels(availableLevels);
      } catch (error) {
        console.error('Error loading filter options:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFilterOptions();
  }, []);

  const handleFilterChange = (field: string, value: string) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilterChange(newFilters); // Call onFilterChange directly
  };
  // Removed the useEffect with the timeout

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md space-y-4">
      <div className="relative">
        <input
          type="text"
          placeholder="Search apprenticeships..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Location
          </label>
          <select
            id="location"
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            disabled={loading}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:opacity-50 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">All Locations</option>
            {locations.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="level" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Apprenticeship Level
          </label>
          <select
            id="level"
            value={filters.level}
            onChange={(e) => handleFilterChange('level', e.target.value)}
            disabled={loading}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:opacity-50 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">All Levels</option>
            {levels.map(level => (
              <option key={level} value={level.toString()}>
                Level {level}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
          Loading filter options...
        </div>
      )}
    </div>
  );
};