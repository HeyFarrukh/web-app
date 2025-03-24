'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Building2, MapPin, GraduationCap,
  Clock, Calendar, Timer, Mail, Phone, Globe, Users,
  Check, X, Briefcase, Share2 as Share, Clipboard, Linkedin,
  Bookmark, FileText, Info, MapPinned, Briefcase as BriefcaseIcon
} from 'lucide-react';
import { SiWhatsapp as WhatsApp } from 'react-icons/si';
import { ListingType } from '@/types/listing';
import { formatDate } from '@/utils/dateUtils';
import { companies } from './companyData';
import { Analytics } from '@/services/analytics/analytics';
import { ListingMap } from './ListingMap';
import { useAuth } from '@/hooks/useAuth';
import { savedApprenticeshipService } from '@/services/supabase/savedApprenticeshipService';
import clsx from 'clsx';

interface TabProps {
  id: string;
  label: string;
  icon: React.ElementType;
  content: React.ReactNode;
}

interface InfoCardProps {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}

const InfoCard: React.FC<InfoCardProps> = ({ icon: Icon, title, children }) => (
  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
    <div className="flex items-center space-x-2 mb-2">
      <Icon className="w-5 h-5 text-orange-500" />
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
  const [activeTab, setActiveTab] = useState('overview');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { isAuthenticated, userData } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const referringPage = searchParams?.get('fromPage') || '1';
  const scrollToId = searchParams?.get('scrollToId');
  const fromSavedPage = searchParams?.get('fromSaved') === 'true';

  useEffect(() => {
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
    if (typeof window !== 'undefined') {
      Analytics.event('apprenticeship', 'apply_click', `${listing.title} - ${listing.employerName}`);
    }
  };

  const handleSaveToggle = async () => {
    if (!isAuthenticated) {
      if (typeof window !== 'undefined') {
        const returnPath = `/apprenticeships/${listing.id}`;
        localStorage.setItem('postauth_redirect', returnPath);
        router.push('/signin');
      }
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

  const isValidString = (str: string | undefined | null): boolean => {
    return Boolean(str && str !== 'undefined' && str.trim() !== '');
  };

  const hasValidAddressFields = (): boolean => {
    if (!listing.address) return false;

    return (
      isValidString(listing.address.addressLine1) ||
      isValidString(listing.address.addressLine2) ||
      isValidString(listing.address.addressLine3) ||
      isValidString(listing.address.postcode)
    );
  };

  const isExpired = (closingDate: Date): boolean => {
    if (!closingDate) return false;
    const now = new Date();
    return now > new Date(closingDate);
  };

  const tabs: TabProps[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: FileText,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Description and Key Info Column */}
            <div className="lg:col-span-2 space-y-6">
              <section className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Description</h2>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="whitespace-pre-line text-gray-700 dark:text-gray-200">{listing.description}</p>
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

              {/* Skills Required */}
              {listing.skills && listing.skills.length > 0 && (
                <section className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Skills Required</h2>
                  <div className="flex flex-wrap gap-2">
                    {listing.skills.map((skill, index) => (
                      <span key={index} className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 px-3 py-1 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Location Column */}
            <div className="space-y-6">
              {hasValidAddressFields() && (
                <section className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Location</h2>
                  <div className="space-y-4">
                    <ListingMap listing={listing} height="300px" />
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
                  </div>
                </section>
              )}

              {/* Application Details */}
              <section className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Application Details</h2>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Posted</div>
                    <div className="text-gray-800 dark:text-gray-100 font-medium">{formatDate(listing.postedDate)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {isExpired(listing.closingDate) ? 'Closed' : 'Closing Date'}
                    </div>
                    <div className="text-gray-800 dark:text-gray-100 font-medium">{formatDate(listing.closingDate)}</div>
                  </div>
                  
                  {listing.is_active ? (
                    <a
                      href={listing.vacancyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-orange-500 text-white text-center py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium"
                      onClick={handleApplyClick}
                    >
                      Apply Now
                    </a>
                  ) : (
                    <div className="block w-full bg-gray-500 text-white text-center py-3 rounded-lg font-medium">
                      EXPIRED
                    </div>
                  )}
                </div>
                
              </section>
            </div>
          </div>

        </div>
      ),
    },
    {
      id: 'details',
      label: 'Details',
      icon: Info,
      content: (
        <div className="space-y-6">
          {isValidString(listing.fullDescription) && (
            <section className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">About the Role</h2>
              <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-200"
                dangerouslySetInnerHTML={{ __html: listing.fullDescription || '' }}
              />
            </section>
          )}

          {listing.qualifications && listing.qualifications.length > 0 && (
            <section className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Qualifications Required</h2>
              <div className="space-y-4">
                {listing.qualifications.map((qualification, index) => {
                  if (typeof qualification === 'string') {
                    return (
                      <div key={index} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 dark:text-gray-200">{qualification}</span>
                      </div>
                    );
                  }

                  let qualObj = qualification;
                  if (typeof qualification === 'string' && qualification.startsWith('{')) {
                    try {
                      qualObj = JSON.parse(qualification);
                    } catch (e) {
                      qualObj = { text: qualification };
                    }
                  }

                  return (
                    <div key={index} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-grow">
                          <div className="flex items-center">
                            <span className="font-medium text-gray-800 dark:text-gray-100">
                              {qualObj.subject || qualObj.name || ''}
                            </span>
                            {qualObj.weighting === 'Essential' && (
                              <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full">
                                Required
                              </span>
                            )}
                            {qualObj.weighting === 'Desirable' && (
                              <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full">
                                Preferred
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {qualObj.qualificationType && (
                              <span className="inline-block mr-2">
                                {qualObj.qualificationType}
                              </span>
                            )}
                            {qualObj.grade && (
                              <span className="inline-block">
                                Grade: {qualObj.grade}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      ),
    },
    {
      id: 'company',
      label: 'Company',
      icon: BriefcaseIcon,
      content: (
        <div className="space-y-6">
          {isValidString(listing.employerDescription) && (
            <section className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                About {isValidString(listing.employerName) ? listing.employerName : 'Employer'}
              </h2>
              <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-200"
                dangerouslySetInnerHTML={{ __html: listing.employerDescription || '' }}
              />
            </section>
          )}

          {(isValidString(listing.employerContactEmail) ||
            isValidString(listing.employerContactPhone) ||
            isValidString(listing.employerWebsiteUrl)) && (
              <section className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h2>
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
      ),
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => {
              if (fromSavedPage) {
                router.push('/saved-apprenticeships');
              } else {
                const url = new URL('/apprenticeships', window.location.origin);
                url.searchParams.set('page', referringPage);
                if (scrollToId) {
                  url.searchParams.set('scrollToId', scrollToId);
                }
                router.push(url.toString());
              }
            }}
            className="text-gray-700 dark:text-gray-200 hover:text-orange-500 dark:hover:text-orange-400 flex items-center space-x-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{fromSavedPage ? "Back to Saved Apprenticeships" : "Back to Apprenticeships"}</span>
          </button>
          <div className="relative flex justify-center items-center space-x-4">
            {!isExpired(listing.closingDate) && (
              <button
                className={`text-gray-700 dark:text-gray-200 hover:text-orange-500 dark:hover:text-orange-400 flex items-center space-x-2 ${isSaved ? 'text-orange-500 dark:text-orange-400' : ''}`}
                onClick={handleSaveToggle}
              >
                <span>{isSaved ? "Saved" : "Save"}</span>
                <Bookmark className="w-6 h-6" fill={isSaved ? "currentColor" : "none"} />
              </button>
            )}
            <button
              className="text-gray-700 dark:text-gray-200 hover:text-orange-500 dark:hover:text-orange-400 flex items-center space-x-2"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <span>Share</span>
              <Share className="w-6 h-6" />
            </button>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 space-y-2 w-48"
              >
                <button
                  className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:text-orange-500 dark:hover:text-orange-400"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    setShowDropdown(false);
                  }}
                >
                  <Clipboard className="w-5 h-5" />
                  <span>Copy Link</span>
                </button>
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:text-orange-500 dark:hover:text-orange-400"
                  onClick={() => setShowDropdown(false)}
                >
                  <WhatsApp className="w-5 h-5" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:text-orange-500 dark:hover:text-orange-400"
                  onClick={() => setShowDropdown(false)}
                >
                  <Linkedin className="w-5 h-5" />
                  <span>LinkedIn</span>
                </a>
              </motion.div>
            )}
          </div>
        </div>

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-4">
            <img
              src={getLogoUrl(listing.employerName)}
              alt={listing.employerName}
              className="w-16 h-16 rounded-lg object-contain bg-white mb-4 sm:mb-0"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(listing.employerName)}&background=random`;
              }}
            />
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {listing.title}
              </h1>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Building2 className="w-5 h-5 text-orange-500" />
                  <span className="text-lg text-gray-800 dark:text-gray-100">
                    {listing.employerName}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-5 h-5 text-orange-500" />
                  <span className="text-gray-700 dark:text-gray-200">
                    Training Provider: {listing.providerName}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Application Details Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Posted</div>
              <div className="text-gray-800 dark:text-gray-100 font-medium">{formatDate(listing.postedDate)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {isExpired(listing.closingDate) ? 'Closed' : 'Closing Date'}
              </div>
              <div className="text-gray-800 dark:text-gray-100 font-medium">{formatDate(listing.closingDate)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Wage</div>
              <div className="text-gray-800 dark:text-gray-100 font-medium">
                {listing.wage.wageType === 'CompetitiveSalary' 
                  ? 'Competitive Salary'
                  : listing.wage.wageAdditionalInformation || `${listing.wage.wageType} (${listing.wage.wageUnit})`}
              </div>
            </div>
            <div className="sm:text-right">
              {listing.is_active ? (
                <a
                  href={listing.vacancyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-orange-500 text-white text-center py-2 px-6 rounded-lg hover:bg-orange-600 transition-colors"
                  onClick={handleApplyClick}
                >
                  Apply Now
                </a>
              ) : (
                <div className="inline-block bg-gray-500 text-white text-center py-2 px-6 rounded-lg">
                  EXPIRED
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={clsx(
                      'flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                      activeTab === tab.id
                        ? 'border-orange-500 text-orange-500'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {tabs.find(tab => tab.id === activeTab)?.content}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};