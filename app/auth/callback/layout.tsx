import { Metadata } from 'next';
import { AuthCallbackClient } from './client';

export const metadata: Metadata = {
  title: 'Authenticating...',
  robots: {
    index: false,
    follow: false
  }
};

export default function AuthCallbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AuthCallbackClient />
      {children}
    </>
  );
}