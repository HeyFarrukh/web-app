"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Github, Linkedin, Twitter, Mail } from "lucide-react";
import { Analytics } from "@/services/analytics/analytics";

interface TeamMember {
  name: string;
  role: string;
  image: string;
  description: string;
  type: "founder" | "senior-lead" | "ambassador";
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
    role: "Founder & CEO",
    type: "founder",
    image: "/media/farrukh-av.png",
    description:
      "I got tired of the endless search for apprenticeships — scattered websites, outdated listings, and zero clarity. So I built ApprenticeWatch with an incredible team that shares the same vision. Our goal? To make finding opportunities simple and stress-free. If something’s broken, you fix it — and that’s exactly what we’re doing. This isn’t just another platform; it’s a game-changer for anyone serious about kickstarting their career.",
    links: {
      github: "https://github.com/HeyFarrukh?utm_source=apprentice-watch",
      linkedin:
        "https://www.linkedin.com/in/farrukh-ahmad-9547b1260?utm_source=apprentice-watch",
    },
    contact: {
      email: "farrukh@apprenticewatch.com",
    },
  },
  {
    name: "Jamal Mitchell",
    role: "Co-Founder",
    type: "founder",
    image: "/media/jamal-av.png",
    description:
      "As friends with similar career goals, I often shared my frustration that many attempts to inform and empower aspiring apprentices were lacking. So, when Farrukh came to me with his vision, I saw an opportunity for change. I'm focused on expanding the platform's presence and ensuring that every young professional has access to the opportunities they need to succeed — because no one should miss out due to a lack of visibility. ",    
      links: {
      github: "https://github.com",
      linkedin:
        "https://www.linkedin.com/in/jamal-mitchell-a7729428b?utm_source=apprentice-watch",
    },
    contact: {
      email: "jamal@apprenticewatch.com",
    },
  },
  {
    name: "Humza",
    role: "Chief Technical Officer",
    type: "senior-lead",
    image: "/media/humza-av.png",
    description:
      "As a friend of both founders, I really connected with their vision and saw firsthand how challenging the apprenticeship application process can be. I joined the team because I genuinely believe in what they're building, and I wanted to use my experience in development and operations to help turn that vision into reality.",
    links: {
      github: "https://github.com/hhussain04",
      linkedin: "https://www.linkedin.com/in/humzahussain04/",
    },
    contact: {
      email: "humza@apprenticewatch.com",
    },
  },
  {
    name: "Ezra Baldwin",
    role: "Security Architect",
    type: "senior-lead",
    image: "/media/ezra-av.png",
    description:
      "Having been through the apprenticeship application process, I know how frustrating and unclear it can be. I joined ApprenticeWatch to help fix that. I’ve secured degree apprenticeships with Siemens, Airbus and HSBC, so I understand what applicants are up against. I’m glad to help build something that supports students at every step.",
    links: {
      github: "https://github.com/STENTORS?utm_source=apprentice-watch",
      linkedin:
        "https://www.linkedin.com/in/ezra-baldwin-stentors?utm_source=apprentice-watch",
    },
    contact: {
      email: "ezra@apprenticewatch.com",
    },
  },
  {
    name: "Onur Arslan",
    role: "Ambassador Lead",
    type: "senior-lead",
    image: "/media/onur-av.png",
    description:
      "Having been through ambassador programmes that felt more like box-ticking exercises than real opportunities, I’ve seen where things often go wrong — poor communication, limited support, and a lack of real purpose. I joined ApprenticeWatch because I know what needs to change, and I’m passionate about building a programme that genuinely empowers students and delivers real value at every step.",
    links: {
      linkedin:
        "https://www.linkedin.com/in/onurearslan?utm_source=apprentice-watch",
    },
    contact: {
      email: "onur@apprenticewatch.com",
    },
  },

  // AMBASSADORS SECTION

  {
    name: "Poppy Element",
    role: "Ambassador",
    type: "ambassador",
    image: "https://cdn.apprenticewatch.com/AW-Ambassador-LinkedIn-Photos/poppy-av.jpg",
    description:
      "Becoming an ambassador for ApprenticeWatch has given me the opportunity to broaden my network and provide guidance and support to individuals pursuing apprenticeships for career success.",
    links: {
      linkedin: "https://www.linkedin.com/in/poppy-element-0b68b4331?utm_source=apprentice-watch",
    },
  },
  {
    name: "Malachi Boateng",
    role: "Ambassador",
    type: "ambassador",
    image: "https://cdn.apprenticewatch.com/AW-Ambassador-LinkedIn-Photos/malachi-av.jpg",
    description:
      "I became an Ambassador for ApprenticeWatch as I believed everyone should be able to have access to an apprenticeship as it is hard to find one. Also because I really believe this has the potential to help people like me get access to missed opportunities",
    links: {
      linkedin: "https://www.linkedin.com/in/malachi-boateng?utm_source=apprentice-watch",
    },
  },
  // {
  //   name: "Leo Bytyci",
  //   role: "Ambassador",
  //   type: "ambassador",
  //   image: "https://cdn.apprenticewatch.com/AW-Ambassador-LinkedIn-Photos/leo-av.jpg",
  //   description:
  //     "As a sixth form student interested in engineering, I want to help my classmates discover alternatives to traditional university paths. ApprenticeWatch has been a game-changer for me and my peers.",
  //   links: {
  //     linkedin: "https://www.linkedin.com/in/leo-bytyci-97a30132b?utm_source=apprentice-watch",
  //   },
  // },
  {
    name: "Resul Tota",
    role: "Ambassador",
    type: "ambassador",
    image: "https://cdn.apprenticewatch.com/AW-Ambassador-LinkedIn-Photos/resul-av.jpg",
    description:
      "I deeply support ApprenticeWatch’s mission to simplify and improve access to apprenticeship opportunities, as I believe that making these programs more accessible can greatly empower individuals in their career paths. This is why I’m proud to serve as an ambassador for ApprenticeWatch.",
    links: {
      linkedin: "https://www.linkedin.com/in/resul-tota-aa1a1b329?utm_source=apprentice-watch",
    },
  },
  {
    name: "Adam Gomes",
    role: "Ambassador",
    type: "ambassador",
    image: "https://cdn.apprenticewatch.com/AW-Ambassador-LinkedIn-Photos/adam-av.jpg",
    description:
      "I became an ambassador because ApprenticeWatch is something that will most definitely transform the lives of many future apprentices out there, and I want to be there to help build ApprenticeWatch.",
    links: {
      linkedin: "https://www.linkedin.com/in/resul-tota-aa1a1b329?utm_source=apprentice-watch",
    },
  },
  {
    name: "Zoraez Imran",
    role: "Ambassador",
    type: "ambassador",
    image: "https://cdn.apprenticewatch.com/AW-Ambassador-LinkedIn-Photos/zoraez-av.jpg",
    description:
      "One of my passions is about helping students and young professionals navigate their career journeys. I believe in, and see great potential in, ApprenticeWatch's mission and products. Providing the right guidance, support, and resources in one well-structured platform for those exploring alternative career routes is crucial, and ApprenticeWatch is already excelling at this unlike most. With my extensive background and being a student myself, I’ve seen how beneficial and impactful these types of initiatives can be. I am excited to be part of a company that empowers students like me and makes a massive difference in their professional development journey.",
    links: {
      linkedin: "https://www.linkedin.com/in/resul-tota-aa1a1b329?utm_source=apprentice-watch",
    },
  },
  {
    name: "Mihai lulian",
    role: "Ambassador",
    type: "ambassador",
    image: "https://cdn.apprenticewatch.com/AW-Ambassador-LinkedIn-Photos/lulian-av.jpg",
    description:
      "ApprenticeWatch stands out from other similar websites by actively engaging with users for feedback and also have a map-view feature to see all apprenticeships across UK in a different format. That's why I decided to become an Ambassador. They're unique and simply better.",
    links: {
      linkedin: "https://www.linkedin.com/in/resul-tota-aa1a1b329?utm_source=apprentice-watch",
    },
  },
  {
    name: "Georgi Georgiev",
    role: "Ambassador",
    type: "ambassador",
    image: "https://cdn.apprenticewatch.com/AW-Ambassador-LinkedIn-Photos/georgi-av.jpg",
    description:
      "As someone interested in tech and personal development, I joined ApprenticeWatch to support others in finding the right opportunities - and to keep growing my own skills through real impact and collaboration.",
    links: {
      linkedin: "https://www.linkedin.com/in/resul-tota-aa1a1b329?utm_source=apprentice-watch",
    },
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
            <img
              src={member.image}
              alt={member.name}
              className="w-full h-full object-cover"
            />
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
            <img
              src={member.image}
              alt={member.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-1 rounded-full text-xs font-medium whitespace-normal text-center min-w-max max-w-[200px] shadow-md">
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

            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {member.description}
            </p>

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

const AmbassadorCard: React.FC<{ member: TeamMember }> = ({ member }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -5 }}
    className="relative group flex-shrink-0 w-64 mx-2"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-orange-600/5 rounded-xl transform -rotate-1 group-hover:rotate-0 transition-transform duration-300" />

    <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-5 shadow-lg group-hover:shadow-xl transition-all duration-300 h-full flex flex-col">
      <div className="flex flex-col items-center">
        <div className="relative mb-4">
          <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-orange-500">
            <img
              src={member.image}
              alt={member.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 text-center">
          {member.name}
        </h3>

        <p className="text-gray-600 dark:text-gray-300 text-sm text-center mb-4 line-clamp-3">
          {member.description}
        </p>

        <div className="flex justify-center space-x-3 mt-auto">
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
  </motion.div>
);

export default function Team() {
  const founders = teamMembers.filter((member) => member.type === "founder");
  const seniorLeads = teamMembers.filter(
    (member) => member.type === "senior-lead"
  );
  const ambassadors = teamMembers.filter(
    (member) => member.type === "ambassador"
  );
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    Analytics.pageView("/team");
    Analytics.event("page_interaction", "view_team_page");
  }, []);

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
            The minds behind ApprenticeWatch, working to revolutionise how
            apprenticeships are discovered and accessed.
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
          <div className="flex flex-col md:flex-row flex-wrap justify-center gap-12">
            {/* Manually arrange team members for specific layout */}
            {seniorLeads.length >= 3 && (
              <>
                <div className="w-full md:w-5/12 flex">
                  <div className="w-full h-full flex">
                    <SeniorLeadCard member={seniorLeads.find(member => member.name === "Humza") || seniorLeads[0]} />
                  </div>
                </div>
                <div className="w-full md:w-5/12 flex">
                  <div className="w-full h-full flex">
                    <SeniorLeadCard member={seniorLeads.find(member => member.name === "Ezra Baldwin") || seniorLeads[2]} />
                  </div>
                </div>
                <div className="w-full md:w-9/12 mx-auto mt-8 md:mt-12">
                  <SeniorLeadCard member={seniorLeads.find(member => member.name === "Onur Arslan") || seniorLeads[1]} />
                </div>
              </>
            )}
            {/* Fallback if team structure changes */}
            {seniorLeads.length < 3 && (
              <div className="grid md:grid-cols-2 gap-12 w-full">
                {seniorLeads.map((member, index) => (
                  <SeniorLeadCard key={`${member.name}-${index}`} member={member} />
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Ambassadors Section */}
        {ambassadors.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-24"
          >
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Our <span className="text-orange-500">Ambassadors</span>
              </h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              These passionate students and apprentices believe in our mission, support our vision, and are helping build ApprenticeWatch from the ground up.
              </p>
            </div>
            
            <div className="relative">
              {/* Left scroll button */}
              <button 
                onClick={scrollLeft}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-gray-800/80 rounded-full p-2 shadow-md hover:bg-orange-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Scroll left"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              {/* Scrollable container */}
              <div 
                ref={scrollContainerRef}
                className="flex overflow-x-auto pb-5 pt-2 px-10 scrollbar-hide snap-x snap-mandatory scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {ambassadors.map((member, index) => (
                  <div key={`${member.name}-${index}`} className="snap-start">
                    <AmbassadorCard member={member} />
                  </div>
                ))}
              </div>
              
              {/* Right scroll button */}
              <button 
                onClick={scrollRight}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-gray-800/80 rounded-full p-2 shadow-md hover:bg-orange-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Scroll right"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              {/* Gradient fade effect on edges */}
              <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-orange-50 to-transparent dark:from-gray-900 dark:to-transparent pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-orange-50 to-transparent dark:from-gray-900 dark:to-transparent pointer-events-none" />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
