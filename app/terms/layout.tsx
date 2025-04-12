import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - ApprenticeWatch',
  description: 'Understand the terms and conditions of using ApprenticeWatch. Learn about your rights, responsibilities, and how we operate to help you find the perfect apprenticeship.',
  alternates: {
    canonical: 'https://apprenticewatch.com/terms'
  },
  openGraph: {
    title: 'Terms of Service - ApprenticeWatch',
    description: 'Understand the terms and conditions of using ApprenticeWatch. Learn about your rights, responsibilities, and how we operate to help you find the perfect apprenticeship.',
    url: 'https://apprenticewatch.com/terms',
    images: ['https://cdn.apprenticewatch.com/meta/terms-of-service.png'],
  },
  twitter: {
    title: 'Terms of Service - ApprenticeWatch',
    description: 'Understand the terms and conditions of using ApprenticeWatch. Learn about your rights, responsibilities, and how we operate to help you find the perfect apprenticeship.',
    images: ['https://cdn.apprenticewatch.com/meta/terms-of-service.png'],
  }
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}