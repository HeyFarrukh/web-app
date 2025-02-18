import React from 'react';
import { ListingDetails } from '@/components/listings/ListingDetails';
import { ListingType } from '@/types/listing';
import { vacancyService } from '@/services/supabase/vacancyService';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const dynamicParams = false;
export const revalidate = 3660;

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

  return {
    title: `${listing.title} at ${listing.employerName} | ApprenticeWatch`,
    description: `Apply for the ${listing.title} apprenticeship at ${listing.employerName}. Level ${listing.course.level} opportunity in ${listing.address.addressLine3}. Learn more and apply now on ApprenticeWatch.`,
    openGraph: {
      title: `${listing.title} at ${listing.employerName}`,
      description: `Apply for the ${listing.title} apprenticeship at ${listing.employerName}. Level ${listing.course.level} opportunity in ${listing.address.addressLine3}.`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${listing.title} at ${listing.employerName}`,
      description: `Level ${listing.course.level} apprenticeship opportunity in ${listing.address.addressLine3}. Apply now on ApprenticeWatch.`,
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
    "employmentType": "FULL TIME",
    "hiringOrganization": {
      "@type": "Organization",
      "name": listing.employerName,
      "sameAs": listing.employerWebsiteUrl || undefined
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
      }
    },
    "educationRequirements": {
      "@type": "EducationalOccupationalCredential",
      "credentialCategory": `Level ${listing.course.level} Apprenticeship`
    },
    "numberOfPositions": listing.numberOfPositions || 1,
    "employmentUnit": {
      "@type": "Organization",
      "name": listing.providerName
    },
    "baseSalary": listing.wage.wageType === 'Competitive Salary' ? undefined : {
      "@type": "MonetaryAmount",
      "currency": "GBP",
      "value": listing.wage.wageAdditionalInformation || "Negotiable",
      "unitText": listing.wage.wageUnit || "YEAR"
    },
    "jobBenefits": listing.wage.wageAdditionalInformation || undefined
  };

  return (
    <>
      <ListingDetails listing={listing} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingSchema) }} />
    </>
  );
}