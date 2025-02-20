'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Github, Linkedin, Mail, MapPin } from 'lucide-react';

const footerSections = [
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Our Team', href: '/team' },
      { label: 'Join Us', href: '/join' },
      { label: 'Contact', href: '/contact' }
    ]
  },
  {
    title: 'Resources',
    links: [
      { label: 'Apprenticeships', href: '/apprenticeships' },
      { label: 'Optimise CV', href: '/optimise-cv' },
      { label: 'Success Stories', href: '/success-stories' },
      { label: 'CV Guide', href: '/cv-guide' }
    ]
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookie-policy' },
      { label: 'Accessibility', href: '/accessibility' }
    ]
  }
];

const socialLinks = [
  { icon: Github, href: 'https://github.com/apprenticewatch', label: 'GitHub' },
  { icon: Linkedin, href: 'https://linkedin.com/company/apprenticewatch', label: 'LinkedIn' }
];

const contactInfo = [
  { icon: Mail, info: 'contact@apprenticewatch.com' },
  { icon: MapPin, info: 'London, United Kingdom' }
];

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-16">
          <div className="lg:col-span-1 flex flex-col items-center lg:items-start text-center lg:text-left">
            <Link href="/" className="inline-block mb-6">
              <span className="text-3xl font-extrabold">
                <span className="text-white">APPRENTICE</span>
                <span className="text-orange-500">WATCH</span>
              </span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-sm">
              Revolutionising apprenticeship discovery and career development across the UK.
            </p>
            <div className="space-y-3">
              {contactInfo.map(({ icon: Icon, info }) => (
                <div key={info} className="flex items-center justify-center lg:justify-start text-gray-400">
                  <Icon className="w-5 h-5 mr-3 text-orange-500" />
                  <span>{info}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {footerSections.map((section) => (
              <div key={section.title} className="text-center sm:text-left">
                <h3 className="text-lg font-semibold mb-4 text-white">
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-gray-400 hover:text-orange-500 transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex space-x-6">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-orange-500 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={label}
                >
                  <Icon className="w-6 h-6" />
                </motion.a>
              ))}
            </div>

            <div className="text-center text-gray-400 text-sm">
              <p>© {currentYear} ApprenticeWatch. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};