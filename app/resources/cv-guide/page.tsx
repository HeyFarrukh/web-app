'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  FileQuestion, 
  FileText, 
  Building2, 
  ClipboardCheck 
} from 'lucide-react';

export default function CVGuidePage() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="px-4 py-24 text-center bg-gradient-to-r from-amber-400 to-orange-500"
      >
        <h1 className="text-4xl font-bold text-white mb-4">CV Writing Guide</h1>
        <p className="text-xl text-white">"The most important thing about a CV is making a strong first impression"</p>
      </motion.section>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Table of Contents */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg"
        >
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Contents</h2>
          <ul className="space-y-2">
            <li>
              <a href="#why" className="text-orange-500 hover:text-orange-600 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
                Why Your CV Matters
              </a>
            </li>
            <li>
              <a href="#master-cv" className="text-orange-500 hover:text-orange-600 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
                Master CV Concept
              </a>
            </li>
            <li>
              <a href="#professional" className="text-orange-500 hover:text-orange-600 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
                Work Experience/Professional
              </a>
            </li>
          </ul>
        </motion.div>

        {/* Personal Information Example */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow"
        >
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">First Last</h2>
            </div>
            <div className="text-right text-gray-700 dark:text-gray-300">
              <p><a href="https://www.linkedin.com/company/apprenticewatch" className="text-blue-600 hover:text-blue-800 underline">LinkedIn</a> | <a href="https://github.com/apprenticewatch" className="text-blue-600 hover:text-blue-800 underline">Github</a> (if applicable)</p>
              <p>+44 1234567890 | <a href="mailto:jamal@apprenticewatch.com" className="text-blue-600 hover:text-blue-800 underline">Email</a></p>
            </div>
          </div>
          <div>
            <p className="italic text-gray-700 dark:text-gray-300"><br />Reviewed by apprentices and hiring managers at Accenture, HSBC, and Digital Catapult.</p>
          </div>
        </motion.div>

        {/* Why Your CV Matters Section */}
        <Section 
          id="why"
          icon={<FileQuestion />}
          title="Why Your CV Matters"
          content={
            <div className="text-gray-700 dark:text-gray-300 space-y-4">
              <p>In the world of apprenticeship applications, first impressions are everything. Your Curriculum Vitae (CV) is your first opportunity, your first chance to leave an imprint of yourself, and traverse through the application process. A well-crafted CV is not just a list of your experiences—it's a powerful story of who you are, what you've achieved, and where you're going.</p>
              <p>Your CV is more than just a document; it's your personal brand, and in the competitive world of job hunting, it's the first thing potential employers will see. So, how do you make yours stand out in a sea of applicants?</p>
              <p>Think of it as the chance to strategically <a href="https://online.hbs.edu/blog/post/personal-branding-at-work" className="text-orange-500 hover:text-orange-600 underline">brand</a> yourself: Highlight the skills, experiences, and achievements that speak directly to the role and its requirements. Whether it's adjusting the emphasis on your education or tweaking the wording in your personal statement, building and customising a quality CV shows recruiters that you've put in the effort to align your experience with their needs.</p>
              <p>Here's a template from an award-winning recruitment agency, from which many template examples throughout this guide are sourced from: <a href="/cv-guide-resources/dartmouth.pdf" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:text-orange-600 underline">Dartmouth CV</a></p>
            </div>
          }
          delay={0.3}
        />

        {/* Master CV Concept Section */}
        <Section 
          id="master-cv"
          icon={<FileText />}
          title="Master CV Concept"
          content={
            <div className="text-gray-700 dark:text-gray-300 space-y-4">
              <p>If anything, your details are the one part of your CV that should stay the same, regardless of the company you're applying to. In other words, it should go unchanged from the <a href="https://www.jobteaser.com/en/advices/153-why-you-should-always-keep-a-master-cv" className="text-orange-500 hover:text-orange-600 underline">Master CV</a> - a resume that has absolutely everything that you would ever want to include in an application. To simplify things, your master CV should emphasise your strongest skills, and be centered around your ideal company.</p>
              <p>However, each CV should be tailored to the job description and culture of the company in order to emphasise your points, and showcase why you could be a perfect fit for the vacancy. This includes everything from the subjects highlighted in education, down to the headlined skills & achievements, and the personal statement.</p>
              <p>A personal statement is not a must-have for a CV, especially when you have many experiences to draw from. Nonetheless, a personal statement or career objective could be expected by recruiters, or useful when differentiating from other applicants. In certain industries, such as hospitality, a personal statement can act as a prerequisite to an interview, giving insight to your character and goals. If anything, use it to showcase your motivation behind working "here" rather than anywhere else. Research!</p>
            </div>
          }
          delay={0.4}
        />

        {/* Work Experience/Professional Section */}
        <Section 
          id="professional"
          icon={<Building2 />}
          title="Work Experience/Professional"
          content={
            <div>
              <div className="flex flex-col mb-4">
                <div className="flex justify-between py-0">
                  <div className="py-0 font-semibold text-sm">
                    <p className="m-0 leading-tight">
                      <span className="text-gray-800 dark:text-gray-200">Most Recent Relevant Work Experience Firm</span>
                    </p>
                  </div>
                  <div className="py-0 text-right text-sm">
                    <p className="m-0 leading-tight">
                      <span className="text-gray-700 dark:text-gray-300">Location, Country</span>
                    </p>
                  </div>
                </div>
                <div className="flex justify-between py-0">
                  <div className="py-0 text-sm">
                    <p className="m-0 leading-tight">
                      <span className="text-gray-700 italic dark:text-gray-300 italic">Role/Event</span>
                    </p>
                  </div>
                  <div className="py-0 text-right text-sm">
                    <p className="m-0 leading-tight">
                      <span className="text-gray-700 italic dark:text-gray-300 italic">Start (Month, Year) - End/"Present"</span>
                    </p>
                  </div>
                </div>
              </div>
              <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                <li>Talk about the impact of your work with measurable impacts if possible. If it was a workshop or other type of professional event, display the attributes, professional behaviours, and skills you learnt or refined.</li>
                <li>Second piece of information perhaps detailing a project that you helped with – or another relevant achievement.</li>
                <li>Final highlight – don't waffle- you can go into extra detail once you're in the interview.</li>
              </ul>
            </div>
          }
          delay={0.5}
        />

        {/* Quick Tips Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-8 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg mb-12"
        >
          <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Quick Tips for Your CV</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <ClipboardCheck className="text-orange-500 flex-shrink-0" size={20} />
              <span className="text-gray-700 dark:text-gray-300">Try to keep each point between 1 and 2 lines.</span>
            </li>
            <li className="flex items-start gap-2">
              <ClipboardCheck className="text-orange-500 flex-shrink-0" size={20} />
              <span className="text-purple-700 dark:text-purple-400">What you did & how (skills/job description) → Measurable impact (quantified).</span>
            </li>
            <li className="flex items-start gap-2">
              <ClipboardCheck className="text-orange-500 flex-shrink-0" size={20} />
              <span className="text-gray-700 dark:text-gray-300">Use keywords which emphasise the soft skills essential for the role, e.g. "Co-ordinated the team...", "Analysed survey responses to identify trends…".</span>
            </li>
          </ul>
        </motion.div>

        {/* Back to Resources Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="text-center mt-12"
        >
          <Link href="/resources" className="inline-flex items-center px-6 py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Resources
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

interface SectionProps {
  id: string;
  icon: React.ReactNode;
  title: string;
  content: React.ReactNode;
  delay?: number;
}

function Section({ id, icon, title, content, delay = 0 }: SectionProps) {
  return (
    <motion.div 
      id={id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="mb-12"
    >
      <div className="flex items-center mb-4">
        <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-full mr-4">
          {icon}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
      </div>
      <div className="ml-16">
        {content}
      </div>
    </motion.div>
  );
}
