'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Briefcase, GraduationCap, Trophy, Code, BookMarked, Bot, NotebookText, Files, FileQuestion } from 'lucide-react';
import Link from 'next/link'; // Import Link component from next/link

export const Sidebar = () => {

  const [activeSection, setActiveSection] = useState<string | null>(null);
  useEffect(() => {
    const sections = document.querySelectorAll('.section-container');
    //console.log('Sections found:', sections.length); // Debug: Check if sections are found
    const visibilityMap = new Map(); // Track visibility of each section

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          //console.log('Entry:', entry.target.id, entry.isIntersecting) // Debug: Log intersection events
          // Update the visibility ratio for the section
          visibilityMap.set(entry.target.id, entry.intersectionRatio);
        });

        // Find the section with the highest visibility ratio
        let mostVisibleSection = null;
        let highestRatio = 0;

        visibilityMap.forEach((ratio, id) => {
          if (ratio > highestRatio) {
            highestRatio = ratio;
            mostVisibleSection = id;
          }
        });

        // Update the active section
        if (mostVisibleSection) {
          setActiveSection(mostVisibleSection);
        }
      },
      {
        rootMargin: '-50px 0px -50px 0px', // Adjust this value as needed; higher = bigger boundary
        threshold: Array.from({ length: 100 }, (_, i) => i * 0.01), // Track visibility at 1% intervals
      }
    );

    sections.forEach((section) => {
      observer.observe(section);
    });

    return () => {
      sections.forEach((section) => {
        observer.unobserve(section);
      });
    };
  }, []);

  const links = [
    { icon: <FileQuestion />, label: 'Where to Start', href: '#why' },
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
                <Link href={link.href} className="flex items-center gap-2 font-bold text-orange-500 dark:text-orange-400 hover:text-orange-600 dark:hover:text-amber-400 transition-colours" >
                    {link.icon}
                    <span>{link.label}</span>
                </Link>
              ) : (
                // For anchor links, use the custom click handler
                <a 
                  href={link.href} 
                  onClick={(e) => handleLinkClick(e, link.href)} 
                  className={`flex items-center gap-2 ${
                    activeSection === link.href.substring(1) 
                      ? 'text-orange-600 dark:text-orange-400' 
                      : 'text-gray-700 dark:text-gray-300'
                  } hover:text-blue-700 dark:hover:text-blue-500 transition-colors`}
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
