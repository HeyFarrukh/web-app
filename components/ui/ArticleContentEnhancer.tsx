"use client";

import React, { useEffect, useRef } from 'react';

/**
 * ArticleContentEnhancer component improves the formatting and alignment of article content
 * This component enhances readability and visual appeal of article elements
 */
export const ArticleContentEnhancer: React.FC = () => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;

    // Find the article content wrapper
    const articleWrapper = document.querySelector('.article-content-wrapper');
    if (!articleWrapper) return;

    // Apply alignment classes to specific elements
    const applyAlignmentClasses = () => {
      // Center align all images that aren't inside a specific container
      const images = articleWrapper.querySelectorAll('img:not(a img):not(.icon img):not(.lucide-icon img)');
      images.forEach(img => {
        if (img.parentElement) {
          if (img.parentElement.tagName !== 'A' && !img.parentElement.classList.contains('no-center')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'text-center my-8';
            img.parentElement.insertBefore(wrapper, img);
            wrapper.appendChild(img);
            
            // Add caption if alt text exists
            if (img instanceof HTMLImageElement && img.alt && !img.alt.startsWith('_')) {
              const caption = document.createElement('figcaption');
              caption.className = 'text-sm text-gray-500 mt-2 italic';
              caption.textContent = img.alt;
              wrapper.appendChild(caption);
            }
          }
        }
      });

      // Improve blockquote formatting
      const blockquotes = articleWrapper.querySelectorAll('blockquote');
      blockquotes.forEach(blockquote => {
        blockquote.classList.add('my-8', 'italic');
        
        // Style nested paragraphs
        const paragraphs = blockquote.querySelectorAll('p');
        paragraphs.forEach(p => {
          p.classList.add('mb-2');
          // If it's the last paragraph, remove bottom margin
          if (p === paragraphs[paragraphs.length - 1]) {
            p.classList.remove('mb-2');
            p.classList.add('mb-0');
          }
        });
      });

      // Improve heading spacing and alignment
      const headings = articleWrapper.querySelectorAll('h1, h2, h3, h4, h5, h6');
      headings.forEach(heading => {
        heading.classList.add('mt-10', 'mb-4', 'font-bold');
        
        // Add special styling to main headings
        if (heading.tagName === 'H1') {
          heading.classList.add('text-center', 'pb-2', 'border-b', 'border-gray-200', 'dark:border-gray-700');
        }
        
        // Add icon spacing if heading contains icons
        if (heading.querySelector('.icon, .lucide-icon')) {
          heading.classList.add('flex', 'items-center', 'gap-2');
        }
      });

      // Improve list spacing
      const lists = articleWrapper.querySelectorAll('ul, ol');
      lists.forEach(list => {
        list.classList.add('my-4', 'space-y-2');
        
        // Add spacing to list items
        const items = list.querySelectorAll('li');
        items.forEach(item => {
          item.classList.add('pl-1');
        });
      });

      // Improve horizontal rule styling
      const hrs = articleWrapper.querySelectorAll('hr');
      hrs.forEach(hr => {
        hr.classList.add('my-10', 'border-t', 'border-gray-200', 'dark:border-gray-700');
      });
    };

    // Apply alignment enhancements
    applyAlignmentClasses();

    // Add support for text alignment classes in markdown
    const processTextAlignmentClasses = () => {
      // Process elements with .text-center, .text-left, .text-right classes
      ['text-center', 'text-left', 'text-right'].forEach(alignClass => {
        const elements = articleWrapper.querySelectorAll(`.${alignClass}`);
        elements.forEach(element => {
          if (element instanceof HTMLElement) {
            element.style.textAlign = alignClass.replace('text-', '');
          }
        });
      });
    };

    // Apply text alignment processing
    processTextAlignmentClasses();

  }, []);

  return <div ref={contentRef} className="article-content-enhancer" />;
};

export default ArticleContentEnhancer;
