import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI CV Optimisation Tool for Apprenticeships | ApprenticeWatch',
  description: 'Get instant AI-powered CV feedback tailored for apprenticeships. Optimise with expert recommendations and boost interview chances. Free tool - try now!',
  alternates: {
    canonical: 'https://apprenticewatch.com/optimise-cv'
  },
  openGraph: {
    title: 'AI-Powered CV Optimisation for Apprenticeships | ApprenticeWatch',
    description: 'Stand out in apprenticeship applications with AI-analysed CV feedback. Get tailored optimisation tips instantly.',
    url: 'https://apprenticewatch.com/optimise-cv',
    images: ['/media/meta/cv-optimise-page.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free AI CV Optimiser for Apprentice Applications',
    description: 'AI-powered analysis helps tailor your CV to apprenticeship job descriptions. Get interview-ready in minutes.',
    images: ['/media/meta/cv-optimise-page.png'],
  }
};

export default function OptimiseCVLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}