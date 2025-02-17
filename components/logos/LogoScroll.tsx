'use client';

import React from 'react';

const companyLogos = [
  { 
    name: 'Accenture', 
    url: '/assets/logos/accenture.svg',
    width: 120
  },
  { 
    name: 'Microsoft', 
    url: '/assets/logos/microsoft.svg',
    width: 120 
  },
  { 
    name: 'Google', 
    url: '/assets/logos/google.svg',
    width: 120 
  },
  { 
    name: 'Amazon', 
    url: '/assets/logos/amazon.svg',
    width: 120 
  },
  { 
    name: 'Lloyds Banking Group', 
    url: '/assets/logos/lloyds.svg',
    width: 120 
  },
  { 
    name: 'Deloitte', 
    url: '/assets/logos/deloitte.svg',
    width: 120 
  },
  { 
    name: 'IBM', 
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/IBM_logo.svg/2560px-IBM_logo.svg.png',
    width: 80 
  },
  { 
    name: 'BBC', 
    url: '/assets/logos/bbc.svg',
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