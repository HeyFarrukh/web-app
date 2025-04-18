"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Building2,
  MapPin,
  GraduationCap,
  Clock,
  PoundSterling,
} from "lucide-react";
import { ListingType } from "@/types/listing";
import { formatDate } from "@/utils/dateUtils";
import { employerService } from "@/services/supabase/employerService";
import { SaveButton } from "./SaveButton";

const logoCache = new Map<string, string>();

interface ListingCardProps {
  listing: ListingType;
  hideSaveButton?: boolean;
  customLinkUrl?: string;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  hideSaveButton = false,
  customLinkUrl,
}) => {
  const truncateDescription = (text: string, maxLength: number = 150) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  const formatWage = (wage: ListingType["wage"]) => {
    if (wage.wageType === "CompetitiveSalary") {
      return "Competitive Salary";
    }
    return (
      wage.wageAdditionalInformation || `${wage.wageType} (${wage.wageUnit})`
    );
  };

  const isExpired = (closingDate: Date): boolean => {
    if (!closingDate) return false;
    const now = new Date();
    return now > new Date(closingDate);
  };

  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoLoading, setLogoLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const cacheKey = listing.employerName;

    if (logoCache.has(cacheKey)) {
      setLogoUrl(logoCache.get(cacheKey)!);
      setLogoLoading(false);
      return;
    }

    setLogoLoading(true);
    (async () => {
      try {
        const employer = await employerService.getEmployerByName(listing.employerName);
        let url;
        if (employer?.is_verified && employer?.logo_url) {
          url = employer.logo_url;
        } else {
          url = `https://ui-avatars.com/api/?name=${encodeURIComponent(listing.employerName)}&background=random`;
        }
        logoCache.set(cacheKey, url);
        if (isMounted) {
          setLogoUrl(url);
        }
      } finally {
        if (isMounted) setLogoLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [listing.employerName]);

  const searchParams = useSearchParams();
  const currentPage = searchParams?.get("page") || "1";
  const filterParams = {
    search: searchParams?.get("search"),
    location: searchParams?.get("location"),
    level: searchParams?.get("level"),
    category: searchParams?.get("category"),
  };
  const sortOption = searchParams?.get("sort") || "recommended";

  const createDetailUrl = () => {
    const url = new URL(
      `/apprenticeships/${listing.slug}`,
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost"
    );
    url.searchParams.set("fromPage", currentPage);
    url.searchParams.set("scrollToId", listing.id.toString());
    url.searchParams.set("sort", sortOption);

    if (filterParams.search)
      url.searchParams.set("search", filterParams.search);
    if (filterParams.location)
      url.searchParams.set("location", filterParams.location);
    if (filterParams.level) url.searchParams.set("level", filterParams.level);
    if (filterParams.category)
      url.searchParams.set("category", filterParams.category);

    return url.pathname + url.search;
  };

  // Check if the apprenticeship is expired
  const expired = isExpired(listing.closingDate);

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6"
      id={`listing-${listing.id}`}
      data-listing-id={listing.id}
    >
      <div className="flex items-start space-x-4">
        <div className="w-16 h-16 rounded-lg bg-white flex items-center justify-center">
          {logoLoading ? (
            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          ) : (
            <img
              src={logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(listing.employerName)}&background=random`}
              alt={listing.employerName}
              className="w-16 h-16 rounded-lg object-contain bg-white"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(listing.employerName)}&background=random`;
              }}
            />
          )}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {listing.title}
            </h3>
            {!hideSaveButton && !expired && (
              <SaveButton vacancyId={listing.slug} />
            )}
          </div>

          <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center space-x-1">
              <Building2 className="w-4 h-4" />
              <span>{listing.employerName}</span>
            </div>
            {listing.address.addressLine3 && (
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>{listing.address.addressLine3}</span>
              </div>
            )}
            <div className="flex items-center space-x-1">
              <GraduationCap className="w-4 h-4" />
              <span>Level {listing.course.level}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>
                {expired ? "Closed" : "Closes"}{" "}
                {formatDate(listing.closingDate)}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <PoundSterling className="w-4 h-4" />
              <span>{formatWage(listing.wage)}</span>
            </div>
          </div>

          <p className="mt-3 text-gray-600 dark:text-gray-400 line-clamp-2">
            {truncateDescription(listing.description)}
          </p>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between items-center">
            <Link
              href={customLinkUrl || createDetailUrl()}
              className={`w-full sm:w-auto whitespace-nowrap px-4 py-2 ${
                listing.is_active
                  ? "bg-orange-500 hover:bg-orange-600"
                  : "bg-gray-500"
              } text-white rounded-lg transition-colors text-center`}
              aria-label={`View details about ${listing.title}`}
            >
              {listing.is_active ? "View Details" : "EXPIRED"}
            </Link>
            <span className="text-sm text-gray-500 dark:text-gray-400 text-center">
              {listing.numberOfPositions} position
              {listing.numberOfPositions !== 1 ? "s" : ""} available
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
