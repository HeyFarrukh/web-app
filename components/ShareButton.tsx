'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Clipboard, Linkedin } from 'lucide-react';
import { SiWhatsapp as WhatsApp } from 'react-icons/si';

interface ShareButtonProps {
  title?: string;
}

export const ShareButton: React.FC<ShareButtonProps> = ({ title }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setShowDropdown(false);
  };

  const shareText = title 
    ? `Check out this article: ${title}`
    : 'Check out this page';

  return (
    <div className="relative">
      <button
        className="p-2 text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center"
        onClick={() => setShowDropdown(!showDropdown)}
        aria-label="Share"
      >
        <Share2 className="w-5 h-5" />
      </button>
      
      {showDropdown && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 space-y-2 w-48 max-w-full z-50"
          style={{ maxWidth: 'calc(100vw - 2rem)' }}
        >
          <button
            className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:text-orange-500 dark:hover:text-orange-400 w-full"
            onClick={handleCopyLink}
            aria-label="Copy Link"
          >
            <Clipboard className="w-5 h-5" aria-hidden="true" />
            <span>{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>
          
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${window.location.href}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:text-orange-500 dark:hover:text-orange-400 w-full"
            aria-label="Share on WhatsApp"
            onClick={() => setShowDropdown(false)}
          >
            <WhatsApp className="w-5 h-5" aria-hidden="true" />
            <span>WhatsApp</span>
          </a>
          
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:text-orange-500 dark:hover:text-orange-400 w-full"
            aria-label="Share on LinkedIn"
            onClick={() => setShowDropdown(false)}
          >
            <Linkedin className="w-5 h-5" aria-hidden="true" />
            <span>LinkedIn</span>
          </a>
        </motion.div>
      )}
    </div>
  );
};
