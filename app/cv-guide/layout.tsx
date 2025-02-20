import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CV Guide - ApprenticeWatch',
  description: 'Read the ApprenticeWatch CV Guide ! Molded by industry to help you make it to the next stage, and secure an apprenticeship.',
  alternates: {
    canonical: 'https://apprenticewatch.com/cv-guide'
  },
  openGraph: {
    title: 'CV Guide - ApprenticeWatch',
    description: 'Read the ApprenticeWatch CV Guide ! Molded by industry to help you make it to the next stage, and secure an apprenticeship.',
    url: 'https://apprenticewatch.com/cv-guide',
    images: ['/media/apprentice-watch.png'],
  },
  twitter: {
    title: 'CV Guide - ApprenticeWatch',
    description: 'Read the ApprenticeWatch CV Guide ! Molded by industry to help you make it to the next stage, and secure an apprenticeship.',
    images: ['/media/apprentice-watch.png'],
  }
};

export default function CVGuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}