import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Dashboard - ApprenticeWatch',
  description: 'Manage your application progress, saved apprenticeships and personal settings in your ApprenticeWatch dashboard.',
  robots: {
    index: false,
    follow: false
  }
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}