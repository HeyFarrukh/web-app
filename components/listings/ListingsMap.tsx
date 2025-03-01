'use client';

import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin } from 'lucide-react';
import { ListingType } from '@/types/listing';
import Link from 'next/link';

interface ListingsMapProps {
  listings: ListingType[];
}

export const ListingsMap: React.FC<ListingsMapProps> = ({ listings }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  
  // Filter out listings with invalid coordinates
  const validListings = listings.filter(listing => 
    listing.location && 
    typeof listing.location.latitude === 'number' && 
    typeof listing.location.longitude === 'number' &&
    listing.location.latitude !== 0 &&
    listing.location.longitude !== 0
  );
  
  useEffect(() => {
    if (!mapContainer.current) return;
    
    // Set Mapbox access token from environment variable
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
    
    if (!mapboxgl.accessToken) {
      console.error('Mapbox access token is missing');
      return;
    }
    
    // Great Britain bounds (excluding Ireland completely)
    const gbBounds = {
      north: 58.7, // Northern Scotland
      south: 50.0, // Southern England
      west: -6.0,  // Western Scotland/Wales
      east: 1.8    // Eastern England
    };
    
    // Default to a view centered on Great Britain
    let latitude = 54.0; // Center of Great Britain (between England and Scotland)
    let longitude = -1.6; // Center of Great Britain
    let zoom = 5.2; // Zoom level to show Great Britain clearly
    
    if (validListings.length === 1) {
      // If there's only one listing, center on it and zoom in
      latitude = validListings[0].location.latitude;
      longitude = validListings[0].location.longitude;
      zoom = 13;
    } else if (validListings.length > 1) {
      // Calculate bounds for all listings
      const lats = validListings.map(listing => listing.location.latitude);
      const lngs = validListings.map(listing => listing.location.longitude);
      
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      
      // Use listing bounds but ensure we stay within Great Britain
      latitude = (minLat + maxLat) / 2;
      longitude = (minLng + maxLng) / 2;
      
      // Adjust zoom level based on the spread of listings
      const latDiff = maxLat - minLat;
      const lngDiff = maxLng - minLng;
      const maxDiff = Math.max(latDiff, lngDiff);
      
      if (maxDiff > 5) zoom = 4.8;
      else if (maxDiff > 2) zoom = 5.2;
      else if (maxDiff > 1) zoom = 6;
      else if (maxDiff > 0.5) zoom = 7;
      else if (maxDiff > 0.1) zoom = 8;
      else if (maxDiff > 0.05) zoom = 9;
      else if (maxDiff > 0.01) zoom = 10;
      else zoom = 11;
    }
    
    console.log(`Creating map with ${validListings.length} valid listings`);
    console.log(`Center: [${longitude}, ${latitude}], Zoom: ${zoom}`);
    
    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [longitude, latitude],
      zoom: zoom,
      attributionControl: false, // Hide the default attribution
      maxBounds: [
        [gbBounds.west - 1, gbBounds.south - 1], // Southwest coordinates
        [gbBounds.east + 1, gbBounds.north + 1]  // Northeast coordinates
      ]
    });
    
    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    // Clean up previous markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Wait for map to load before adding markers
    map.current.on('load', () => {
      console.log(`Map loaded, adding ${validListings.length} markers`);
      
      // Add markers for each valid listing
      validListings.forEach(listing => {
        // Create marker element
        const markerEl = document.createElement('div');
        markerEl.className = 'text-orange-500 hover:scale-110 transition-transform';
        markerEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#f97316" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
        
        // Create popup content
        const popupContent = document.createElement('div');
        popupContent.className = 'p-2 max-w-[250px]';
        
        // Format address
        const formattedAddress = `${listing.address.addressLine1}, ${listing.address.postcode}`;
        
        popupContent.innerHTML = `
          <div class="flex items-center space-x-1 mb-1">
            <span class="font-semibold text-sm">${listing.employerName}</span>
          </div>
          <p class="text-xs mb-2 font-medium">${listing.title}</p>
          <p class="text-xs text-gray-600 mb-2">${formattedAddress}</p>
          <a href="/apprenticeships/${listing.id}" class="text-xs text-orange-500 hover:text-orange-600 font-medium">View Details</a>
        `;
        
        // Create popup
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setDOMContent(popupContent);
        
        console.log(`Adding marker at [${listing.location.longitude}, ${listing.location.latitude}] for ${listing.title}`);
        
        // Create marker
        const marker = new mapboxgl.Marker(markerEl)
          .setLngLat([listing.location.longitude, listing.location.latitude])
          .setPopup(popup)
          .addTo(map.current!);
          
        markersRef.current.push(marker);
      });
    });
    
    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
    };
  }, [validListings]);
  
  return (
    <div className="w-full h-[500px] rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 relative">
      <div ref={mapContainer} className="w-full h-full" />
      
      {validListings.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <div className="text-center p-4">
            <MapPin className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No Locations Found</h3>
            <p className="text-gray-600 dark:text-gray-300 mt-1">There are no apprenticeships with location data matching your search.</p>
          </div>
        </div>
      )}
    </div>
  );
};