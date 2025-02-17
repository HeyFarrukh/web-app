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
  },
  twitter: {
    title: 'Apprenticeship Listings | ApprenticeWatch',
    description: 'Browse the latest apprenticeship opportunities from top UK companies. Filter by location, industry, and more to find your perfect apprenticeship match.',
  }
};

export default function ApprenticeshipLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}