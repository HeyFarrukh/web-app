import React from 'react';
import { Search, Filter } from 'lucide-react';

export const ListingsFilter = () => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md space-y-4">
      <div className="relative">
        <input
          type="text"
          placeholder="Search apprenticeships..."
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <select className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
          <option value="">Location</option>
          <option value="remote">Remote</option>
          <option value="london">London</option>
          <option value="manchester">Manchester</option>
        </select>
        
        <select className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
          <option value="">Industry</option>
          <option value="tech">Technology</option>
          <option value="finance">Finance</option>
          <option value="marketing">Marketing</option>
        </select>
      </div>
    </div>
  );
};