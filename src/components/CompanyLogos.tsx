import React from 'react';
import { motion } from 'framer-motion';

const companyLogos = [
  { name: 'Google', url: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png' },
  { name: 'Microsoft', url: 'https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE1Mu3b?ver=5c31' },
  { name: 'Apple', url: 'https://www.apple.com/ac/globalnav/7/en_US/images/be15095f-5a20-57d0-ad14-cf4c638e223a/globalnav_apple_image__b5er5ngrzxqq_large.svg' },
  { name: 'Amazon', url: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg' },
  { name: 'Meta', url: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg' },
];

export const CompanyLogos = () => {
  return (
    <div className="mt-16">
      <motion.h3 
        className="text-center text-2xl font-bold text-gray-800 dark:text-white mb-8 tracking-tight"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        Top Companies Hiring Apprentices
      </motion.h3>
      <div className="relative overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-orange-50 dark:from-gray-900 to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-orange-50 dark:from-gray-900 to-transparent z-10" />
        <motion.div 
          className="flex space-x-24 py-12"
          animate={{ 
            x: [0, -2400],
          }}
          transition={{ 
            duration: 40,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          {[...companyLogos, ...companyLogos, ...companyLogos, ...companyLogos].map((logo, index) => (
            <motion.div
              key={`${logo.name}-${index}`}
              className="flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <img
                src={logo.url}
                alt={`${logo.name} logo`}
                className="h-12 grayscale hover:grayscale-0 transition-all duration-300"
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
      
      <motion.div 
        className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        {[
          {
            value: "500+",
            label: "Active Apprenticeships",
            description: "Updated daily from top companies across the UK"
          },
          {
            value: "98%",
            label: "Success Rate",
            description: "Of our users successfully land apprenticeships"
          },
          {
            value: "24/7",
            label: "AI Support",
            description: "Get help with applications anytime, anywhere"
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 + (index * 0.1) }}
          >
            <div className="text-3xl font-bold text-orange-500 mb-2">{stat.value}</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{stat.label}</div>
            <p className="text-gray-600 dark:text-gray-400">{stat.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};