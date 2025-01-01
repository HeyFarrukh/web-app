import React from 'react';
import { ListingCard } from '../components/listings/ListingCard';
import { ListingsFilter } from '../components/listings/ListingsFilter';

const demoListings = [
  {
    company: 'Meta',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg',
    title: 'Software Engineering Apprentice',
    location: 'London, UK',
    type: 'Full-time',
    description: 'Join Meta as a Software Engineering Apprentice and help build the future of social connection. Learn from world-class engineers while working on products used by billions.',
  },
  {
    company: 'Microsoft',
    logo: 'https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE1Mu3b?ver=5c31',
    title: 'Cloud Infrastructure Apprentice',
    location: 'Manchester, UK',
    type: 'Full-time',
    description: 'Work with Azure cloud technologies and help businesses transform their infrastructure. Comprehensive training and mentorship provided.',
  },
  {
    company: 'Amazon',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
    title: 'Data Analytics Apprentice',
    location: 'Remote',
    type: 'Full-time',
    description: 'Drive business decisions through data analysis. Learn advanced analytics tools and techniques while working with real-world data.',
  },
];

export const Listings = () => {
  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Available Apprenticeships
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <ListingsFilter />
          </div>
          
          <div className="lg:col-span-3 space-y-6">
            {demoListings.map((listing, index) => (
              <ListingCard key={index} {...listing} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};