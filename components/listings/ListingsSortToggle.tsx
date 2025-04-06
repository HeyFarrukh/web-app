'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ArrowUpDown, Clock, CalendarClock, Sparkles } from 'lucide-react';

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
        return { label: 'Recommended', icon: <Sparkles className="w-4 h-4" /> };
      case 'latest':
        return { label: 'Recently Added', icon: <Clock className="w-4 h-4" /> };
      case 'expiring':
        return { label: 'Closing Soon', icon: <CalendarClock className="w-4 h-4" /> };
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
        aria-label={`Sort apprenticeships by ${currentOption.label}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <ArrowUpDown className="w-4 h-4 mr-1" />
        <span className="truncate">{currentOption.label}</span>
      </button>

      {isOpen && (
        <div 
          className="absolute left-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10 overflow-hidden"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="sort-options-menu"
        >
          <div className="py-0">
            <button
              onClick={() => handleSelect('recommended')}
              className={`w-full flex items-center px-4 py-3 text-sm text-left ${
                currentSort === 'recommended' 
                  ? 'bg-orange-500 text-white' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              role="menuitem"
              aria-label="Sort by recommended apprenticeships"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Recommended
            </button>
            <button
              onClick={() => handleSelect('latest')}
              className={`w-full flex items-center px-4 py-3 text-sm text-left ${
                currentSort === 'latest' 
                  ? 'bg-orange-500 text-white' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              role="menuitem"
              aria-label="Sort by recently added apprenticeships"
            >
              <Clock className="w-4 h-4 mr-2" />
              Recently Added
            </button>
            <button
              onClick={() => handleSelect('expiring')}
              className={`w-full flex items-center px-4 py-3 text-sm text-left ${
                currentSort === 'expiring' 
                  ? 'bg-orange-500 text-white' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              role="menuitem"
              aria-label="Sort by apprenticeships closing soon"
            >
              <CalendarClock className="w-4 h-4 mr-2" />
              Closing Soon
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
