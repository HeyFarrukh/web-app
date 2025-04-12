'use client';

import React from 'react';

const companyLogos = [
  { 
    name: 'Accenture', 
    url: 'https://cdn.apprenticewatch.com/assets/logos/accenture.svg',
    width: 120
  },
  { 
    name: 'Microsoft', 
    url: 'https://cdn.apprenticewatch.com/assets/logos/microsoft.svg',
    width: 120 
  },
  { 
    name: 'Google', 
    url: 'https://cdn.apprenticewatch.com/assets/logos/google.svg',
    width: 120 
  },
  { 
    name: 'Amazon', 
    url: 'https://cdn.apprenticewatch.com/assets/logos/amazon.svg',
    width: 120 
  },
  { 
    name: 'Lloyds Banking Group', 
    url: 'https://cdn.apprenticewatch.com/assets/logos/lloyds.svg',
    width: 120 
  },
  { 
    name: 'Deloitte', 
    url: 'https://cdn.apprenticewatch.com/assets/logos/deloitte.svg',
    width: 120 
  },
  { 
    name: 'IBM', 
    url: 'https://cdn.apprenticewatch.com/assets/logos/IBM_logo.svg.png',
    width: 80 
  },
  { 
    name: 'BBC', 
    url: 'https://cdn.apprenticewatch.com/assets/logos/bbc.svg',
    width: 80 
  }
];

const allLogos = [...companyLogos, ...companyLogos];

export const LogoScroll = () => {
  return (
    <div className="animate-scroll">
      {allLogos.map((logo, index) => (
        <div
          key={`${logo.name}-${index}`}
          className="inline-flex items-center justify-center mx-12 flex-shrink-0"
        >
          <img
            src={logo.url}
            alt={`${logo.name} logo`}
            style={{ width: logo.width }}
            className="h-12 object-contain grayscale dark:invert transition-all duration-300"
          />
        </div>
      ))}
    </div>
  );
};