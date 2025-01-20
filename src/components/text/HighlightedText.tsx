import React from 'react';

interface HighlightedTextProps {
  children: React.ReactNode;
}

export const HighlightedText: React.FC<HighlightedTextProps> = ({ children }) => (
  <span className="text-orange-500 dark:text-orange-400 font-medium">
    {children}
  </span>
);