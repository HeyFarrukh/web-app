import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Join ApprenticeWatch | Become an Ambassador',
  description: 'Join ApprenticeWatch as a Brand Ambassador. Shape the future of apprenticeships, gain valuable experience, and boost your career prospects.',
  alternates: {
    canonical: 'https://apprenticewatch.com/join'
  },
  openGraph: {
    title: 'Join ApprenticeWatch | Become an Ambassador',
    description: 'Join ApprenticeWatch as a Brand Ambassador. Shape the future of apprenticeships, gain valuable experience, and boost your career prospects.',
    url: 'https://apprenticewatch.com/join',
    images: ['/media/join-us-og-image.png'],
  },
  twitter: {
    title: 'Join ApprenticeWatch | Become an Ambassador',
    description: 'Join ApprenticeWatch as a Brand Ambassador. Shape the future of apprenticeships, gain valuable experience, and boost your career prospects.',
    images: ['/media/join-us-og-image.png'],
  }
};

export default function JoinLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}