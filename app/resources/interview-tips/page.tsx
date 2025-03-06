'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Clock, 
  MessageSquare, 
  CheckCircle,
  CheckCheck
} from 'lucide-react';

export default function InterviewTipsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="px-4 py-24 text-center bg-gradient-to-r from-amber-400 to-orange-500"
      >
        <h1 className="text-4xl font-bold text-white mb-4">Apprenticeship Interview Tips</h1>
        <p className="text-xl text-white">"Preparation is the key to confidence and success"</p>
      </motion.section>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Introduction */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            Congratulations on securing an interview for an apprenticeship! This is a significant step toward launching your career. 
            Unlike traditional job interviews, apprenticeship interviews often focus on your potential, learning ability, and attitude 
            rather than extensive experience. This guide will help you prepare effectively and make a strong impression.
          </p>
        </motion.div>

        {/* Before the Interview Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex items-center mb-4">
            <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-full mr-4">
              <Clock className="h-6 w-6 text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Before the Interview</h2>
          </div>
          <div className="ml-16 text-gray-700 dark:text-gray-300 space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Research the Company</h3>
            <p>
              Thoroughly research the company offering the apprenticeship. Understand their:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Core business and services</li>
              <li>Company values and culture</li>
              <li>Recent news or developments</li>
              <li>Structure of their apprenticeship program</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6">Understand the Apprenticeship</h3>
            <p>
              Make sure you have a clear understanding of:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>The specific skills you'll be learning</li>
              <li>The qualification you'll receive</li>
              <li>The balance between work and study</li>
              <li>Career progression opportunities after completion</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6">Prepare Your Answers</h3>
            <p>
              Practice answers to common apprenticeship interview questions:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>"Why do you want this apprenticeship?"</li>
              <li>"Why did you choose this industry/field?"</li>
              <li>"What are your strengths and weaknesses?"</li>
              <li>"Tell us about a time you overcame a challenge"</li>
              <li>"How do you handle feedback and criticism?"</li>
              <li>"Where do you see yourself after completing this apprenticeship?"</li>
            </ul>
          </div>
        </motion.div>

        {/* During the Interview Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-12"
        >
          <div className="flex items-center mb-4">
            <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-full mr-4">
              <MessageSquare className="h-6 w-6 text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">During the Interview</h2>
          </div>
          <div className="ml-16 text-gray-700 dark:text-gray-300 space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">First Impressions Matter</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Dress professionally - business casual is usually appropriate</li>
              <li>Arrive 10-15 minutes early</li>
              <li>Bring copies of your CV, any certificates, and a notebook</li>
              <li>Turn off your phone completely</li>
              <li>Greet everyone with a smile and firm handshake</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6">Communication Tips</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Speak clearly and confidently</li>
              <li>Use the STAR method for behavioral questions (Situation, Task, Action, Result)</li>
              <li>Be honest about your experience level - remember, they're looking for potential</li>
              <li>Show enthusiasm for learning and development</li>
              <li>Maintain good eye contact</li>
              <li>Listen carefully to questions before answering</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6">Questions to Ask</h3>
            <p>
              Prepare thoughtful questions to ask at the end of the interview:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>"What does a typical day look like for an apprentice?"</li>
              <li>"How will my progress be measured?"</li>
              <li>"What support is available for apprentices?"</li>
              <li>"What have previous apprentices gone on to do in the company?"</li>
              <li>"What are the biggest challenges I might face in this role?"</li>
            </ul>
          </div>
        </motion.div>

        {/* After the Interview Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-12"
        >
          <div className="flex items-center mb-4">
            <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-full mr-4">
              <CheckCircle className="h-6 w-6 text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">After the Interview</h2>
          </div>
          <div className="ml-16 text-gray-700 dark:text-gray-300 space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Follow Up</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Send a thank-you email within 24 hours</li>
              <li>Briefly reiterate your interest in the position</li>
              <li>Reference something specific from the interview</li>
              <li>Keep it concise and professional</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6">Reflect on the Experience</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Note what went well and what you could improve</li>
              <li>Consider any feedback you received</li>
              <li>Use the experience to prepare for future interviews</li>
            </ul>
          </div>
        </motion.div>

        {/* Quick Tips Box */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg mb-12"
        >
          <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Quick Tips for Success</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <CheckCheck className="text-orange-500 flex-shrink-0" size={20} />
              <span className="text-gray-700 dark:text-gray-300">Be authentic - employers value honesty and genuine enthusiasm.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCheck className="text-orange-500 flex-shrink-0" size={20} />
              <span className="text-gray-700 dark:text-gray-300">Emphasize your willingness to learn and adapt.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCheck className="text-orange-500 flex-shrink-0" size={20} />
              <span className="text-gray-700 dark:text-gray-300">Highlight transferable skills from education, volunteering, or hobbies.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCheck className="text-orange-500 flex-shrink-0" size={20} />
              <span className="text-gray-700 dark:text-gray-300">Practice with a friend or family member before the actual interview.</span>
            </li>
          </ul>
        </motion.div>

        {/* Back to Resources Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
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
