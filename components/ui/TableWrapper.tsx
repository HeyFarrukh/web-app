"use client";

import React, { useEffect, useRef } from 'react';

/**
 * TableWrapper component enhances markdown tables with responsive design
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
      wrapper.style.marginBottom = '1.5rem';
      wrapper.style.marginTop = '1.5rem';
      wrapper.style.borderRadius = '0.5rem';
      wrapper.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
      
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
            header.style.padding = '0.75rem 1rem';
            header.style.fontWeight = '600';
          }
        });
        
        // Style table cells
        const cells = table.querySelectorAll('td');
        cells.forEach((cell) => {
          if (cell instanceof HTMLElement) {
            cell.style.padding = '0.75rem 1rem';
            cell.style.verticalAlign = 'top';
            
            // If cell contains only an icon, center it
            if (cell.querySelector('.icon, .lucide-icon') && 
                cell.textContent?.trim().length === 0) {
              cell.style.textAlign = 'center';
            }
          }
        });
        
        // Add zebra striping for better readability
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach((row, index) => {
          if (row instanceof HTMLElement && index % 2 === 1) {
            row.style.backgroundColor = 'rgba(0, 0, 0, 0.02)';
          }
        });
      }
    });
  }, []);

  return <div ref={wrapperRef} className="table-wrapper-component" />;
};

export default TableWrapper;
