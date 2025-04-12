'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Users, Briefcase, Cpu, ArrowRight, Star, FlaskConicalIcon } from 'lucide-react';
import { Analytics } from '@/services/analytics/analytics';

const benefits = [
  {
    icon: Award,
    title: 'Earn an Official Certificate',
    description: 'Boost your CV and LinkedIn with an ApprenticeWatch Ambassador certificate',
  },
  {
    icon: Star,
    title: 'Get Featured Publicly',
    description: 'Be showcased on our team page and across our social media platforms to thousands of users.',
  },
  {
    icon: FlaskConicalIcon,
    title: 'Exclusive Early Access',
    description: 'Try out our newest features before anyone else and help shape how they work.',
  },
  {
    icon: Cpu,
    title: 'Influence the Platform',
    description: 'Your feedback matters. Share your insights directly with the team to help shape ApprenticeWatch’s future.',
  },
  {
    icon: Users,
    title: 'Join a Powerful Network',
    description: 'Collaborate with other ambassadors and connect with professionals driving change in the apprenticeship space.',
  },
  {
    icon: Briefcase,
    title: 'Level Up Your Experience',
    description: 'Gain real-world skills in community leadership, marketing, event planning, and strategy – great for any future career.',
  },
];

export const JoinUs = () => {
  const [certificateOrder, setCertificateOrder] = useState<'default' | 'swapped'>('default');
  
  useEffect(() => {
    // Track Join Us page view
    Analytics.event('page_view', 'join_us_page');
  }, []);

  const handleApplyClick = () => {
    // Track ambassador application click
    Analytics.event('ambassador', 'apply_click');
    
    window.location.href = "https://docs.google.com/forms/d/e/1FAIpQLSc7hxOsfrgcIXNYpUy5WXvJL7VXX7NOU4O_gQxy4NEMTbxu0Q/viewform?usp=dialog";
  };

  const handleCertificateClick = () => {
    setCertificateOrder(prev => prev === 'default' ? 'swapped' : 'default');
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
          >
            Become an ApprenticeWatch{' '}
            <span className="text-orange-500">Ambassador</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
          >
            Join our mission to revolutionise apprenticeship discovery while developing your career
          </motion.p>
        </div>

        {/* Main Content with Certificates */}
        <div className="flex flex-col lg:flex-row gap-6 mb-10">
          {/* Benefits Grid - Reduced to 3 columns */}
          <div className="lg:w-3/5">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-orange-600/5 rounded-xl transform -rotate-1 group-hover:rotate-0 transition-transform duration-300" />
                  <div className="relative bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center mb-4">
                      <benefit.icon className="w-6 h-6 text-orange-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {benefit.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Certificate Images */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="lg:w-2/5 flex justify-center items-center relative mt-4 lg:mt-0"
          >
            <div className="relative w-full max-w-md h-[300px] sm:h-[350px] lg:h-[400px]">
              {/* White certificate */}
              <motion.div
                initial={{ rotate: -5, x: certificateOrder === 'default' ? 0 : 0 }}
                animate={{ 
                  rotate: certificateOrder === 'default' ? -5 : 5,
                  x: certificateOrder === 'default' ? 16 : 0,
                  y: certificateOrder === 'default' ? 16 : 0,
                  scale: certificateOrder === 'default' ? 0.95 : 1.02,
                  zIndex: certificateOrder === 'default' ? 1 : 3
                }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 20
                }}
                onClick={handleCertificateClick}
                whileHover={{ scale: certificateOrder === 'default' ? 0.97 : 1.04 }}
                className="absolute cursor-pointer shadow-xl rounded-lg overflow-hidden"
                style={{ width: '90%', height: 'auto' }}
              >
                <img
                  src="https://cdn.apprenticewatch.com/assets/pages/join/Ambassador-Certificate-White.png"
                  alt="ApprenticeWatch Ambassador Certificate - White"
                  width={500}
                  height={350}
                  className="w-full h-auto"
                />
              </motion.div>
              
              {/* Themed certificate */}
              <motion.div
                initial={{ rotate: 5, x: certificateOrder === 'default' ? 0 : 0 }}
                animate={{ 
                  rotate: certificateOrder === 'default' ? 5 : -5,
                  x: certificateOrder === 'default' ? 0 : 16,
                  y: certificateOrder === 'default' ? 0 : 16,
                  scale: certificateOrder === 'default' ? 1.02 : 0.95,
                  zIndex: certificateOrder === 'default' ? 2 : 1
                }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 20
                }}
                onClick={handleCertificateClick}
                whileHover={{ scale: certificateOrder === 'default' ? 1.04 : 0.97 }}
                className="absolute cursor-pointer shadow-xl rounded-lg overflow-hidden"
                style={{ width: '90%', height: 'auto', marginLeft: 'auto' }}
              >
                <img
                  src="https://cdn.apprenticewatch.com/assets/pages/join/Ambassador-Certificate-Themed.png"
                  alt="ApprenticeWatch Ambassador Certificate - Themed"
                  width={500}
                  height={350}
                  className="w-full h-auto"
                />
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-6"
        >
          <motion.button
            onClick={handleApplyClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group inline-flex items-center space-x-2 px-8 py-4 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors font-semibold shadow-lg hover:shadow-xl"
          >
            <span>Apply to Become an Ambassador</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Applications are reviewed on a rolling basis
          </p>
        </motion.div>
      </div>
    </div>
  );
};