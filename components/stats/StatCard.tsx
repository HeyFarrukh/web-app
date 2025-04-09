'use client';

import React from 'react';

interface StatCardProps {
  value: string;
  label: string;
  description: string;
  delay: number; // Kept for backward compatibility but not used
}

export const StatCard: React.FC<StatCardProps> = ({ value, label, description }) => {
  return (
    <div
      className="relative bg-white/20 dark:bg-gray-800/20 backdrop-blur-md border border-white/30 dark:border-gray-700/40 p-8 rounded-2xl shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300"
    >
      {/* Enhanced glass effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 dark:from-gray-800/10 dark:to-gray-800/5" />
      
      {/* Content with improved contrast */}
      <div className="relative z-10">
        <div 
          className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent mb-3"
        >
          {value}
        </div>
        <div 
          className="text-xl font-semibold text-gray-900 dark:text-white mb-3"
        >
          {label}
        </div>
        <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Enhanced decorative elements */}
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-colors duration-300" />
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-colors duration-300" />
    </div>
  );
};