'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin, Twitter, Mail } from 'lucide-react';

interface TeamMember {
  name: string;
  role: string;
  image: string;
  description: string;
  type: 'founder' | 'senior-lead' | 'ambassador';
  links: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
  contact?: {
    email?: string;
  };
}

const teamMembers: TeamMember[] = [
  {
    name: "Farrukh Ahmad",
    role: "Founder",
    type: "founder",
    image: "/media/farrukh-av.png",
    description: "I got tired of the endless search for apprenticeships—scattered websites, outdated listings, and zero clarity. So I built ApprenticeWatch with an incredible team that shares the same vision. Our goal? To make finding opportunities simple and stress-free. If something’s broken, you fix it—and that’s exactly what we’re doing. This isn’t just another platform; it’s a game-changer for anyone serious about kickstarting their career.",
    links: {
      github: "https://github.com/HeyFarrukh?utm_source=apprentice-watch",
      linkedin: "https://www.linkedin.com/in/farrukh-ahmad-9547b1260?utm_source=apprentice-watch",
    },
    contact: {
      email: "farrukh@apprenticewatch.com"
    }
  },
  {
    name: "Jamal Mitchell",
    role: "Co-Founder",
    type: "founder",
    image: "/media/jamal-av.png",
    description: "As friends with similar career goals, I often shared my frustration that many attempts to inform and empower aspiring apprentices were lacking. So, when Farrukh came to me with his vision, I saw an opportunity for change. I'm focused on expanding the platform's presence and ensuring that every young professional has access to the opportunities they need to succeed—because no one should miss out due to a lack of visibility. ",
    links: {
      github: "https://github.com",
      linkedin: "https://www.linkedin.com/in/jamal-mitchell-a7729428b?utm_source=apprentice-watch",
    },
    contact: {
      email: "jamal@apprenticewatch.com"
    }
  },
  {
    name: "Humza",
    role: "Chief Technical Officer",
    type: "senior-lead",
    image: "/media/humza-av.png",
    description: "As a friend of both founders, I really connected with their vision and saw firsthand how challenging the apprenticeship application process can be. I joined the team because I genuinely believe in what they're building, and I wanted to use my experience in development and operations to help turn that vision into reality.",
    links: {
      github: "https://github.com/hhussain04",
      linkedin: "https://www.linkedin.com/in/humzahussain04/",
    },
    contact: {
      email: "humza@apprenticewatch.com"
    }
  },
];

const FounderCard: React.FC<{ member: TeamMember }> = ({ member }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -5 }}
    className="relative group"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-orange-600/10 rounded-2xl transform -rotate-1 group-hover:rotate-0 transition-transform duration-300" />
    <div className="absolute inset-0 bg-gradient-to-l from-orange-500/10 to-orange-600/10 rounded-2xl transform rotate-1 group-hover:rotate-0 transition-transform duration-300" />
    
    <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl group-hover:shadow-2xl transition-all duration-300">
      <div className="flex flex-col items-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full animate-spin-slow opacity-75 blur-sm" />
          <div className="relative w-32 h-32 rounded-full overflow-hidden ring-4 ring-white dark:ring-gray-800">
            <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap shadow-lg">
            {member.role}
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          {member.name}
        </h2>
        
        {member.contact?.email && (
          <a 
            href={`mailto:${member.contact.email}`}
            className="text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-500 font-medium mb-4 transition-colors"
          >
            {member.contact.email}
          </a>
        )}
        
        <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
          {member.description}
        </p>
        <div className="flex items-center space-x-4">
          {member.links.github && (
            <motion.a
              href={member.links.github}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className="text-gray-600 hover:text-orange-500 dark:text-gray-400 dark:hover:text-orange-400 transition-colors"
            >
              <Github className="w-5 h-5" />
            </motion.a>
          )}
          {member.links.linkedin && (
            <motion.a
              href={member.links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className="text-gray-600 hover:text-orange-500 dark:text-gray-400 dark:hover:text-orange-400 transition-colors"
            >
              <Linkedin className="w-5 h-5" />
            </motion.a>
          )}
        </div>
      </div>
    </div>
  </motion.div>
);

const SeniorLeadCard: React.FC<{ member: TeamMember }> = ({ member }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -5 }}
    className="relative group max-w-3xl mx-auto"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-orange-600/5 rounded-xl transform -rotate-1 group-hover:rotate-0 transition-transform duration-300" />

    <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-8 shadow-lg group-hover:shadow-xl transition-all duration-300">
      <div className="flex flex-col md:flex-row md:items-start gap-8">
        <div className="relative flex-shrink-0 mx-auto md:mx-0">
          <div className="w-28 h-28 rounded-full overflow-hidden ring-2 ring-orange-500">
            <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-1 rounded-full text-xs font-medium whitespace-nowrap shadow-md">
            {member.role}
          </div>
        </div>

        <div className="flex-1 text-center md:text-left">
          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white overflow-hidden text-ellipsis">
              {member.name}
            </h3>

            {member.contact?.email && (
              <a
                href={`mailto:${member.contact.email}`}
                className="text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-500 font-medium block transition-colors overflow-hidden text-ellipsis"
              >
                {member.contact.email}
              </a>
            )}

            <p className="text-gray-600 dark:text-gray-300 text-sm">{member.description}</p>

            <div className="flex justify-center md:justify-start space-x-3 pt-2">
              {member.links.github && (
                <motion.a
                  href={member.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-gray-600 hover:text-orange-500 dark:text-gray-400 dark:hover:text-orange-400 transition-colors"
                >
                  <Github className="w-4 h-4" />
                </motion.a>
              )}
              {member.links.linkedin && (
                <motion.a
                  href={member.links.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-gray-600 hover:text-orange-500 dark:text-gray-400 dark:hover:text-orange-400 transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                </motion.a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

export default function Team() {
  const founders = teamMembers.filter(member => member.type === 'founder');
  const seniorLeads = teamMembers.filter(member => member.type === 'senior-lead');

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Meet the <span className="text-orange-500">Team</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            The minds behind ApprenticeWatch, working to revolutionise how apprenticeships are discovered and accessed.
          </p>
        </motion.div>

        {/* Founders Section */}
        <div className="relative mb-24">
          <div className="grid md:grid-cols-2 gap-12">
            {founders.map((member, index) => (
              <FounderCard key={`${member.name}-${index}`} member={member} />
            ))}
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-32 hidden md:block overflow-hidden">
            <div className="w-full h-full bg-gradient-to-b from-transparent via-orange-500 to-transparent animate-pulse" />
          </div>
        </div>

        {/* Senior Lead Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-24"
        >
          {seniorLeads.map((member, index) => (
            <SeniorLeadCard key={`${member.name}-${index}`} member={member} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}