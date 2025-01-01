import React from 'react';
import { motion } from 'framer-motion';

const HighlightedText = ({ children }: { children: string }) => (
  <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 px-1 rounded">
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
        <motion.p 
          className="text-lg leading-relaxed text-gray-700 dark:text-gray-300"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Trying to keep track of all the apprenticeships out there is <HighlightedText>exhausting</HighlightedText>. 
          You're <HighlightedText>stuck</HighlightedText> jumping between a dozen websites, scrolling through posts, 
          and battling with job platforms that look like they haven't been updated since the early 2000s. 
          That's why we <HighlightedText>set out on a mission</HighlightedText> to make things <HighlightedText>easier for you</HighlightedText>. 
          No more fighting with <HighlightedText>clunky search filters</HighlightedText> or wondering if you've <HighlightedText>missed something</HighlightedText>. 
          We're here to <HighlightedText>take the stress out of the hunt</HighlightedText> and give you a <HighlightedText>simple, straightforward way</HighlightedText> to 
          find the <HighlightedText>opportunities that actually matter</HighlightedText>.
        </motion.p>
      </div>
    </section>
  );
};