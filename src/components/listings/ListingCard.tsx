import React from 'react';
import { Building2, MapPin, Briefcase } from 'lucide-react';

interface ListingProps {
  company: string;
  logo: string;
  title: string;
  location: string;
  type: string;
  description: string;
}

export const ListingCard = ({ company, logo, title, location, type, description }: ListingProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6">
      <div className="flex items-start space-x-4">
        <img src={logo} alt={company} className="w-12 h-12 rounded-lg object-contain" />
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
          <div className="flex items-center space-x-4 mt-2 text-gray-600 dark:text-gray-300">
            <div className="flex items-center space-x-1">
              <Building2 className="w-4 h-4" />
              <span>{company}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>{location}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Briefcase className="w-4 h-4" />
              <span>{type}</span>
            </div>
          </div>
          <p className="mt-3 text-gray-600 dark:text-gray-400">{description}</p>
          <button className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
            Apply Now
          </button>
        </div>
      </div>
    </div>
  );
};