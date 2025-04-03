'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, MapPin, Rocket, Users, Brain, Briefcase, Star, Award } from 'lucide-react';

const objectives = [
  { 
    title: 'AI CV-Optimisation',
    description: 'Craft the perfect CV with AI assistance',
    completed: true,
    icon: Brain,
    rotate: '-2deg',
    color: 'bg-yellow-100'
  },
  { 
    title: 'Resource Hub',
    description: 'Everything you need to succeed in one place',
    completed: true,
    icon: Star,
    rotate: '1deg',
    color: 'bg-blue-100'
  },
  { 
    title: 'List All Apprenticeships in One Place',
    description: 'Find your dream apprenticeship easily',
    completed: false,
    icon: Briefcase,
    rotate: '-1deg',
    color: 'bg-green-100'
  },
  { 
    title: 'Apprenticeship Community',
    description: 'Connect with fellow apprentices',
    completed: false,
    icon: Users,
    rotate: '2deg',
    color: 'bg-pink-100'
  },
  { 
    title: 'Mentor Matching',
    description: 'Get guidance from industry experts',
    completed: false,
    icon: Award,
    rotate: '-1.5deg',
    color: 'bg-purple-100'
  },
  { 
    title: 'AI Virtual Interview Preparation',
    description: 'Practice and perfect your interview skills',
    completed: false,
    icon: Rocket,
    rotate: '1.5deg',
    color: 'bg-orange-100'
  },
];

export const Roadmap = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-5xl mx-auto">
        <motion.h2 
          className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Our Roadmap 📌
        </motion.h2>

        {/* Board background */}
        <div className="relative p-8 bg-white/20 dark:bg-gray-800/20 backdrop-blur-md border border-white/30 dark:border-gray-700/40 rounded-xl shadow-2xl">
          {/* Board texture */}
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full" style={{ 
              backgroundImage: `radial-gradient(circle at center, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 2%)`,
              backgroundSize: '8px 8px'
            }} />
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {objectives.map((objective, index) => (
              <motion.div
                key={objective.title}
                className={`relative ${objective.color} p-6 shadow-lg group backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border border-white/50 dark:border-gray-700/50 rounded-lg`}
                style={{ 
                  transform: `rotate(${objective.rotate})`,
                  transformOrigin: 'center'
                }}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.02, 
                  rotate: '0deg',
                  transition: { duration: 0.2 }
                }}
              >
                {/* Pin effect */}
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg" />
                  <div className="w-2 h-2 rounded-full bg-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>

                {/* Content */}
                <div className="mt-3">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 rounded bg-gradient-to-r from-orange-500 to-orange-600">
                      <objective.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className={`text-lg font-bold text-gray-800 dark:text-white flex-1 ${
                      objective.completed ? 'line-through decoration-2 decoration-orange-500' : ''
                    }`}>
                      {objective.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {objective.description}
                  </p>
                  
                  {/* Status tag */}
                  <div className={`
                    inline-flex items-center gap-1 mt-4 px-3 py-1 rounded-full text-sm
                    ${objective.completed
                      ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                      : 'bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300'}
                  `}>
                    {objective.completed ? '✨ Done!' : '🚀 Coming Soon'}
                  </div>

                  {/* Tape effect */}
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-12 h-3 bg-white/30 dark:bg-white/10 rotate-3" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};