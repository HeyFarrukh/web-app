import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

export const CookiePolicy: React.FC = () => {
  return (
    <div className="min-h-screen pt-24 pb-12 bg-gradient-to-b from-orange-50/30 to-white dark:from-gray-900 dark:to-gray-800">
      <Helmet>
        <title>Cookie Policy - ApprenticeWatch</title>
        <meta name="title" content="Cookie Policy - ApprenticeWatch" />
        <meta name="description" content="Learn about our use of cookies and how we protect your data. Read our Cookie Policy for full details." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://apprenticewatch.com/cookie-policy" />
        <meta property="og:title" content="Cookie Policy - ApprenticeWatch" />
        <meta property="og:description" content="Learn about our use of cookies and how we protect your data. Read our Cookie Policy for full details." />
        <meta property="og:image" content="/media/cookie-policy.png" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://apprenticewatch.com/cookie-policy" />
        <meta property="twitter:title" content="Cookie Policy - ApprenticeWatch" />
        <meta property="twitter:description" content="Learn about our use of cookies and how we protect your data. Read our Cookie Policy for full details." />
        <meta property="twitter:image" content="/media/cookie-policy.png" />
      </Helmet>
     <motion.div 
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg prose dark:prose-invert prose-lg max-w-none">
          {/* Improved typography styles */}
          <div className="
            prose-headings:text-gray-900 dark:prose-headings:text-white
            prose-h1:text-4xl prose-h1:font-bold prose-h1:mb-8
            prose-h2:text-2xl prose-h2:font-semibold prose-h2:text-orange-600 dark:prose-h2:text-orange-400
            prose-h3:text-xl prose-h3:font-medium prose-h3:text-gray-800 dark:prose-h3:text-gray-200
            prose-p:text-gray-700 dark:prose-p:text-gray-300
            prose-strong:text-gray-900 dark:prose-strong:text-white
            prose-ul:text-gray-700 dark:prose-ul:text-gray-300
            prose-li:marker:text-orange-500 dark:prose-li:marker:text-orange-400
            prose-a:text-orange-600 dark:prose-a:text-orange-400 
            prose-a:no-underline hover:prose-a:text-orange-700 dark:hover:prose-a:text-orange-300
          ">
            <h1>Cookie Policy</h1>
            <p>Last updated: February 04, 2025</p>
            <p>This Cookie Policy explains what cookies are and how we currently use, or will use them pending changes in the future. You should read this policy to understand what cookies are, how we use them, the types of cookies we use, i.e., the information we collect using cookies and how that information is used, and how to control the cookie preferences. For further information on how we use, store, and keep your personal data secure, see our Privacy Policy.</p>
            <h2>What are cookies?</h2>
            <p>Cookies are small text files that are used to store small pieces of information. They are stored on your device when the website is loaded on your browser. These cookies help us make the website function properly, make it more secure, provide better user experience, and understand how the website performs and to analyse what works and where it needs improvement.</p>
            <h2>How do we use cookies?</h2>
            <p>As most of the online services, our website uses cookies first-party and third-party cookies for several purposes. The first-party cookies are mostly necessary for the website to function the right way, and they do not collect any of your personally identifiable data.</p>
            <p>The third-party cookies used on our websites are used mainly for understanding how the website performs, how you interact with our website, keeping our services secure, providing advertisements that are relevant to you, and all in all providing you with a better and improved user experience and help speed up your future interactions with our website.</p>
            <h2>Types of cookies we use</h2>
            <ul>
            <li><strong>User session and Analytics:</strong> Some cookies are essential for you to be able to experience the full functionality of our site. They allow us to maintain user sessions and prevent any security threats. They do not collect or store any personal information. Additionally, we may collect info about the brow</li>
            <li><strong>Statistics:</strong> These cookies store information like the number of visitors to the website, the number of unique visitors, which pages of the website have been visited, the source of the visit, etc. This data helps us understand and analyse how well the website performs and where it needs improvement.</li>
            <li><strong>Functional:</strong> These are the cookies that help certain non-essential functionalities on our website. These functionalities include embedding content like videos or sharing content on the website on social media platforms.</li>
            <li><strong>Preferences:</strong> These cookies help us store your settings and browsing preferences like language preferences so that you have a better and efficient experience on future visits to the website. They also store your login information so you don't have to log in every time you visit.</li>
            </ul>
            <h2>Manage cookie preferences</h2>
            <p>You can change your cookie preferences any time by clicking on the settings button. This will let you revisit the cookie consent banner and change your preferences or withdraw your consent right away.</p>
            <p>In addition to this, different browsers provide different methods to block and delete cookies used by websites. You can change the settings of your browser to block/delete the cookies. To find out more about how to manage and delete cookies, visit wikipedia.org, www.allaboutcookies.org.</p>
            <h2>Contact Us</h2>
            <p>If you have any questions about this Cookie Policy, You can contact us:</p>
            <ul>
            <li>By email: privacy@apprenticewatch.com</li>
          </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};