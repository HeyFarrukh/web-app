'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { vacancyService } from '@/services/supabase/vacancyService';
import { ListingMap } from '@/components/listings/ListingMap';
import { notFound } from 'next/navigation';

export default async function ApprenticeshipMapPage({ params }: { params: { id: string } }) {
  const listing = await vacancyService.getVacancyById(params.id);

  if (!listing) {
    notFound();
  }

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href={`/apprenticeships/${params.id}`}
            className="text-gray-700 dark:text-gray-200 hover:text-orange-500 dark:hover:text-orange-400 flex items-center space-x-2 text-sm sm:text-base"
            aria-label="Back to Apprenticeship Details"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
            <span>Back to Apprenticeship Details</span>
          </Link>
        </div>

        {/* Map Title */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {listing.title} at {listing.employerName} - Location
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            {listing.address.addressLine1}, 
            {listing.address.addressLine2 ? `${listing.address.addressLine2}, ` : ''} 
            {listing.address.addressLine3}, 
            {listing.address.postcode}
          </p>
        </div>

        {/* Full-size Map */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
          <div className="h-[70vh]">
            <ListingMap 
              latitude={listing.location.latitude} 
              longitude={listing.location.longitude}
              employerName={listing.employerName}
              title={listing.title}
              address={listing.address}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
