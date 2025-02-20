'use client';

import React from 'react';
import { ReactNode } from 'react'; // Add this import
import { motion } from 'framer-motion';
//import { Helmet } from 'react-helmet-async';
import { 
  Briefcase, 
  GraduationCap, 
  ClipboardCheck,
  BookMarked,
  FileText,
  School,
  Trophy,
  Code,
  FileBadge,
  Link2,
  Building2
} from 'lucide-react';

export const CVGuide = () => {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      
      {/* Hero Section */}
      <motion.section {...fadeIn} className="px-4 py-24 text-center bg-gradient-to-r from-blue-500 to-purple-600 -mb-15">
        <h1 className="text-4xl font-bold text-white mb-4">CV Writing Guide</h1>
        <p className="text-xl text-white">"The most important thing about a CV is making a strong first impression"</p>
      </motion.section>

      {/* Personal Information Example */}
      <motion.div {...fadeIn} className="max-w-4xl mx-auto p-6 mt-8 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">First Last</h2>
          </div>
          <div className="text-right text-gray-700 dark:text-gray-300">
            <p> <a href="https://www.linkedin.com/company/apprenticewatch" className="text-blue-600 hover:text-blue-800 underline">LinkedIn</a> | <a href="https://github.com/apprenticewatch" className="text-blue-600 hover:text-blue-800 underline">Github</a> (if applicable)</p>
            <p>+44 1234567890 | <a href="mailto:jamal@apprenticewatch.com" className="text-blue-600 hover:text-blue-800 underline">Email</a></p>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">

        <Section 
          icon={<FileText />}
          title="Master CV Concept"
          content={
            <div className="text-gray-700 dark:text-gray-300">
              <p>If anything, your details are the one part of your CV that should stay the same, regardless of the company you’re applying to. In other words, it should go unchanged from the <a href="https://www.jobteaser.com/en/advices/153-why-you-should-always-keep-a-master-cv" className="text-blue-600 hover:text-blue-800 underline">Master CV</a> - a resume that has absolutely everything that you would ever want to include in an application. To simplify things, your master CV should emphasise your strongest skills, and be centered around your ideal company</p>
              <p>However, each CV should be tailored to the job description and culture of the company in order to emphasise your points, and showcase why you could be a perfect fit for the vacancy. This includes everything from the subjects highlighted in education, down to the headlined skills & achievements, and the personal statement.</p>
              <p>A personal statement is not a must-have for a CV, especially when you have many experiences to draw from. Nonetheless, a personal statement or career objective could be expected by recruiters, or useful when differentiating from other applicants. In certain industries, such as hospitality, a personal statement can act as a prerequisite to an interview, giving insight to your character and goals. If anything, use it to showcase your motivation behind working "here" rather than anywhere else. Research !</p>
            </div>
          }
        />

        <Section 
          icon={<Building2 />}
          title="Work Experience/Professional"
          content={
            <div>
              <table className="w-full border-collapse mb-4">
                <tr>
                  <td className="py-0 font-semibold" colSpan={1} rowSpan={1}>
                    <p className="m-1 leading-tight">
                      <span className="text-gray-800 dark:text-gray-200">Most Recent Relevant Work Experience Firm</span>
                    </p>
                  </td>
                  <td className="py-0 text-right" colSpan={1} rowSpan={1}>
                    <p className="m-1 leading-tight">
                      <span className="text-gray-600 dark:text-gray-400">Location, Country</span>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td className="py-0" colSpan={1} rowSpan={1}>
                    <p className="m-1 leading-tight">
                      <span className="text-gray-700 italic dark:text-gray-300 italic">Role/Event</span>
                    </p>
                  </td>
                  <td className="py-0 text-right" colSpan={1} rowSpan={1}>
                    <p className="m-1 leading-tight">
                      <span className="text-gray-700 italic dark:text-gray-300 italic">Start (Month, Year) - End/“Present”</span>
                    </p>
                  </td>
                </tr>
              </table>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <span className="text-gray-700 dark:text-gray-300">Talk about the impact of your work with measurable impacts if possible. If it was a workshop or other type of professional event, display the attributes, professional behaviours, and skills you learnt or refined.</span>
                </li>
                <li>
                  <span className="text-gray-700 dark:text-gray-300">Second piece of information perhaps detailing a project that you helped with – or another relevant achievement.</span>
                </li>
                <li>
                  <span className="text-gray-700 dark:text-gray-300">Final highlight – don’t waffle- you can go into extra detail once you’re in the interview.</span>
                </li>
              </ul>
            </div>
          }
        />

        {/* Continue with Education, Skills, etc. sections */}
      

      
        {/* Quick Tips Section */}
        <div className="mt-8 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg mb-12">
          <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Quick Tips for Your CV</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <ClipboardCheck className="text-blue-500 flex-shrink-0" size={20} />
              <span className="text-gray-700 dark:text-gray-300">Try to keep each point between 1 and 2 lines.</span>
            </li>
            <li className="flex items-start gap-2">
              <ClipboardCheck className="text-blue-500 flex-shrink-0" size={20} />
              <span className="text-purple-700 dark:text-purple-400">What you did & how (skills/job description) → Measurable impact (quantified).</span>
            </li>
            <li className="flex items-start gap-2">
              <ClipboardCheck className="text-blue-500 flex-shrink-0" size={20} />
              <span className="text-gray-700 dark:text-gray-300">Use keywords which emphasise the soft skills essential for the role, e.g. “Co-ordinated the team...”, “Analysed survey responses to identify trends…”.</span>
            </li>
            <li className="flex items-start gap-2">
              <ClipboardCheck className="text-blue-500 flex-shrink-0" size={20} />
              <span className="text-gray-700 dark:text-gray-300">When adapting the master CV to an application, consider the culture of the company and the job description.</span>
            </li>
            <li className="flex items-start gap-2">
              <ClipboardCheck className="text-blue-500 flex-shrink-0" size={20} />
              <span className="text-gray-700 dark:text-gray-300">Don’t lie!</span>
            </li>
          </ul>
        </div>

    
        <Section 
          icon={<Briefcase />}
          title="Example for Consulting or Tech:"
          content={
            <div>
              <table className="w-full border-collapse mb-4">
                <tr>
                  <td className="py-0 font-semibold" colSpan={1} rowSpan={1}>
                    <p className="m-1 leading-tight">
                      <span className="text-gray-800 dark:text-gray-200">PA Consulting</span>
                    </p>
                  </td>
                  <td className="py-0 text-right" colSpan={1} rowSpan={1}>
                    <p className="m-1 leading-tight">
                      <span className="text-gray-600 dark:text-gray-400">London, UK</span>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td className="py-0" colSpan={1} rowSpan={1}>
                    <p className="m-1 leading-tight">
                      <span className="text-gray-700 italic dark:text-gray-300 italic">Data Scientist Intern</span>
                    </p>
                  </td>
                  <td className="py-0 text-right" colSpan={1} rowSpan={1}>
                    <p className="m-1 leading-tight">
                      <span className="text-gray-700 italic dark:text-gray-300 italic">Jan 2024</span>
                    </p>
                  </td>
                </tr>
              </table>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <span className="text-gray-700 dark:text-gray-300">Led the development of an AI application dedicated to monitoring legislative regulatory changes, substantially reducing administrative overhead and repetitive tasks by 90%.</span>
                </li>
                <li>
                  <span className="text-gray-700 dark:text-gray-300">Supervised a small team using the Scrum framework, ensuring collaborative environments and high-quality work.</span>
                </li>
              </ul>
              <div className="text-gray-700 dark:text-gray-300">
                <p>Whilst this example could be derived from the master CV, if you were applying for ‘Project Management’ for instance, you could focus more on how you handled constraints, or coordinated resources, and write “Project Manager Intern” instead.</p>
                <p>If possible, each experience should cover a different part of the job description, or your skillset, instead of repeating similar points. Even if you completed similar tasks, you can break down subsections of an experience, to emphasise versatility and willingness to learn - key attributes for an apprentice.</p>
              </div>
            </div>
          }
        />

        {/* Tailoring Tips Section */}
        <div className="mt-8 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg mb-12">
          <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Considerations</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <ClipboardCheck className="text-orange-500 flex-shrink-0" size={20} />
              <span className="text-gray-700 dark:text-gray-300">
                Consistency is key
              </span>
            </li>
            <li className="flex items-start gap-2">
              <ClipboardCheck className="text-orange-500 flex-shrink-0" size={20} />
              <span className="text-gray-700 dark:text-gray-300">
                Always start from most to least recent
              </span>
            </li>
            <li className="flex items-start gap-2">
              <ClipboardCheck className="text-orange-500 flex-shrink-0" size={20} />
              <span className="text-gray-700 dark:text-gray-300">
                Ensure no spelling or grammar errors
              </span>
            </li>
            <li className="flex items-start gap-2">
              <ClipboardCheck className="text-orange-500 flex-shrink-0" size={20} />
              <span className="text-gray-700 dark:text-gray-300">
                Some companies will have AI filtering. To prepare for this, try and use as many important keywords from the job description which naturally fit. Use our CV optimisation to help you
              </span>
            </li>
            <li className="flex items-start gap-2">
              <ClipboardCheck className="text-orange-500 flex-shrink-0" size={20} />
              <span className="text-gray-700 dark:text-gray-300">
                When read by a recruiter, they will spend less than a minute reading, so focus on what you did, and why it mattered (impact) in the first line of each experience -<b> Measurable impacts!</b>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <ClipboardCheck className="text-orange-500 flex-shrink-0" size={20} />
              <span className="text-gray-700 dark:text-gray-300">
                If it’s hard to quantify your work, use “Action” & “Result” from the <a href = "https://uk.indeed.com/career-advice/interviewing/starr-method" className="text-orange-600 hover:text-orange-800 ">STARR framework</a>, and estimate the impact of what you did
              </span>
            </li>
          </ul>
        </div>
      
      
        <Section 
          icon={<GraduationCap />} // Replace with your icon component
          title="Education"
          content={
            <div>
              {/* Sixth Form/College */}
              <table className="w-full border-collapse mb-4">
                <tr>
                  <td className="py-0" colSpan={1} rowSpan={1}>
                    <p className="m-0 leading-tight">
                      <span className="font-semibold text-gray-800 dark:text-gray-200">Sixth Form/College</span>
                      <span className="text-gray-600 dark:text-gray-400"> | Location, Country</span>
                    </p>
                  </td>
                  <td className="py-0 text-right" colSpan={1} rowSpan={1}>
                    <p>
                      <span className="text-gray-700 italic dark:text-gray-300">Start (Year) - End</span>
                    </p>
                  </td>
                </tr>
              </table>
              <div className="pl-6 mb-4">
                <p className="leading-tight text-gray-700 dark:text-gray-300">
                  (Qualification): [Subject] ‘Grade’, …
                </p>
                <p className="leading-tight text-gray-700 dark:text-gray-300">
                  Any notable achievements
                </p>
              </div>

              {/* Secondary School */}
              <table className="w-full border-collapse mb-4">
                <tr>
                  <td className="py-0" colSpan={1} rowSpan={1}>
                    <p className="m-0 leading-tight">
                      <span className="font-semibold text-gray-800 dark:text-gray-200">Secondary School (if different)</span>
                      <span className="text-gray-600 dark:text-gray-400"> | Location, Country</span>
                    </p>
                  </td>
                  <td className="py-0 text-right" colSpan={1} rowSpan={1}>
                    <p>
                      <span className="text-gray-700 italic dark:text-gray-300">Start (Year) - End</span>
                    </p>
                  </td>
                </tr>
              </table>
              <div className="pl-6">
                <p className="leading-tight text-gray-700 dark:text-gray-300">
                  (Qualification): [Subject] ‘Grade’, …
                </p>
                <p className="leading-tight text-gray-700 dark:text-gray-300">
                  Any notable achievements
                </p>
              </div>
            </div>
          }
        />
      

        <Section 
          icon={<School />}
          title="Sixth Form Example"
          content={
            <div> 
              {/* Sixth Form/College */}
              <table className="w-full border-collapse mb-4">
                <tr>
                  <td className="py-0" colSpan={1} rowSpan={1}>
                    <p className="m-0 leading-tight">
                      <span className="font-semibold text-gray-800 dark:text-gray-200">Ada, the National College of Digital Skills</span>
                      <span className="text-gray-600 dark:text-gray-400"> | London, UK</span>
                    </p>
                  </td>
                  <td className="py-0 text-right" colSpan={1} rowSpan={1}>
                    <p>
                      <span className="text-gray-700 italic dark:text-gray-300">2023-2025</span>
                    </p>
                  </td>
                </tr>
              </table>
              <div className="pl-6 mb-4">
                <p className="leading-tight text-gray-700 dark:text-gray-300">
                  <i>BTEC National Diploma:</i> Computer Science  D*D*
                </p>
                <p className="leading-tight text-gray-700 dark:text-gray-300">
                  <i>A-Level:</i> Business  A*
                </p>
                <p className="leading-tight text-gray-700 dark:text-gray-300">
                  <i>Mathematical Studies:</i> (Core Maths)	 A 
                </p>
                <p className="leading-tight text-gray-700 dark:text-gray-300">
                  <i>Certificates in Formal Writing:</i>    Achieved 
                </p>
                <p className="leading-tight text-gray-700 dark:text-gray-300">
                  <i>Certificates in Formal Presenting:</i>    Achieved 
                </p>
              </div>
              <div className="text-gray-700 dark:text-gray-300">
                (If you had any projects/coursework, certifications, or achievements under education, you could also put them here)
              </div>
            </div>
          }
        />
      
    
        <Section 
          icon={<Trophy />} // Replace with your icon component
          title="Leadership/Extracurricular Experience/Activities"
          content={
            <div>
              {/* Description */}
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Same format as work experience or (example):
              </p>

              {/* Activities Table */}
              <table className="w-full border-collapse">
                <tr>
                  <td className="py-2" colSpan={1} rowSpan={1}>
                    <p className="m-0 leading-tight text-gray-700 dark:text-gray-300">Basketball Coaching</p>
                    <p className="text-gray-700 dark:text-gray-300">Music Performance</p>
                    <p className="text-gray-700 dark:text-gray-300">Music Production</p>
                  </td>
                  <td className="py-2" colSpan={1} rowSpan={1}>
                    <p className="m-0 leading-tight text-gray-700 dark:text-gray-300">3D Modelling Club</p>
                    <p className="text-gray-700 dark:text-gray-300">Programming Club</p>
                    <p className="text-gray-700 dark:text-gray-300">Boxing Marketing</p>
                  </td>
                  <td className="py-2" colSpan={1} rowSpan={1}>
                    <p className="m-0 leading-tight text-gray-700 dark:text-gray-300">Chess</p>
                    <p className="text-gray-700 dark:text-gray-300">Choir</p>
                    <p className="text-gray-700 dark:text-gray-300">Gaming</p>
                  </td>
                </tr>
              </table>
            </div>
          }
        />


        {/* Skills & Interests Section */}
        <Section 
          icon={<FileBadge />}
          title="Skills & Interests"
          content={
            <div className="space-y-6">
              <div>
                <h3 className="font-bold mb-2">Certifications & Skills:</h3>
                <p className="text-gray-700 dark:text-gray-300">Include programming skills/languages/excel/word/ppt/anything relevant to the job. Try to focus more on hard skills which you have enough confidence in.</p>
              </div>
              <div>
                <h3 className="font-bold mb-2">Activities & Interests</h3>
                <p className="text-gray-700 dark:text-gray-300">Mixed Martial Arts, Piano, Cooking, Breathing, <a href="https://www.totaljobs.com/advice/how-to-write-your-hobbies-and-interests-on-your-cv" className="text-blue-600 hover:text-blue-800 underline">anything interesting about yourself!</a> Be prepared to talk about these too, as they make you stand out in the memory of a hiring manager after meeting multiple people for a role.</p>
              </div>
            </div>
          }
        />
      


        {/* Skills & Interests Section */}
        <Section 
          icon={<Code />}
          title="Example of Skills & Interests"
          content={
            <div className="space-y-6">
              <div>
                <h3 className="font-bold mb-2">Technical Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {['Python', 'JavaScript', 'HTML', 'Java'].map(skill => (
                    <span key={skill} className="px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-full text-sm dark:text-gray-300">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-bold mb-2">Interests</h3>
                <p className="text-gray-700 dark:text-gray-300">Mixed Martial Arts, Technology, Business, Music. <i>Currently Reading: Anna Karenina - Leo Tolstoy</i></p>
              </div>
              <div>
                <h3 className="font-bold mb-2">Activities</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <span className="text-gray-700 dark:text-gray-300">UK Bebras Challenge; NCSC challenge; Newcastle Bitesize programme</span>
                  </li>
                  <li>
                    <span className="text-gray-700 dark:text-gray-300">UK maths challenge; Hoja.ai Marketing cohort; PwC Virtual Insight Programme.</span>
                  </li>
                </ul>
              </div>
            </div>
          }
        />

        {/* Final Tips Section */}
        <div className="mt-8 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg mb-12">
          <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Final Tips</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <ClipboardCheck className="text-purple-500 flex-shrink-0" size={20} />
              <span className="text-gray-700 dark:text-gray-300">
                The most important thing about a CV is making a strong first impression
              </span>
            </li>
            <li className="flex items-start gap-2">
              <ClipboardCheck className="text-purple-500 flex-shrink-0" size={20} />
              <span className="text-gray-700 dark:text-gray-300">
                Consistency is key !! This includes formatting, <a href="https://www.themuse.com/advice/finally-the-answer-to-how-much-does-my-resume-font-matter" className="text-blue-600 hover:text-blue-800 ">fonts</a> and no mistakes
              </span>
            </li>
            <li className="flex items-start gap-2">
              <ClipboardCheck className="text-purple-500 flex-shrink-0" size={20} />
              <span className="text-gray-700 dark:text-gray-300">
                Keep it under 2 pages at <b>most.</b> In investment banking, a one-page CV is standard
              </span>
            </li>
            <li className="flex items-start gap-2">
              <ClipboardCheck className="text-purple-500 flex-shrink-0" size={20} />
              <span className="text-gray-700 dark:text-gray-300">
                Do not add LinkedIn & Github if your profile is ‘bare bones’ - empty
              </span>
            </li>
            <li className="flex items-start gap-2">
              <ClipboardCheck className="text-purple-500 flex-shrink-0" size={20} />
              <span className="text-gray-700 dark:text-gray-300">
              Always <a href="/optimise-cv" className="text-blue-600 hover:text-blue-800 " >tailor a CV</a> to the job description and company culture, whilst avoiding sounding verbose and inauthentic. Be as clear and concise as possible.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <ClipboardCheck className="text-purple-500 flex-shrink-0" size={20} />
              <span className="text-gray-700 dark:text-gray-300">
                Avoid broad skills or <a href = "https://www.indeed.com/career-advice/resumes-cover-letters/buzzwords-to-avoid-in-resume" className="text-blue-600 hover:text-blue-800 ">clichés</a>, but replace it with how it may have related to the task or action. e.g. “Teamworker” → “Collaborated on a project..”
              </span>
            </li>
            <li className="flex items-start gap-2">
              <ClipboardCheck className="text-purple-500 flex-shrink-0" size={20} />
              <span className="text-gray-700 dark:text-gray-300">
                Include <a href = "http://cheekyscientist.com/how-to-ensure-your-resume-makes-a-winning-first-impression/" className="text-blue-600 hover:text-blue-800">appropriate sections</a>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <ClipboardCheck className="text-purple-500 flex-shrink-0" size={20} />
              <span className="text-gray-700 dark:text-gray-300">
                Save application CV’s as .pdf’s and name them: “First Last [Company] CV”
              </span>
            </li>
          </ul>
        </div>

        <Section 
          icon={<BookMarked />} // Replace with your icon component
          title="Overview: CV Tips & Best Practices"
          content={
            <div className="space-y-6">
              {/* 1. How to Tailor Your CV for Each Application */}
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">
                  1. How to Tailor Your CV for Each Application
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                  <li>Customise CVs to match job descriptions.</li>
                  <li>
                    Example: Highlighting specific skills based on company culture and role requirements.
                  </li>
                  <li>AI-powered CV optimisation.</li>
                </ul>
              </div>

              {/* 2. Common CV Mistakes to Avoid */}
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">
                  2. Common CV Mistakes to Avoid
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                  <li>Overloading with unnecessary details.</li>
                  <li>Using clichés like "hardworking" without proving it.</li>
                  <li>
                    Spelling and grammar mistakes (Tools: Grammarly, LanguageTool, Hemingway Editor).
                  </li>
                </ul>
              </div>

              {/* 3. CV Formatting & Readability */}
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">
                  3. CV Formatting & Readability
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                  <li>Recommended fonts: Arial, Calibri, Times New Roman (size 10-12).</li>
                  <li>Use bullet points and clear section headings.</li>
                  <li>Keep margins at 0.5” to 1” for professional formatting.</li>
                  <li>Make sure your CV is between 1-2 pages.</li>
                </ul>
              </div>

              {/* 4. How to Write Impactful Bullet Points */}
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">
                  4. How to Write Impactful Bullet Points (What you did + Impact)
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                  <li>Situation: Describe the context.</li>
                  <li>Task: What was your responsibility?</li>
                  <li>Action: What did you do?</li>
                  <li>Result: What was the outcome?</li>
                  <li>Reflection: What did you learn from this experience?</li>
                </ul>
                <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <p className="text-green-600 dark:text-green-400">
                    ✅ "Developed a Python script to automate data collection, reducing manual work by 60%."
                  </p>
                  <p className="text-red-600 dark:text-red-400 mt-2">
                    ❌ "Worked with Python for data collection."
                  </p>
                </div>
              </div>

              {/* 5. Online Presence & Portfolio */}
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">
                  5. Online Presence & Portfolio
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                  <li>
                    Make LinkedIn stand out by adding bio, experience, and projects.
                  </li>
                  <li>
                    GitHub & Personal website for tech roles (Showcase projects & clean code).
                  </li>
                  <li>
                    Link your online portfolio, especially if you are a designer, developer, or marketer.
                  </li>
                </ul>
              </div>

              {/* 6. The Power of Keywords (Beating ATS Systems) */}
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">
                  6. The Power of Keywords (Beating ATS Systems)
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                  <li>
                    Applicant Tracking Systems (ATS) scan <a href="https://create.microsoft.com/en-us/templates/ats-resumes" className= "text-blue-600 hover:text-blue-800 underline">CVs</a> for relevant keywords.
                  </li>
                  <li>
                    Find keywords in the job description and incorporate them naturally.
                  </li>
                  <li>
                    Example: "Software Engineering Intern" should have terms like "Python", "Agile","Data Structures" etc.
                  </li>
                </ul>
              </div>

              {/*Additional Resources*/}
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200 flex items-center">
                  <Link2 className="mr-2 text-blue-600 dark:text-blue-400" size={20} />
                  Additional Resources
                </h3>
                <p><a href="https://www.youtube.com/watch?v=Tt08KmFfIYQ" className="text-blue-600 hover:text-red-400">Write an Incredible Resume: 5 Golden Rules!</a></p>
                <p><a href="https://www.ncl.ac.uk/careers/making-applications/applications/cvs/" className="text-blue-600 hover:text-blue-800 underline">How to write a CV | Newcastle University</a></p>
                <p className ="text-gray-700 dark:text-gray-300"><a href="https://www.telegraph.co.uk/money/jobs/how-to-write-cv/" className="text-blue-600 hover:text-blue-800 underline">How to write a CV |<i> The Telegraph</i></a> (Sign-Up Required)</p>
                <p className ="text-gray-700 dark:text-gray-300">Good luck with your applications!</p>
              </div>
            </div>
          }
        />
      </div>

      {/* CV Optimisation Tools */}
      <motion.div 
        className="px-8 py-10 text-center bg-gradient-to-r from-purple-500 to-blue-500 text-white"
      >
        <h3 className="text-xl font-bold mb-4">Ready to optimise your CV?</h3>
        <p className="mb-4">Use our AI-powered tool to tailor your CV for specific job applications</p>
        <a 
          href="/optimise-cv" 
          className="inline-block px-6 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-200 transition"
        >
          Try CV Optimiser
        </a>
      </motion.div>
    </div>
  );
};

type SectionProps = {
  icon: ReactNode; // icon can be any valid React element
  title: string;
  content: ReactNode; // content can also be any valid React element (text, JSX, etc.)
};

const Section = ({ icon, title, content }: SectionProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
  >
    <div className="flex items-center gap-2 mb-4">
      <span className="text-blue-600 dark:text-blue-400">
        {icon}
      </span>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
    </div>
    <div className="prose dark:prose-invert max-w-none">
      {content}
    </div>
  </motion.div>
);

export default CVGuide;