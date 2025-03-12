'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Building2, MapPin, GraduationCap,
  Clock, Calendar, Timer, Mail, Phone, Globe, Users,
  Check, X, Briefcase, Share2 as Share, Clipboard, Linkedin,
  Bookmark,
} from 'lucide-react';
import { SiWhatsapp as WhatsApp } from 'react-icons/si';
import { ListingType } from '@/types/listing';
import { formatDate } from '@/utils/dateUtils';
import { companies } from './companyData';
import { Analytics } from '@/services/analytics/analytics';
import { ListingMap } from './ListingMap';
import { useAuth } from '@/hooks/useAuth';
import { savedApprenticeshipService } from '@/services/supabase/savedApprenticeshipService';

interface InfoCardProps {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}

const InfoCard: React.FC<InfoCardProps> = ({ icon: Icon, title, children }) => (
  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
    <div className="flex items-center space-x-2 mb-2">
      <Icon className="w-5 h-5 text-orange-500" aria-hidden="true" />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>
    </div>
    <div className="text-gray-700 dark:text-gray-300">
      {children}
    </div>
  </div>
);

interface ListingDetailsProps {
  listing: ListingType;
}

export const ListingDetails: React.FC<ListingDetailsProps> = ({ listing }) => {
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [isSaved, setIsSaved] = React.useState(false);
  const { isAuthenticated, userData } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const referringPage = searchParams?.get('fromPage') || '1';
  const scrollToId = searchParams?.get('scrollToId');
  const fromSavedPage = searchParams?.get('fromSaved') === 'true';

  useEffect(() => {
    // Track apprenticeship view
    if (typeof window !== 'undefined') {
      Analytics.event('apprenticeship', 'view_details', `${listing.title} - ${listing.employerName}`);
    }
  }, [listing]);

  useEffect(() => {
    const checkIfSaved = async () => {
      if (userData && listing.id) {
        const savedListings = await savedApprenticeshipService.getSavedApprenticeships(userData.id);
        setIsSaved(savedListings.some(saved => saved.id === listing.id));
      }
    };
    checkIfSaved();
  }, [userData, listing.id]);

  const handleApplyClick = () => {
    // Track apply button click
    if (typeof window !== 'undefined') {
      Analytics.event('apprenticeship', 'apply_click', `${listing.title} - ${listing.employerName}`);
    }
  };

  const handleSaveToggle = async () => {
    if (!isAuthenticated) {
      router.push(`/signin?redirect=/apprenticeships/${listing.id}`);
      return;
    }

    if (!userData) return;

    try {
      if (isSaved) {
        await savedApprenticeshipService.unsaveApprenticeship(userData.id, listing.id);
      } else {
        await savedApprenticeshipService.saveApprenticeship(userData.id, listing.id);
      }
      setIsSaved(!isSaved);
    } catch (error) {
      console.error('Error toggling save status:', error);
    }
  };

  const getLogoUrl = (employerName: string) => {
    const normalizedEmployerName = employerName.toLowerCase();
    const company = companies.find((company) =>
      company.name.toLowerCase() === normalizedEmployerName
    );

    if (company && company.domain) {
      return `https://img.logo.dev/${company.domain}?token=${process.env.NEXT_PUBLIC_LOGODEV_KEY}`;
    }

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(employerName)}&background=random`;
  };

  // Helper function to check if a string is not empty or undefined
  const isValidString = (str: string | undefined | null): boolean => {
    return Boolean(str && str !== 'undefined' && str.trim() !== '');
  };

  // Helper to check if any address fields are valid
  const hasValidAddressFields = (): boolean => {
    if (!listing.address) return false;

    return (
      isValidString(listing.address.addressLine1) ||
      isValidString(listing.address.addressLine2) ||
      isValidString(listing.address.addressLine3) ||
      isValidString(listing.address.postcode)
    );
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <button
            onClick={() => {
              if (fromSavedPage) {
                router.push('/saved-apprenticeships');
              } else {
                const url = `/apprenticeships?page=${referringPage}${scrollToId ? `&scrollToId=${scrollToId}` : ''}`;
                router.push(url);
              }
            }}
            className="text-gray-700 dark:text-gray-200 hover:text-orange-500 dark:hover:text-orange-400 flex items-center space-x-2 text-sm sm:text-base"
            aria-label={fromSavedPage ? "Back to Saved Apprenticeships" : "Back to Apprenticeships"}
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
            <span>{fromSavedPage ? "Back to Saved Apprenticeships" : "Back to Apprenticeships"}</span>
          </button>
          <div className="relative flex justify-center items-center space-x-4">
            <button
              className={`text-gray-700 dark:text-gray-200 hover:text-orange-500 dark:hover:text-orange-400 flex items-center space-x-2 text-sm sm:text-base ${isSaved ? 'text-orange-500 dark:text-orange-400' : ''}`}
              aria-label={isSaved ? "Unsave Apprenticeship" : "Save Apprenticeship"}
              onClick={handleSaveToggle}
            >
              <span>{isSaved ? "Saved" : "Save"}</span>
              <Bookmark className="w-6 h-6" aria-hidden="true" fill={isSaved ? "currentColor" : "none"} />
            </button>
            <button
              className="text-gray-700 dark:text-gray-200 hover:text-orange-500 dark:hover:text-orange-400 flex items-center space-x-2 text-sm sm:text-base"
              aria-label="Share"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <span>Share</span>
              <Share className="w-6 h-6" aria-hidden="true" />
            </button>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 space-y-2 w-48 max-w-full"
                style={{ maxWidth: 'calc(100vw - 2rem)' }}
              >
                <button
                  className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:text-orange-500 dark:hover:text-orange-400"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    setShowDropdown(false);
                  }}
                  aria-label="Copy Link"
                >
                  <Clipboard className="w-5 h-5" aria-hidden="true" />
                  <span>Copy Link</span>
                </button>
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:text-orange-500 dark:hover:text-orange-400"
                  aria-label="Share on WhatsApp"
                  onClick={() => setShowDropdown(false)}
                >
                  <WhatsApp className="w-5 h-5" aria-hidden="true" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:text-orange-500 dark:hover:text-orange-400"
                  aria-label="Share on LinkedIn"
                  onClick={() => setShowDropdown(false)}
                >
                  <Linkedin className="w-5 h-5" aria-hidden="true" />
                  <span>LinkedIn</span>
                </a>
              </motion.div>
            )}
          </div>
        </div>

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-4">
            <img
              src={getLogoUrl(listing.employerName)}
              alt={listing.employerName}
              className="w-16 h-16 rounded-lg object-contain bg-white"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(listing.employerName)}&background=random`;
              }}
            />
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {listing.title}
              </h1>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Building2 className="w-5 h-5 text-orange-500" aria-hidden="true" />
                  <span className="text-base sm:text-lg text-gray-800 dark:text-gray-100">
                    {listing.employerName}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-5 h-5 text-orange-500" aria-hidden="true" />
                  <span className="text-sm text-gray-700 dark:text-gray-200">
                    Training Provider: {listing.providerName}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Description */}
            <section className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Description
              </h2>
              <div className="prose dark:prose-invert max-w-none">
                <p className="whitespace-pre-line text-gray-700 dark:text-gray-200">
                  {listing.description}
                </p>
              </div>
            </section>

            {/* Key Information */}
            <section className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Key Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <InfoCard icon={GraduationCap} title="Apprenticeship Level">
                  <div className="text-gray-800 dark:text-gray-100">
                    Level {listing.course.level} - {listing.apprenticeshipLevel}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {listing.course.route} - {listing.course.title}
                  </div>
                </InfoCard>

                <InfoCard icon={Timer} title="Working Hours">
                  <div className="text-gray-800 dark:text-gray-100">
                    {listing.hoursPerWeek} hours per week
                  </div>
                  {isValidString(listing.workingWeekDescription) && (
                    <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {listing.workingWeekDescription}
                    </div>
                  )}
                </InfoCard>

                <InfoCard icon={Calendar} title="Duration">
                  <div className="text-gray-800 dark:text-gray-100">
                    {listing.expectedDuration}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Start Date: {formatDate(listing.startDate)}
                  </div>
                </InfoCard>

                <InfoCard icon={Users} title="Positions">
                  <div className="text-gray-800 dark:text-gray-100">
                    {listing.numberOfPositions} position{listing.numberOfPositions !== 1 ? 's' : ''} available
                  </div>
                  <div className="text-sm mt-1">
                    {listing.isDisabilityConfident ? (
                      <span className="flex items-center text-green-600 dark:text-green-400">
                        <Check className="w-4 h-4 mr-1" aria-hidden="true" />
                        Disability Confident Employer
                      </span>
                    ) : (
                      <span className="flex items-center text-gray-600 dark:text-gray-300">
                        <X className="w-4 h-4 mr-1" aria-hidden="true" />
                        Not Disability Confident
                      </span>
                    )}
                  </div>
                </InfoCard>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 sm:space-y-8">
            {/* Application Details */}
            <section className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Application Details
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Posted</div>
                  <div className="text-gray-800 dark:text-gray-100">{formatDate(listing.postedDate)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Closing Date</div>
                  <div className="text-gray-800 dark:text-gray-100">{formatDate(listing.closingDate)}</div>
                </div>
                <a
                  href={listing.vacancyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-orange-500 text-white text-center py-3 rounded-lg hover:bg-orange-600 transition-colors"
                  aria-label="Apply Now"
                  onClick={handleApplyClick}
                >
                  Apply Now
                </a>
              </div>
            </section>

            {/* Location - Only show if there are valid address fields */}
            {hasValidAddressFields() && (
              <section className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <MapPin className="w-5 h-5 text-orange-500 mr-2" aria-hidden="true" />
                  Location
                </h2>
                  <ListingMap
                      listing={listing} // Pass the entire listing object
                  />
                <address className="not-italic text-gray-700 dark:text-gray-200">
                  {isValidString(listing.address.addressLine1) && (
                    <>{listing.address.addressLine1}<br /></>
                  )}
                  {isValidString(listing.address.addressLine2) && (
                    <>{listing.address.addressLine2}<br /></>
                  )}
                  {isValidString(listing.address.addressLine3) && (
                    <>{listing.address.addressLine3}<br /></>
                  )}
                  {isValidString(listing.address.postcode) && (
                    <>{listing.address.postcode}</>
                  )}
                </address>
              </section>
            )}

            {/* Contact Information - Only show if at least one valid contact method exists */}
            {(isValidString(listing.employerContactEmail) ||
              isValidString(listing.employerContactPhone) ||
              isValidString(listing.employerWebsiteUrl)) && (
                <section className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Contact Information
                  </h2>
                  <div className="space-y-3">
                    {isValidString(listing.employerContactEmail) && (
                      <a
                        href={`mailto:${listing.employerContactEmail}`}
                        className="flex items-center space-x-2 text-orange-500 hover:text-orange-600 break-all"
                        aria-label={`Email ${listing.employerContactEmail}`}
                      >
                        <Mail className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                        <span>{listing.employerContactEmail}</span>
                      </a>
                    )}
                    {isValidString(listing.employerContactPhone) && (
                      <a
                        href={`tel:${listing.employerContactPhone}`}
                        className="flex items-center space-x-2 text-orange-500 hover:text-orange-600"
                        aria-label={`Call ${listing.employerContactPhone}`}
                      >
                        <Phone className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                        <span>{listing.employerContactPhone}</span>
                      </a>
                    )}
                    {isValidString(listing.employerWebsiteUrl) && (
                      <a
                        href={listing.employerWebsiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-orange-500 hover:text-orange-600"
                        aria-label="Company Website"
                      >
                        <Globe className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                        <span>Company Website</span>
                      </a>
                    )}
                  </div>
                </section>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};