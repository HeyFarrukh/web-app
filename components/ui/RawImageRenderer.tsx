'use client';

import React, { useEffect } from 'react';

/**
 * Component that replaces Next.js Image components with regular img tags for cdn.apprenticewatch.com images
 * This fixes the "url parameter is not allowed" error in production
 */
export default function RawImageRenderer() {
  useEffect(() => {
    // Function to convert Next.js image to regular img
    const convertNextImageToRawImg = () => {
      // Get all img elements that might be using Next.js Image optimization
      const images = document.querySelectorAll('img[src^="/_next/image"]');
      
      images.forEach((img) => {
        const src = img.getAttribute('src');
        if (!src) return;
        
        // Check if it's a cdn.apprenticewatch.com image
        const urlParam = new URLSearchParams(src.split('?')[1]).get('url');
        if (!urlParam || !urlParam.includes('cdn.apprenticewatch.com')) return;
        
        // Decode the URL and replace the Next.js image with a regular img
        const decodedUrl = decodeURIComponent(urlParam);
        img.setAttribute('src', decodedUrl);
        
        // Remove Next.js specific attributes
        img.removeAttribute('srcset');
        img.removeAttribute('loading');
        img.removeAttribute('decoding');
        img.removeAttribute('style'); // Remove any Next.js inline styles
        
        // Add appropriate styling
        const imgElement = img as HTMLImageElement;
        imgElement.style.maxWidth = '100%';
        imgElement.style.height = 'auto';
      });
    };

    // Run the conversion
    convertNextImageToRawImg();
    
    // Set up a mutation observer to handle dynamically loaded content
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          convertNextImageToRawImg();
        }
      });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Clean up the observer on component unmount
    return () => observer.disconnect();
  }, []);

  return null; // This component doesn't render anything
}
