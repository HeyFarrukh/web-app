import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CV Guide',
  description: 'Read the ApprenticeWatch CV Guide to craft a standout CV and increase your chances of securing an apprenticeship, advancing your career. Expertly designed by industry professionals, this guide will help you take the next step in your career journey.',
  alternates: {
    canonical: 'https://apprenticewatch.com/cv-guide'
  },
  openGraph: {
    title: 'CV Guide - ApprenticeWatch',
    description: 'Read the ApprenticeWatch CV Guide to craft a standout CV and increase your chances of securing an apprenticeship,advancing your career. Expertly designed by industry professionals, this guide will help you take the next step in your career journey.',
    url: 'https://apprenticewatch.com/cv-guide',
    images: ['/media/apprentice-watch.png'],
  },
  twitter: {
    title: 'CV Guide - ApprenticeWatch',
    description: 'Read the ApprenticeWatch CV Guide to craft a standout CV and increase your chances of securing an apprenticeship, advancing your career. Expertly designed by industry professionals, this guide will help you take the next step in your career journey.',
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