'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ArrowUpDown, ThumbsUp, Clock, CalendarClock } from 'lucide-react';

export type SortOption = 'recommended' | 'latest' | 'expiring';

interface ListingsSortToggleProps {
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export const ListingsSortToggle: React.FC<ListingsSortToggleProps> = ({
  currentSort,
  onSortChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get the current sort option label and icon
  const getSortLabel = () => {
    switch (currentSort) {
      case 'recommended':
        return { label: 'Recommended', icon: <ThumbsUp className="w-4 h-4" /> };
      case 'latest':
        return { label: 'Latest', icon: <Clock className="w-4 h-4" /> };
      case 'expiring':
        return { label: 'Expiring Soon', icon: <CalendarClock className="w-4 h-4" /> };
      default:
        return { label: 'Sort', icon: <ArrowUpDown className="w-4 h-4" /> };
    }
  };

  const handleSelect = (option: SortOption) => {
    onSortChange(option);
    setIsOpen(false);
  };

  const currentOption = getSortLabel();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg shadow text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Sort options"
      >
        <ArrowUpDown className="w-4 h-4" />
        <span className="hidden sm:inline">Sort: {currentOption.label}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10 overflow-hidden">
          <div className="py-0">
            <button
              onClick={() => handleSelect('recommended')}
              className={`w-full flex items-center px-4 py-2 text-sm text-left ${
                currentSort === 'recommended' 
                  ? 'bg-orange-500 text-white' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <ThumbsUp className="w-4 h-4 mr-2" />
              Recommended
            </button>
            <button
              onClick={() => handleSelect('latest')}
              className={`w-full flex items-center px-4 py-2 text-sm text-left ${
                currentSort === 'latest' 
                  ? 'bg-orange-500 text-white' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Clock className="w-4 h-4 mr-2" />
              Latest
            </button>
            <button
              onClick={() => handleSelect('expiring')}
              className={`w-full flex items-center px-4 py-2 text-sm text-left ${
                currentSort === 'expiring' 
                  ? 'bg-orange-500 text-white' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <CalendarClock className="w-4 h-4 mr-2" />
              Expiring Soon
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
