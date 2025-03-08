'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Redirects the user to the new CV Guide page.
 *
 * Upon mounting, this component uses Next.js's routing to immediately navigate to "/resources/cv-guide".
 * While the redirect is in progress, it displays a message to inform the user.
 */
export default function CVGuidePage() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/resources/cv-guide');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-lg">Redirecting to new CV Guide...</p>
    </div>
  );
}