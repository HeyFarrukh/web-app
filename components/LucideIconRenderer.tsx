'use client';

import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import * as Icons from 'lucide-react';

export function LucideIconRenderer() {
  useEffect(() => {
    // Find all elements with the lucide-icon class
    const iconElements = document.querySelectorAll('.lucide-icon');
    
    // Store references to roots for cleanup
    const roots: Array<ReturnType<typeof createRoot>> = [];
    
    // Helper function to convert kebab-case to PascalCase
    const kebabToPascalCase = (str: string): string => {
      return str
        .split('-')
        .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join('');
    };
    
    // For each icon element, render the appropriate Lucide icon
    iconElements.forEach((element) => {
      // Get the icon name from the class (e.g., lucide-check -> check)
      const iconClass = Array.from(element.classList)
        .find(className => className.startsWith('lucide-') && className !== 'lucide-icon');
      
      if (iconClass) {
        const iconKebabName = iconClass.replace('lucide-', '');
        const iconPascalName = kebabToPascalCase(iconKebabName);
        const IconComponent = (Icons as any)[iconPascalName];
        
        if (IconComponent) {
          // Clear the original element's content
          element.innerHTML = '';
          
          // Create a container for the icon
          const iconContainer = document.createElement('div');
          element.appendChild(iconContainer);
          
          // Use inline styles to match the parent text
          const computedStyle = window.getComputedStyle(element);
          const color = computedStyle.color;
          const fontSize = computedStyle.fontSize;
          
          // Create a React root
          const root = createRoot(iconContainer);
          roots.push(root);
          
          // Render the icon
          root.render(
            <IconComponent 
              size={parseInt(fontSize)} 
              color={color}
              style={{ 
                display: 'inline-block',
                verticalAlign: 'middle',
                marginBottom: '0.125em' // Slight adjustment to align with text
              }}
            />
          );
        } else {
          console.warn(`Icon not found: ${iconPascalName}`);
        }
      }
    });
    
    // Cleanup function
    return () => {
      roots.forEach(root => {
        root.unmount();
      });
    };
  }, []);
  
  // This component doesn't render anything itself
  return null;
}