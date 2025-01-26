import React from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, MapPin, GraduationCap, Clock, Calendar, Timer,
  Globe, Mail, Phone, Users, Check, X, Briefcase, PoundSterling
} from 'lucide-react';
import { ListingType } from '../../types/listing';
import { formatDate } from '../../utils/dateUtils';

interface ListingDetailsProps {
  listing: ListingType;
  onClose: () => void;
}

export const ListingDetails: React.FC<ListingDetailsProps> = ({ listing, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start space-x-4">
            <img 
              src={listing.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(listing.employerName)}&background=random`}
              alt={listing.employerName}
              className="w-20 h-20 rounded-lg object-contain bg-white"
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {listing.title}
              </h2>
              <div className="flex items-center space-x-2 mt-2">
                <Building2 className="w-5 h-5 text-orange-500" />
                <span className="text-lg text-gray-700 dark:text-gray-300">
                  {listing.employerName}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Key Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailCard icon={MapPin} title="Location">
              {listing.address.addressLine1}<br />
              {listing.address.addressLine2 && <>{listing.address.addressLine2}<br /></>}
              {listing.address.addressLine3}<br />
              {listing.address.postcode}
            </DetailCard>

            <DetailCard icon={GraduationCap} title="Apprenticeship Level">
              Level {listing.course.level} - {listing.apprenticeshipLevel}<br />
              {listing.course.route} - {listing.course.title}
            </DetailCard>

            <DetailCard icon={Calendar} title="Important Dates">
              <div className="space-y-1">
                <div>Start Date: {formatDate(listing.startDate)}</div>
                <div>Closing Date: {formatDate(listing.closingDate)}</div>
                <div>Posted: {formatDate(listing.postedDate)}</div>
              </div>
            </DetailCard>

            <DetailCard icon={Timer} title="Working Hours">
              <div className="space-y-1">
                <div>{listing.hoursPerWeek} hours per week</div>
                <div>{listing.expectedDuration} duration</div>
                <div>{listing.workingWeekDescription}</div>
              </div>
            </DetailCard>
          </div>

          {/* Description */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Description
            </h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {listing.description}
            </p>
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Provider Information */}
            <DetailCard icon={Briefcase} title="Training Provider">
              {listing.providerName}
            </DetailCard>

            {/* Wage Information */}
            <DetailCard icon={PoundSterling} title="Wage Information">
              <div className="space-y-1">
                <div>{listing.wage.wageType}</div>
                {listing.wage.wageAdditionalInformation && (
                  <div>{listing.wage.wageAdditionalInformation}</div>
                )}
                <div>Paid {listing.wage.wageUnit}</div>
              </div>
            </DetailCard>

            {/* Contact Information */}
            {(listing.employerContactEmail || listing.employerContactPhone || listing.employerWebsiteUrl) && (
              <div className="md:col-span-2 space-y-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {listing.employerContactEmail && (
                    <div className="flex items-center space-x-2">
                      <Mail className="w-5 h-5 text-orange-500" />
                      <a href={`mailto:${listing.employerContactEmail}`} className="text-orange-500 hover:text-orange-600">
                        {listing.employerContactEmail}
                      </a>
                    </div>
                  )}
                  {listing.employerContactPhone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-5 h-5 text-orange-500" />
                      <a href={`tel:${listing.employerContactPhone}`} className="text-orange-500 hover:text-orange-600">
                        {listing.employerContactPhone}
                      </a>
                    </div>
                  )}
                  {listing.employerWebsiteUrl && (
                    <div className="flex items-center space-x-2">
                      <Globe className="w-5 h-5 text-orange-500" />
                      <a href={listing.employerWebsiteUrl} target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:text-orange-600">
                        Company Website
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Additional Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-orange-500" />
              <span className="text-gray-700 dark:text-gray-300">
                {listing.numberOfPositions} position{listing.numberOfPositions !== 1 ? 's' : ''} available
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {listing.isDisabilityConfident ? (
                <>
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Disability Confident Employer
                  </span>
                </>
              ) : (
                <>
                  <X className="w-5 h-5 text-red-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Not Disability Confident
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Close
          </button>
          <a
            href={listing.vacancyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Apply Now
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
};

const DetailCard: React.FC<{
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}> = ({ icon: Icon, title, children }) => (
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