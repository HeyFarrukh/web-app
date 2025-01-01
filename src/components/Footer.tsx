import React from 'react';
import { Link } from 'react-router-dom';

const footerLinks = [
  { title: 'About Us', href: '/about' },
  { title: 'Join Us', href: '/join' },
  { title: 'Contact', href: '/contact' },
  { title: 'Privacy Policy', href: '/privacy' },
  { title: 'Terms of Service', href: '/terms' },
];

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-extrabold">
            <span className="text-white dark:text-white">APPRENTICE</span>
            <span className="text-orange-500">WATCH</span>
          </Link>
        </div>
        
        <div className="flex justify-center space-x-8 mb-8">
          {footerLinks.map(link => (
            <Link
              key={link.title}
              to={link.href}
              className="text-gray-300 hover:text-white transition-colors"
            >
              {link.title}
            </Link>
          ))}
        </div>
        
        <div className="text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} ApprenticeWatch. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};