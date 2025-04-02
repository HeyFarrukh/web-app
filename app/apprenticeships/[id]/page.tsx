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
  const { vacancies } = await vacancyService.getVacancies({ page: 1, pageSize: 1000, filters: {} });
  return vacancies.map((vacancy) => ({
    id: vacancy.id.toString(),
  }));
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const listing = await vacancyService.getVacancyById(params.id);

  if (!listing) {
    notFound();
  }

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

  const formatWage = (wage: ListingType['wage']) => {
    if (wage.wageType === 'Competitive Salary') {
      return 'Competitive salary';
    }
    return `${wage.wageAdditionalInformation || wage.wageType} ${wage.wageUnit}`;
  };

  return {
    title: `${listing.title} - Level ${listing.course.level} Apprenticeship at ${listing.employerName} | ApprenticeWatch`,
    description: `Level ${listing.course.level} ${listing.course.route} apprenticeship: ${listing.title} at ${listing.employerName}. ${formatWage(listing.wage)}. ${listing.hoursPerWeek}h/week in ${listing.address.addressLine3}. Start date: ${new Date(listing.startDate).toLocaleDateString()}. Apply now!`,
    keywords: [
      'apprenticeship',
      listing.course.route.toLowerCase(),
      `level ${listing.course.level}`,
      listing.title.toLowerCase(),
      listing.employerName.toLowerCase(),
      listing.address.addressLine3 ? listing.address.addressLine3.toLowerCase() : '',
      'career',
      'job',
      'training'
    ].filter((keyword): keyword is string => keyword !== ''),
    openGraph: {
      title: `${listing.title} - Level ${listing.course.level} ${listing.course.route} Apprenticeship`,
      description: `Apply for the ${listing.title} apprenticeship at ${listing.employerName}. Level ${listing.course.level} opportunity in ${listing.address.addressLine3}.`,
      type: 'website',
      url: `https://apprenticewatch.com/apprenticeships/${listing.id}`,
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
      description: `Level ${listing.course.level} ${listing.course.route} apprenticeship in ${listing.address.addressLine3}. ${formatWage(listing.wage)}. Apply now!`,
      images: [getLogoUrl(listing.employerName)]
    },
    alternates: {
      canonical: `https://apprenticewatch.com/apprenticeships/${listing.id}`
    }
  };
}

export default async function ApprenticeshipDetail({ params }: { params: { id: string } }) {
  const listing = await vacancyService.getVacancyById(params.id);

  if (!listing) {
    notFound();
  }

  const jobPostingSchema = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": listing.title,
    "description": listing.description,
    "datePosted": listing.postedDate,
    "validThrough": listing.closingDate || "2025-12-31",
    "employmentType": "APPRENTICESHIP",
    "url": `https://apprenticewatch.com/apprenticeships/${listing.id}`,
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
        "addressLocality": listing.address.addressLine3 || "Unknown City",
        "addressRegion": listing.address.addressLine3 || "Unknown Region",
        "postalCode": listing.address.postcode || "00000",
        "addressCountry": "UK"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": listing.location.latitude,
        "longitude": listing.location.longitude
      }
    },
    "educationRequirements": {
      "@type": "EducationalOccupationalCredential",
      "credentialCategory": `Level ${listing.course.level} Apprenticeship`,
      "educationalLevel": listing.course.level.toString(),
      "qualifications": listing.qualifications || []
    },
    "experienceRequirements": listing.skills ? {
      "@type": "OccupationalExperienceRequirements",
      "skills": listing.skills
    } : undefined,
    "skills": listing.skills || [],
    "responsibilities": listing.fullDescription || listing.description,
    "totalJobOpenings": listing.numberOfPositions || 1,
    "employmentUnit": {
      "@type": "Organization",
      "name": listing.providerName
    },
    "baseSalary": listing.wage.wageType === 'Competitive Salary' ? undefined : {
      "@type": "MonetaryAmount",
      "currency": "GBP",
      "value": {
        "@type": "QuantitativeValue",
        "value": listing.wage.wageAdditionalInformation || "Competitive",
        "unitText": listing.wage.wageUnit || "YEAR"
      }
    },
    "jobBenefits": listing.wage.wageAdditionalInformation || undefined,
    "workHours": `${listing.hoursPerWeek} hours per week. ${listing.workingWeekDescription || ''}`,
    "applicationContact": {
      "@type": "ContactPoint",
      "telephone": listing.employerContactPhone || undefined,
      "email": listing.employerContactEmail || undefined,
      "contactType": "Hiring Manager",
      "name": listing.employerContactName || undefined
    },
    "jobStartDate": listing.startDate || undefined,
    "identifier": {
      "@type": "PropertyValue",
      "name": "Vacancy Reference",
      "value": listing.vacancyReference
    },
    "industry": listing.course.route,
    "specialCommitments": listing.isDisabilityConfident ? ["DisabilityConfident"] : undefined
  };

  return (
    <>
      <ListingDetails listing={listing} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingSchema) }} />
    </>
  );
}