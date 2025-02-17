import { Metadata } from 'next';
import { Hero } from '@/components/Hero';
import { WeGetIt } from '@/components/WeGetIt';
import { Roadmap } from '@/components/Roadmap';

export const metadata: Metadata = {
  title: 'ApprenticeWatch - Discover Every Apprenticeship Opportunity',
  description: 'Discover all apprenticeships in one place. Find opportunities, optimise your CV with AI, and access more features to help you land your first apprenticeship.',
  alternates: {
    canonical: 'https://apprenticewatch.com'
  },
  openGraph: {
    type: 'website',
    url: 'https://apprenticewatch.com/',
    siteName: 'ApprenticeWatch',
    title: 'ApprenticeWatch - Discover Every Apprenticeship Opportunity',
    description: 'Discover all apprenticeships in one place. Find opportunities, optimise your CV with AI, and access more features to help you land your first apprenticeship.',
    images: [
      {
        url: 'https://apprenticewatch.com/media/apprentice-watch.png',
        width: 1200,
        height: 630,
        alt: 'ApprenticeWatch',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ApprenticeWatch - Discover Every Apprenticeship Opportunity',
    description: 'Discover all apprenticeships in one place. Find opportunities, optimise your CV with AI, and access more features to help you land your first apprenticeship.',
    images: ['https://apprenticewatch.com/media/apprentice-watch.png'],
  }
};

export default function Home() {
  return (
    <>
      <Hero />
      <WeGetIt />
      <Roadmap />
    </>
  );
}