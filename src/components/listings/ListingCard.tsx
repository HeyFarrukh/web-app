import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, GraduationCap, Clock } from 'lucide-react';
import { ListingType } from '../../types/listing';
import { formatDate } from '../../utils/dateUtils';

interface ListingCardProps {
  listing: ListingType;
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  const navigate = useNavigate();

  const truncateDescription = (text: string, maxLength: number = 150) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6">
      <div className="flex items-start space-x-4">
        <img 
          src={listing.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(listing.employerName)}&background=random`} 
          alt={listing.employerName} 
          className="w-16 h-16 rounded-lg object-contain bg-white"
        />
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {listing.title}
          </h3>
          
          <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center space-x-1">
              <Building2 className="w-4 h-4" />
              <span>{listing.employerName}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>{listing.address.addressLine3}</span>
            </div>
            <div className="flex items-center space-x-1">
              <GraduationCap className="w-4 h-4" />
              <span>Level {listing.course.level}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>Closes {formatDate(listing.closingDate)}</span>
            </div>
          </div>

          <p className="mt-3 text-gray-600 dark:text-gray-400 line-clamp-2">
            {truncateDescription(listing.description)}
          </p>

          <div className="mt-4 flex items-center justify-between">
            <button 
              onClick={() => navigate(`/apprenticeships/${listing.id}`)}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              View Details
            </button>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {listing.numberOfPositions} position{listing.numberOfPositions !== 1 ? 's' : ''} available
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};