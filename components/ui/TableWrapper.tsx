"use client";

import React, { useEffect, useRef } from 'react';

/**
 * TableWrapper component enhances markdown tables with premium glassmorphism design
 * and proper styling for better readability and appearance
 */
export const TableWrapper: React.FC = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wrapperRef.current) return;

    // Find all tables within the article content
    const tables = wrapperRef.current.querySelectorAll('.article-content table');

    tables.forEach((table) => {
      // Create a wrapper div for the table
      const wrapper = document.createElement('div');
      wrapper.className = 'table-responsive';
      wrapper.style.overflowX = 'auto';
      wrapper.style.marginBottom = '2rem';
      wrapper.style.marginTop = '2rem';
      wrapper.style.borderRadius = '0.75rem';
      
      // Replace the table with the wrapper containing the table
      const parent = table.parentNode;
      if (parent) {
        parent.insertBefore(wrapper, table);
        wrapper.appendChild(table);
        
        // Add classes to the table for better styling
        table.classList.add('w-full', 'border-collapse');
        
        // Style table headers
        const headers = table.querySelectorAll('th');
        headers.forEach((header) => {
          if (header instanceof HTMLElement) {
            header.style.textAlign = 'left';
            header.style.padding = '1.25rem 1.5rem';
            header.style.fontWeight = '600';
            header.style.letterSpacing = '0.025em';
          }
        });
        
        // Style table cells
        const cells = table.querySelectorAll('td');
        cells.forEach((cell) => {
          if (cell instanceof HTMLElement) {
            cell.style.padding = '1.25rem 1.5rem';
            cell.style.verticalAlign = 'top';
            
            // If cell contains an icon, center it
            if (cell.querySelector('.icon, .lucide-icon')) {
              cell.style.textAlign = 'center';
              
              // Add premium styling to icon cells
              const iconElement = cell.querySelector('.icon, .lucide-icon');
              if (iconElement instanceof HTMLElement) {
                iconElement.style.color = '#f97316';
              }
            }
          }
        });
      }
    });
  }, []);

  return <div ref={wrapperRef} className="table-wrapper-component" />;
};

export default TableWrapper;
