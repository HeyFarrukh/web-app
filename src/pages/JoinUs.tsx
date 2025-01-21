import React from 'react';
import { motion } from 'framer-motion';
import { Award, Users, Briefcase, Cpu } from 'lucide-react';

const benefits = [
  {
    icon: Award,
    title: 'Earn a Certificate',
    description: 'Receive an official ApprenticeWatch Ambassador certificate to improve your LinkedIn Profile and CV!',
  },
  {
    icon: Cpu,
    title: 'Shape the Future',
    description: 'Share your ideas and help us make ApprenticeWatch even better for everyone!',
  },
  {
    icon: Users,
    title: 'Drive Community Change',
    description: 'Join meetings with fellow ambassadors and industry leaders to shape the future of apprenticeships.',
  },
  {
    icon: Briefcase,
    title: 'Boost Your CV',
    description: 'Gain valuable experience in community leadership, event organisation, and digital marketing.',
  },
];

export const JoinUs = () => {
  return (
    <div className="min-h-screen pt-24 pb-12 bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
          >
            Become an ApprenticeWatch Ambassador
          </motion.h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Help shape the future of apprenticeships while developing your career
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <benefit.icon className="w-12 h-12 text-orange-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {benefit.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <button className="px-8 py-4 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors font-semibold">
            Apply to Become an Ambassador
          </button>
        </div>
      </div>
    </div>
  );
};