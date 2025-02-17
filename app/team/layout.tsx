import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Team - ApprenticeWatch',
  description: 'Meet the visionary team behind ApprenticeWatch working to revolutionise how apprenticeships are discovered and accessed in the UK.',
  alternates: {
    canonical: 'https://apprenticewatch.com/team'
  },
  openGraph: {
    title: 'Our Team - ApprenticeWatch',
    description: 'Meet the visionary team behind ApprenticeWatch working to revolutionise how apprenticeships are discovered and accessed in the UK.',
    url: 'https://apprenticewatch.com/team',
    images: ['/media/team-og-image.png'],
  },
  twitter: {
    title: 'Our Team - ApprenticeWatch',
    description: 'Meet the visionary team behind ApprenticeWatch working to revolutionise how apprenticeships are discovered and accessed in the UK.',
    images: ['/media/team-og-image.png'],
  }
};

export default function TeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}