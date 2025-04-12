import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy - ApprenticeWatch',
  description: 'Learn how ApprenticeWatch uses cookies to enhance your experience, improve our services, and ensure website functionality.',
  alternates: {
    canonical: 'https://apprenticewatch.com/cookie-policy'
  },
  openGraph: {
    title: 'Cookie Policy - ApprenticeWatch',
    description: 'Learn how ApprenticeWatch uses cookies to enhance your experience, improve our services, and ensure website functionality.',
    url: 'https://apprenticewatch.com/cookie-policy',
    images: ['https://cdn.apprenticewatch.com/meta/cookie-policy.png'],
  },
  twitter: {
    title: 'Cookie Policy - ApprenticeWatch',
    description: 'Learn how ApprenticeWatch uses cookies to enhance your experience, improve our services, and ensure website functionality.',
    images: ['https://cdn.apprenticewatch.com/meta/cookie-policy.png'],
  }
};



export default function CookieLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}