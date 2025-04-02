import React from 'react';
import { ListingDetails } from '@/components/listings/ListingDetails';
import { ListingType } from '@/types/listing';
import { vacancyService } from '@/services/supabase/vacancyService';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { companies } from '@/components/listings/companyData';

export const dynamicParams = true;
export const revalidate = 0; 

export async function generateStaticParams() {
  // Use getAllActiveVacanciesForSitemap since it handles pagination properly
  const vacancies = await vacancyService.getAllActiveVacanciesForSitemap();
  // Map to slug, falling back to id as string if slug is somehow missing
  return vacancies.map((vacancy) => ({
    slug: vacancy.slug || vacancy.id.toString(),
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  // Fetch by slug
  const listing = await vacancyService.getVacancyBySlug(params.slug);

  if (!listing) {
    notFound();
  }

  // Helper function for logo URL (from both files)
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

  // Helper function for formatting wage (consistent check)
  const formatWage = (wage: ListingType['wage']) => {
    // Use 'Competitive Salary' (with space) for consistency with schema
    if (wage.wageType === 'Competitive Salary') {
      return 'Competitive salary';
    }
    // Ensure wageUnit exists before adding it
    const unit = wage.wageUnit ? ` ${wage.wageUnit}` : '';
    return `${wage.wageAdditionalInformation || wage.wageType}${unit}`;
  };

  const canonicalUrl = `https://apprenticewatch.com/apprenticeships/${listing.slug}`;
  const locationName = listing.address.addressLine3 || 'UK'; 

  return {
    title: `${listing.title} - Level ${listing.course.level} Apprenticeship at ${listing.employerName} | ApprenticeWatch`,

    description: `Level ${listing.course.level} ${listing.course.route} apprenticeship: ${listing.title} at ${listing.employerName}. ${formatWage(listing.wage)}. ${listing.hoursPerWeek}h/week in ${locationName}. Start date: ${new Date(listing.startDate).toLocaleDateString()}. Apply now!`,

    keywords: [
      'apprenticeship',
      listing.title.toLowerCase(),
      listing.employerName.toLowerCase(),
      listing.course.route.toLowerCase(),
      `level ${listing.course.level}`,
      locationName.toLowerCase(), 
      'apprenticeships', 
      'uk apprenticeships', 
      'apprenticeship jobs', 
      'apprentice', 
      'career',

    ].filter(Boolean), 

    openGraph: {
      title: `${listing.title} - Level ${listing.course.level} ${listing.course.route} Apprenticeship`, // More descriptive title from old
      description: `Apply for the ${listing.title} apprenticeship at ${listing.employerName}. Level ${listing.course.level} opportunity in ${locationName}. ${formatWage(listing.wage)}.`, // Detailed description + fallback
      type: 'website', 
      url: canonicalUrl, 
      images: [{ 
        url: getLogoUrl(listing.employerName),
        alt: `${listing.employerName} logo`,
        width: 400, 
        height: 400 
      }]
    },

    twitter: {
      card: 'summary_large_image', 
      title: `${listing.title} at ${listing.employerName}`, 
      description: `Level ${listing.course.level} ${listing.course.route} apprenticeship in ${locationName}. ${formatWage(listing.wage)}. Apply now!`, // Restored from old + fallback
      images: [getLogoUrl(listing.employerName)] 
    },

    alternates: {
      canonical: canonicalUrl 
    }
  };
}

export default async function ApprenticeshipDetail({ params }: { params: { slug: string } }) {
  // Fetch by slug
  const listing = await vacancyService.getVacancyBySlug(params.slug);

  if (!listing) {
    notFound();
  }

  // Use the slug in the canonical URL
  const canonicalUrl = `https://apprenticewatch.com/apprenticeships/${listing.slug}`;
  const locationCity = listing.address.addressLine3 || "Unknown City";
  const locationRegion = listing.address.addressLine3 || "Unknown Region"; 


  const jobPostingSchema = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": listing.title,
    "description": listing.description, 
    "datePosted": listing.postedDate,
    "validThrough": listing.closingDate || "2025-12-31", // Sensible fallback for expiry
    "employmentType": "APPRENTICESHIP",
    "url": canonicalUrl, 
    "hiringOrganization": {
      "@type": "Organization",
      "name": listing.employerName,
      "sameAs": listing.employerWebsiteUrl || undefined,
      "description": listing.employerDescription || undefined
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": listing.address.addressLine1 || "Unknown Street",
        "addressLocality": locationCity, 
        "addressRegion": locationRegion, 
        "postalCode": listing.address.postcode || "00000", 
        "addressCountry": "UK"
      },
      ...(listing.location?.latitude && listing.location?.longitude ? {
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": listing.location.latitude,
            "longitude": listing.location.longitude
          }
        } : {})
    },
    "educationRequirements": {
      "@type": "EducationalOccupationalCredential",
      "credentialCategory": `Level ${listing.course.level} Apprenticeship`,
      "educationalLevel": listing.course.level.toString(),
      // Ensure qualifications is an array even if null/undefined
      "qualifications": listing.qualifications || []
    },
    // Conditionally add experienceRequirements based on skills
    ...(listing.skills && listing.skills.length > 0 ? {
      "experienceRequirements": {
        "@type": "OccupationalExperienceRequirements",
        "skills": listing.skills.join(', ') 
      }
    } : {}),
    "skills": listing.skills || [], 
    "responsibilities": listing.fullDescription || listing.description,
    "totalJobOpenings": listing.numberOfPositions || 1, // Default to 1 if unspecified
    "employmentUnit": { // Typically the training provider
      "@type": "Organization",
      "name": listing.providerName
    },
    // Conditionally add baseSalary if not 'Competitive Salary'
    ...(listing.wage.wageType !== 'Competitive Salary' ? {
      "baseSalary": listing.wage.wageType === 'Competitive Salary' ? undefined : {
        "@type": "MonetaryAmount",
        "currency": "GBP",
        "value": {
          "@type": "QuantitativeValue",
          "value": listing.wage.wageAdditionalInformation || "Competitive",
          "unitText": listing.wage.wageUnit || "YEAR"
        }
      },
    } : {}),
    // Use wageAdditionalInformation for jobBenefits if it exists and isn't just the wage type
    "jobBenefits": (listing.wage.wageAdditionalInformation && listing.wage.wageAdditionalInformation !== listing.wage.wageType) ? listing.wage.wageAdditionalInformation : undefined,
    "workHours": `${listing.hoursPerWeek} hours per week. ${listing.workingWeekDescription || ''}`.trim(),
    // Conditionally add applicationContact if email or phone exist
    ...((listing.employerContactEmail || listing.employerContactPhone) ? {
      "applicationContact": {
        "@type": "ContactPoint",
        "telephone": listing.employerContactPhone || undefined,
        "email": listing.employerContactEmail || undefined,
        "contactType": "Hiring Manager", // Reasonable default
        "name": listing.employerContactName || undefined
      }
    } : {}),
    "jobStartDate": listing.startDate || undefined, // Include if available
    "identifier": {
      "@type": "PropertyValue",
      "name": "Vacancy Reference",
      "value": listing.vacancyReference
    },
    "industry": listing.course.route, // Use course route as industry
    // Add special commitments if applicable
    ...(listing.isDisabilityConfident ? { "specialCommitments": ["DisabilityConfident"] } : {})
  };

  // Function to remove undefined values recursively (optional, but cleans the JSON)
  const cleanupSchema = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(cleanupSchema).filter(item => item !== undefined);
    } else if (typeof obj === 'object' && obj !== null) {
      return Object.entries(obj).reduce((acc, [key, value]) => {
        const cleanedValue = cleanupSchema(value);
        if (cleanedValue !== undefined && !(Array.isArray(cleanedValue) && cleanedValue.length === 0)) {
          acc[key] = cleanedValue;
        }
        return acc;
      }, {} as any);
    }
    return obj === null ? undefined : obj;
  };


  return (
    <>
      <ListingDetails listing={listing} />
      {/* Stringify the cleaned schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(cleanupSchema(jobPostingSchema)) }}
      />
    </>
  );
}