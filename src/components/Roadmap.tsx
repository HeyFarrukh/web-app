import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const objectives = [
  { title: 'List All Apprenticeships in One Place', completed: true },
  { title: 'Test Driven AI CV-Optimised', completed: false },
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
        <div className="space-y-6">
          {objectives.map((objective, index) => (
            <motion.div
              key={objective.title}
              className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  objective.completed 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}>
                  {objective.completed && <Check className="w-5 h-5" />}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {objective.title}
                </h3>
              </div>
              <motion.div 
                className="mt-2 ml-12"
                initial={{ height: 0 }}
                whileHover={{ height: 'auto' }}
              >
                <p className="text-gray-600 dark:text-gray-400">
                  {objective.completed 
                    ? "✨ Completed and ready to use!"
                    : "🚀 Coming soon - We're working hard on this feature."}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};