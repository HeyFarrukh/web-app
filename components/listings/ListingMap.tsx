'use client';

import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { ListingType } from '@/types/listing';
import { MapPin, Building2 } from 'lucide-react';

interface ListingMapProps {
  listing?: ListingType;
  height?: string;
  // Keep old props for backward compatibility
  latitude?: number;
  longitude?: number;
  employerName?: string;
  title?: string;
  address?: {
    addressLine1: string;
    addressLine2?: string;
    addressLine3?: string;
    postcode: string;
  };
}

export const ListingMap: React.FC<ListingMapProps> = ({ 
  listing,
  height = '300px',
  // Handle old props
  latitude,
  longitude,
  employerName,
  title,
  address
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = React.useState(false);
  const [showNoLocationOverlay, setShowNoLocationOverlay] = React.useState(false);

  // Use either the new listing prop or the old individual props
  const lat = listing?.location.latitude ?? latitude;
  const lng = listing?.location.longitude ?? longitude;
  const name = listing?.employerName ?? employerName;
  const jobTitle = listing?.title ?? title;
  const addr = listing?.address ?? address;

  // Format address for display
  const formattedAddress = addr ? [
    addr.addressLine1,
    addr.addressLine2,
    addr.addressLine3,
    addr.postcode
  ].filter(Boolean).join(', ') : '';

  // Check if coordinates are valid
  const hasValidCoordinates = lat && lng && 
    !isNaN(lat) && !isNaN(lng) && 
    lat !== 0 && lng !== 0;

  // Default to London coordinates if no valid coordinates are provided
  const mapLatitude = hasValidCoordinates ? lat : 51.5074;
  const mapLongitude = hasValidCoordinates ? lng : -0.1278;

  useEffect(() => {
    if (!mapContainer.current) return;
    
    // Set Mapbox access token from environment variable
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
    
    if (!mapboxgl.accessToken) {
      console.error('Mapbox access token is missing');
      return;
    }

    // UK bounds
    const ukBounds = {
      north: 58.7, // Northern Scotland
      south: 50.0, // Southern England
      west: -8.0,  // Western Ireland
      east: 1.8    // Eastern England
    };
    
    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [mapLongitude, mapLatitude],
      zoom: 14,
      attributionControl: false, // Hide the default attribution
      maxBounds: [
        [ukBounds.west - 1, ukBounds.south - 1], // Southwest coordinates
        [ukBounds.east + 1, ukBounds.north + 1]  // Northeast coordinates
      ]
    });
    
    // Add custom attribution without "Improve this map" link
    map.current.addControl(new mapboxgl.AttributionControl({
      customAttribution: 'Mapbox'
    }));
    
    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    // Add fullscreen control
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    map.current.on('load', () => {
      setMapLoaded(true);
      if (!map.current) return;
      
      if (hasValidCoordinates) {
        // Create marker element
        const markerEl = document.createElement('div');
        markerEl.className = 'text-orange-500';
        markerEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#f97316" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
        
        // Create popup content
        const popupContent = document.createElement('div');
        popupContent.className = 'p-2 max-w-[250px]';
        
        popupContent.innerHTML = `
          <div class="flex items-center space-x-1 mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-orange-500"><path d="M6 3v18"/><path d="M18 3v18"/><path d="M3 6h18"/><path d="M3 18h18"/></svg>
            <span class="font-semibold text-sm">${name}</span>
          </div>
          <p class="text-xs mb-1">${jobTitle}</p>
          <p class="text-xs text-gray-600">${formattedAddress}</p>
        `;
        
        // Create popup
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setDOMContent(popupContent);
        
        // Create marker
        marker.current = new mapboxgl.Marker(markerEl)
          .setLngLat([mapLongitude, mapLatitude])
          .setPopup(popup)
          .addTo(map.current);
      } else {
        setShowNoLocationOverlay(true);
      }
    });

    // Cleanup on unmount
    return () => {
      if (marker.current) {
        marker.current.remove();
        marker.current = null;
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapLatitude, mapLongitude, hasValidCoordinates, name, jobTitle, formattedAddress]);

  return (
    <div className="w-full rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 relative" style={{ height }}>
      <div ref={mapContainer} className="w-full h-full" />
      
      {!hasValidCoordinates && mapLoaded && showNoLocationOverlay && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <div className="text-center p-4">
            <MapPin className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Location Not Available</h3>
            <p className="text-gray-600 dark:text-gray-300 mt-1">The exact location for this apprenticeship is not available.</p>
          </div>
        </div>
      )}
    </div>
  );
};
