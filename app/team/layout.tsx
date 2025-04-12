import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Team - ApprenticeWatch',
  description: 'Meet the talented team driving ApprenticeWatch forward, committed to transforming how apprenticeships are discovered and accessed across the UK.',
  alternates: {
    canonical: 'https://apprenticewatch.com/team'
  },
  openGraph: {
    title: 'Our Team - ApprenticeWatch',
    description: 'Meet the talented team driving ApprenticeWatch forward, committed to transforming how apprenticeships are discovered and accessed across the UK.',
    url: 'https://apprenticewatch.com/team',
    images: ['https://cdn.apprenticewatch.com/meta/ourteam.png'],
  },
  twitter: {
    title: 'Our Team - ApprenticeWatch',
    description: 'Meet the talented team driving ApprenticeWatch forward, committed to transforming how apprenticeships are discovered and accessed across the UK.',
    images: ['https://cdn.apprenticewatch.com/meta/ourteam.png'],
  }
};


export default function TeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}