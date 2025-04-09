'use client';

import { CompanyLogos } from './CompanyLogos';
import { SearchBar } from './search/SearchBar';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export const Hero = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only navigate if there's a search term
    if (searchTerm.trim()) {
      router.push(`/apprenticeships?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      router.push('/apprenticeships');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] pt-16 bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        {/* Remove initial animation wrapper to improve LCP */}
        <div className="text-center">
          {/* Main heading - simplified animation */}
          <h1 
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4"
          >
            Let AI <span className="line-through">Replace</span>{' '}
            <span className="font-playfair italic text-orange-500">
              Help
            </span> You
          </h1>
          
          {/* LCP Element - Remove animation to improve initial load */}
          <p 
            className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-8"
          >
            We Track Apprenticeships So You Don&apos;t Have to.
          </p>
          
          <div className="max-w-3xl mx-auto mb-12">
            <SearchBar 
              onSubmit={handleSearch} 
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
          
          <CompanyLogos />
        </div>
      </div>
    </div>
  );
};