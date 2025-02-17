'use client';

import React from 'react';
import { motion } from 'framer-motion';

const HighlightedText: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="text-orange-500 dark:text-orange-400 font-medium">
    {children}
  </span>
);

export const WeGetIt = () => {
  return (
    <section id="why-us" className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2 
          className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          We Get It.
        </motion.h2>
        <motion.div 
          className="text-lg leading-relaxed text-gray-700 dark:text-gray-300 space-y-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="bg-gradient-to-r from-orange-50/50 to-transparent dark:from-orange-900/10 dark:to-transparent p-6 rounded-2xl border border-orange-100/50 dark:border-orange-500/10">
            <p className="mb-4">
              Trying to keep track of all the apprenticeships out there is <HighlightedText>exhausting</HighlightedText>. You&apos;re <HighlightedText>stuck</HighlightedText> jumping between a dozen websites, scrolling through posts, and battling with job platforms that look like they haven&apos;t been updated since the early 2000s.
            </p>
            
            <p className="mb-4">
              That&apos;s why we <HighlightedText>set out on a mission</HighlightedText> to make things <HighlightedText>easier for you</HighlightedText>.
            </p>
            
            <p>
              No more fighting with <HighlightedText>clunky search filters</HighlightedText> or wondering if you&apos;ve <HighlightedText>missed something</HighlightedText>. We&apos;re here to <HighlightedText>take the stress out</HighlightedText> of the hunt and give you a <HighlightedText>simple, straightforward way</HighlightedText> to find the opportunities that actually matter.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};