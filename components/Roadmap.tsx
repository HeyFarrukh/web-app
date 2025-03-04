'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const objectives = [
  { title: 'AI CV-Optimisation', completed: true },
  { title: 'CV Guide', completed: true },
  { title: 'List All Apprenticeships in One Place', completed: false },
  { title: 'Cover Letter Guide', completed: false },
  { title: 'Apprenticeship Community', completed: false },
  { title: 'Mentor Matching', completed: false },
  { title: 'AI Virtual Interview Preparation', completed: false },
];

export const Roadmap = () => {
  return (
    <section id="roadmap" className="py-20 bg-orange-50 dark:bg-gray-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2 
          className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          RoadMap
        </motion.h2>
        <div className="space-y-4 md:space-y-6">
          {objectives.map((objective, index) => (
            <motion.div
              key={objective.title}
              className="bg-white dark:bg-gray-900 rounded-lg p-4 md:p-6 shadow-lg hover:shadow-xl transition-shadow"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  objective.completed 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}>
                  {objective.completed && <Check className="w-5 h-5" />}
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
                    {objective.title}
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                    {objective.completed 
                      ? "✨ Completed and ready to use!"
                      : "🚀 Coming soon - We're working hard on this feature."}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};