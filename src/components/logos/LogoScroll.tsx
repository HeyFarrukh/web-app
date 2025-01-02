import React from 'react';
import { motion } from 'framer-motion';

const companyLogos = [
  { 
    name: 'Google', 
    url: 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png',
    width: 120 
  },
  { 
    name: 'Microsoft', 
    url: 'https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE1Mu3b?ver=5c31',
    width: 110 
  },
  { 
    name: 'Apple', 
    url: 'https://www.apple.com/ac/globalnav/7/en_US/images/be15095f-5a20-57d0-ad14-cf4c638e223a/globelnav_apple_image__b5er5ngrzxqq_large.svg',
    width: 40 
  },
  { 
    name: 'Amazon', 
    url: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
    width: 100 
  },
  { 
    name: 'Meta', 
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Meta_Platforms_Inc._logo.svg/800px-Meta_Platforms_Inc._logo.svg.png',
    width: 80 
  },
];

// Double the logos array for continuous scroll
const allLogos = [...companyLogos, ...companyLogos];

export const LogoScroll = () => {
  return (
    <div className="animate-scroll">
      {allLogos.map((logo, index) => (
        <motion.div
          key={`${logo.name}-${index}`}
          className="inline-flex items-center justify-center mx-12 flex-shrink-0"
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <img
            src={logo.url}
            alt={`${logo.name} logo`}
            style={{ width: logo.width }}
            className="h-12 object-contain grayscale hover:grayscale-0 transition-all duration-300"
          />
        </motion.div>
      ))}
    </div>
  );
};