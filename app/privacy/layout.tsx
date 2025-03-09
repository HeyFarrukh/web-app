import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - ApprenticeWatch',
  description: 'Your privacy matters to us! Discover how we protect your data and use it responsibly to enhance your journey in finding the perfect apprenticeship.',
  alternates: {
    canonical: 'https://apprenticewatch.com/privacy'
  },
  openGraph: {
    title: 'Privacy Policy - ApprenticeWatch',
    description: 'Your privacy matters to us! Discover how we protect your data and use it responsibly to enhance your journey in finding the perfect apprenticeship.',
    url: 'https://apprenticewatch.com/privacy',
    images: ['/media/meta/privacy-policy.png'],
  },
  twitter: {
    title: 'Privacy Policy - ApprenticeWatch',
    description: 'Your privacy matters to us! Discover how we protect your data and use it responsibly to enhance your journey in finding the perfect apprenticeship.',
    images: ['/media/meta/privacy-policy.png'],
  }
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}