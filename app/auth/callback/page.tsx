import React from 'react';

export const dynamic = 'force-static';

export default function AuthCallback() {
  return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
    </div>
  );
}