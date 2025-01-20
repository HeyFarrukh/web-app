import React from 'react';

const companyLogos = [
  { 
    name: 'Accenture', 
    url: 'https://upload.wikimedia.org/wikipedia/commons/1/1c/Accenture_logo.svg',
    width: 120
  },
  { 
    name: 'Microsoft', 
    url: 'https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE1Mu3b?ver=5c31',
    width: 120 
  },
  { 
    name: 'Google', 
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/2560px-Google_2015_logo.svg.png',
    width: 120 
  },
  { 
    name: 'Amazon', 
    url: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
    width: 120 
  },
  { 
    name: 'Meta', 
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Meta_Platforms_Inc._logo.svg/800px-Meta_Platforms_Inc._logo.svg.png',
    width: 120 
  },
  { 
    name: 'Deloitte', 
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Deloitte.svg/2560px-Deloitte.svg.png',
    width: 120 
  },
  { 
    name: 'IBM', 
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/IBM_logo.svg/2560px-IBM_logo.svg.png',
    width: 80 
  },
  { 
    name: 'BBC', 
    url: 'https://upload.wikimedia.org/wikipedia/commons/4/41/BBC_Logo_2021.svg',
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