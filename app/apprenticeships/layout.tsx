import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Apprenticeship Listings | Find Your Perfect Opportunity',
  description: 'Browse the latest apprenticeship opportunities from top UK companies. Filter by location, industry, and more to find your perfect apprenticeship match.',
  alternates: {
    canonical: 'https://apprenticewatch.com/apprenticeships'
  },
  openGraph: {
    title: 'Apprenticeship Listings | ApprenticeWatch',
    description: 'Browse the latest apprenticeship opportunities from top UK companies. Filter by location, industry, and more to find your perfect apprenticeship match.',
    url: 'https://apprenticewatch.com/apprenticeships',
    images: ['https://cdn.apprenticewatch.com/meta/listings.png'],
  },
  twitter: {
    title: 'Apprenticeship Listings | ApprenticeWatch',
    description: 'Browse the latest apprenticeship opportunities from top UK companies. Filter by location, industry, and more to find your perfect apprenticeship match.',
    images: ['https://cdn.apprenticewatch.com/meta/listings.png'],
  }
};

export default function ApprenticeshipLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}