'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Briefcase, GraduationCap, Trophy, Code, BookMarked, Bot, NotebookText, Files } from 'lucide-react';
import Link from 'next/link'; // Import Link component from next/link

export const Sidebar = () => {
  const links = [
    { icon: <FileText />, label: 'Master CV', href: '#master-cv' },
    { icon: <Briefcase />, label: 'Professional', href: '#professional' },
    { icon: <GraduationCap />, label: 'Education', href: '#education' },
    { icon: <Trophy />, label: 'Leadership/Activities', href: '#leadership' },
    { icon: <Code />, label: 'Skills/Interests', href: '#skills' },
    { icon: <Files />, label: 'CV Comparisons', href: '#example-pdf' },
    { icon: <BookMarked />, label: 'Overview', href: '#overview' },
    { icon: <Bot />, label: 'Try CV Optimiser', href: '/optimise-cv' }, // This is an external route
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();

      const targetElement = document.querySelector(href) as HTMLElement;
      if (targetElement) {
        // Scroll to the target element with an offset (e.g., 100px from top)
        window.scrollTo({
          top: targetElement.offsetTop - 100, // Adjust this value as needed
          behavior: 'smooth',
        });
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-20 h-[calc(100vh-6rem)] w-64 p-4 bg-white dark:bg-gray-900"
    >
      <nav>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          CV Sections
        </h3>
        <ul className="space-y-4">
          {links.map((link, index) => (
            <li key={index}>
              {link.href.startsWith('/') ? (
                // For external routes, use the Link component
                <Link href={link.href} className="flex items-center gap-2 font-bold text-orange-500 dark:text-orange-400 hover:text-orange-700 dark:hover:text-amber-400 transition-colours" >
                    {link.icon}
                    <span>{link.label}</span>
                </Link>
              ) : (
                // For anchor links, use the custom click handler
                <a 
                  href={link.href} 
                  onClick={(e) => handleLinkClick(e, link.href)} 
                  className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {link.icon}
                  <span>{link.label}</span>
                </a>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </motion.div>
  );
};
