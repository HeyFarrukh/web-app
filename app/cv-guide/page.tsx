'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

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