import './globals.css';
import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from '@/services/analytics/analytics';

const inter = Inter({ subsets: ['latin'] });
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['500'], 
  style: ['italic', 'normal']
});
export const metadata: Metadata = {
  metadataBase: new URL('https://apprenticewatch.com'),
  title: {
    default: 'ApprenticeWatch - Discover Every Apprenticeship Opportunity',
    template: '%s | ApprenticeWatch'
  },
  description: 'Discover all apprenticeships in one place. Find opportunities, optimise your CV with AI, and access more features to help you land your first apprenticeship.',
  keywords: 'apprenticeships, UK apprenticeships, apprenticeship search, career opportunities, job training, vocational training, apprentice jobs, apprenticeship programs',
  authors: [{ name: 'ApprenticeWatch' }],
  creator: 'ApprenticeWatch',
  publisher: 'ApprenticeWatch',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: 'https://apprenticewatch.com'
  },
  icons: {
    icon: '/favicon/favicon.ico',
    shortcut: '/favicon/favicon.ico',
    apple: '/favicon/apple-touch-icon.png',
    other: [
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        url: '/favicon/favicon-32x32.png'
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        url: '/favicon/favicon-16x16.png'
      },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        url: '/favicon/apple-touch-icon.png'
      },
      {
        rel: 'manifest',
        url: '/favicon/site.webmanifest'
      }
    ]
  },
  manifest: '/favicon/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'en_GB',
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
    creator: '@apprenticewatch',
    site: '@apprenticewatch',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f97316' },
    { media: '(prefers-color-scheme: dark)', color: '#1f2937' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable}`}>
      <head>
        <link rel="icon" href="/favicon/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
        <link rel="manifest" href="/favicon/site.webmanifest" />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        <SpeedInsights />
      </body>
    </html>
  );
}