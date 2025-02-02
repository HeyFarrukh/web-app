import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Share2, Building2, MapPin, GraduationCap, 
  Clock, Calendar, Timer, Mail, Phone, Globe, Users, 
  Check, X, Briefcase, Copy 
} from 'lucide-react';
import { ListingType } from '../types/listing';
import { formatDate } from '../utils/dateUtils';
import { vacancyService } from '../supabase/vacancyService';

interface InfoCardProps {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}

const InfoCard: React.FC<InfoCardProps> = ({ icon: Icon, title, children }) => (
  <div className="space-y-2">
    <div className="flex items-center space-x-2">
      <Icon className="w-5 h-5 text-orange-500" />
      <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
    </div>
    <div className="ml-7">{children}</div>
  </div>
);

const ShareNotification = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-800 text-white px-6 py-3 rounded-full shadow-lg flex items-center space-x-2"
  >
    <Copy className="w-4 h-4" />
    <span>Link copied to clipboard</span>
  </motion.div>
);

export const ApprenticeshipDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState<ListingType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await vacancyService.getVacancyById(id);
        setListing(data);
        setError(null);
      } catch (err) {
        setError('Failed to load apprenticeship details. Please try again later.');
        console.error('Error fetching listing:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  const handleShare = async () => {
    const cleanUrl = window.location.origin + window.location.pathname;
    try {
      await navigator.clipboard.writeText(cleanUrl);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
              <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
            {error || 'Apprenticeship not found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${listing.title} at ${listing.employerName} | ApprenticeWatch`}</title>
        <meta 
          name="description" 
          content={`Apply for ${listing.title} apprenticeship at ${listing.employerName}. ${listing.course.level} apprenticeship in ${listing.address.addressLine3}. Training provided by ${listing.providerName}.`}
        />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`${listing.title} at ${listing.employerName}`} />
        <meta 
          property="og:description" 
          content={`Level ${listing.course.level} apprenticeship opportunity in ${listing.address.addressLine3}. Training provided by ${listing.providerName}.`}
        />
        <meta property="og:image" content="/media/apprentice-watch.png" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${listing.title} at ${listing.employerName}`} />
        <meta 
          name="twitter:description" 
          content={`Level ${listing.course.level} apprenticeship opportunity in ${listing.address.addressLine3}. Training provided by ${listing.providerName}.`}
        />
        <meta name="twitter:image" content="/media/apprentice-watch.png" />
        
        {/* Schema.org JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "JobPosting",
            "title": listing.title,
            "description": listing.description,
            "datePosted": listing.postedDate,
            "validThrough": listing.closingDate,
            "employmentType": "Apprenticeship",
            "hiringOrganization": {
              "@type": "Organization",
              "name": listing.employerName,
              "sameAs": listing.employerWebsiteUrl
            },
            "jobLocation": {
              "@type": "Place",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": listing.address.addressLine1,
                "addressLocality": listing.address.addressLine3,
                "postalCode": listing.address.postcode,
                "addressCountry": "UK"
              }
            },
            "educationRequirements": {
              "@type": "EducationalOccupationalCredential",
              "credentialCategory": `Level ${listing.course.level} Apprenticeship`
            },
            "numberOfPositions": listing.numberOfPositions,
            "employmentUnit": {
              "@type": "Organization",
              "name": listing.providerName
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen pt-24 pb-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <button
              onClick={() => navigate('/apprenticeships')}
              className="text-gray-700 dark:text-gray-200 hover:text-orange-500 dark:hover:text-orange-400 flex items-center space-x-2 text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Back to Apprenticeships</span>
            </button>
            
            <button
              onClick={handleShare}
              className="text-gray-700 dark:text-gray-200 hover:text-orange-500 dark:hover:text-orange-400 flex items-center space-x-2 text-sm sm:text-base"
            >
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>

          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-4">
            <img 
          src={listing.logo} 
          alt={listing.employerName} 
          className="w-16 h-16 rounded-lg object-contain bg-white"
          onError={(e) => e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(listing.employerName)}&background=random`}
        />
              <div>
                <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {listing.title}
                </h1>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-5 h-5 text-orange-500" />
                    <span className="text-base sm:text-lg text-gray-800 dark:text-gray-100">
                      {listing.employerName}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Briefcase className="w-5 h-5 text-orange-500" />
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
                    <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {listing.workingWeekDescription}
                    </div>
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
                          <Check className="w-4 h-4 mr-1" />
                          Disability Confident Employer
                        </span>
                      ) : (
                        <span className="flex items-center text-gray-600 dark:text-gray-300">
                          <X className="w-4 h-4 mr-1" />
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
                  >
                    Apply Now
                  </a>
                </div>
              </section>

              {/* Location */}
              <section className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <MapPin className="w-5 h-5 text-orange-500 mr-2" />
                  Location
                </h2>
                <address className="not-italic text-gray-700 dark:text-gray-200">
                  {listing.address.addressLine1}<br />
                  {listing.address.addressLine2 && <>{listing.address.addressLine2}<br /></>}
                  {listing.address.addressLine3}<br />
                  {listing.address.postcode}
                </address>
              </section>

              {/* Contact Information */}
              {(listing.employerContactEmail || listing.employerContactPhone || listing.employerWebsiteUrl) && (
                <section className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Contact Information
                  </h2>
                  <div className="space-y-3">
                    {listing.employerContactEmail && (
                      <a
                        href={`mailto:${listing.employerContactEmail}`}
                        className="flex items-center space-x-2 text-orange-500 hover:text-orange-600 break-all"
                      >
                        <Mail className="w-5 h-5 flex-shrink-0" />
                        <span>{listing.employerContactEmail}</span>
                      </a>
                    )}
                    {listing.employerContactPhone && (
                      <a
                        href={`tel:${listing.employerContactPhone}`}
                        className="flex items-center space-x-2 text-orange-500 hover:text-orange-600"
                      >
                        <Phone className="w-5 h-5 flex-shrink-0" />
                        <span>{listing.employerContactPhone}</span>
                      </a>
                    )}
                    {listing.employerWebsiteUrl && (
                      <a
                        href={listing.employerWebsiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-orange-500 hover:text-orange-600"
                      >
                        <Globe className="w-5 h-5 flex-shrink-0" />
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

      <AnimatePresence>
        {showNotification && <ShareNotification />}
      </AnimatePresence>
    </>
  );
};