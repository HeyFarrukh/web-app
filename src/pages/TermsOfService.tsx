import React from 'react';
import { motion } from 'framer-motion';

export const TermsOfService = () => {
  return (
    <div className="min-h-screen pt-24 pb-12 bg-gradient-to-b from-orange-50/30 to-white dark:from-gray-900 dark:to-gray-800">
      <motion.div
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg prose dark:prose-invert prose-lg max-w-none">
          <div className="
            prose-headings:text-gray-900 dark:prose-headings:text-white
            prose-h1:text-4xl prose-h1:font-bold prose-h1:mb-8
            prose-h2:text-2xl prose-h2:font-semibold prose-h2:text-orange-600 dark:prose-h2:text-orange-400
            prose-h3:text-xl prose-h3:font-medium prose-h3:text-gray-800 dark:prose-h3:text-gray-200
            prose-p:text-gray-700 dark:prose-p:text-gray-300
            prose-strong:text-gray-900 dark:prose-strong:text-white
            prose-ul:text-gray-700 dark:prose-ul:text-gray-300
            prose-ol:text-gray-700 dark:prose-ol:text-gray-300
            prose-li:marker:!text-orange-500 dark:prose-li:marker:!text-orange-400
            [&_ol>li]:marker:!text-orange-500 dark:[&_ol>li]:marker:!text-orange-400
            [&_ul>li]:marker:!text-orange-500 dark:[&_ul>li]:marker:!text-orange-400
            prose-a:text-orange-600 dark:prose-a:text-orange-400
            prose-a:no-underline hover:prose-a:text-orange-700 dark:hover:prose-a:text-orange-300
          "><h1>Terms of Service</h1>
            <p>Last updated: February 04, 2025</p>
            <h2>1. Agreement to Terms</h2>
            <p>By accessing or using the ApprenticeWatch website (the "Service"), you agree to be bound by these Terms of Service ("Terms"). This Service is operated by ApprenticeWatch, based in the United Kingdom. If you do not agree to these Terms, you are prohibited from using or accessing the Service.</p>

            <h2>2. Use License</h2>
            <p>Permission is granted to temporarily access and view the information and apprenticeship listings provided on ApprenticeWatch's website for personal, non-commercial informational purposes only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
            <ol>
                <li>modify or copy the content for commercial purposes;</li>
                <li>use the content for any public display (commercial or non-commercial) beyond sharing links to the website;</li>
                <li>attempt to decompile or reverse engineer any software or systems used by ApprenticeWatch;</li>
                <li>remove any copyright or other proprietary notations from the content; or</li>
                <li>systematically download or scrape apprenticeship listings for use in another service.</li>
            </ol>
            <p>This license shall automatically terminate if you violate any of these restrictions and may be terminated by ApprenticeWatch at any time. </p>

            <h2>3. Disclaimer Regarding Apprenticeship Listings</h2>
            <p>ApprenticeWatch provides a platform for users to access information about apprenticeship opportunities across the United Kingdom. **Please be aware that the apprenticeship listings displayed on ApprenticeWatch are gathered from various external sources via APIs. ApprenticeWatch does not create these listings and therefore cannot guarantee the accuracy, completeness, suitability, or availability of any specific apprenticeship opportunity.**</p>
            <p>Any reliance you place on such information is strictly at your own risk. We strongly advise you to verify the details of any apprenticeship that interests you directly with the employer or training provider listed.</p>

            <h2>4. General Disclaimer</h2>
            <p>The information provided on ApprenticeWatch's website is for general informational purposes only. ApprenticeWatch makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
            <p>Further, ApprenticeWatch does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its website or otherwise relating to such materials or on any sites linked to this site.</p>

            <h2>5. Limitations</h2>
            <p>In no event shall ApprenticeWatch or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on ApprenticeWatch's website, or from reliance on apprenticeship listings, even if ApprenticeWatch or a ApprenticeWatch authorized representative has been notified orally or in writing of the possibility of such damage.</p>

            <h2>6. Accuracy of Materials</h2>
            <p>While we strive to keep the information on ApprenticeWatch accurate, the materials appearing on ApprenticeWatch's website could include technical, typographical, or photographic errors. ApprenticeWatch does not warrant that any of the materials on its website are accurate, complete or current. ApprenticeWatch may make changes to the materials contained on its website at any time without notice. However, ApprenticeWatch does not make any commitment to update the materials.</p>

            <h2>7. Links</h2>
            <p>ApprenticeWatch may contain links to external websites and resources, including those hosting the apprenticeship listings. ApprenticeWatch has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by ApprenticeWatch of the site. Use of any such linked website is at the user's own risk.</p>

            <h2>8. User Accounts</h2>
            <p>ApprenticeWatch utilizes Google Sign-In for user authentication. By using Google Sign-In to access the Service, you agree to be bound by Google's Terms of Service and Privacy Policy. You are responsible for maintaining the confidentiality of your Google account credentials. You agree to notify us immediately of any unauthorized use of your account or any other breach of security. ApprenticeWatch will not be liable for any loss or damage arising from your failure to comply with this security obligation.</p>

            <h2>9. Intellectual Property</h2>
            <p>All content included on the Service, such as text, graphics, logos, button icons, images, and the compilation thereof, is the property of ApprenticeWatch and is protected by copyright and other intellectual property laws of the United Kingdom. You are granted a limited license to access and use the Service and its content for personal, non-commercial purposes as outlined in these Terms.</p>

            <h2>10. Prohibited Conduct</h2>
            <p>You agree not to:</p>
            <ol>
                <li>Use the Service for any unlawful purpose or in violation of any applicable laws or regulations.</li>
                <li>Attempt to gain unauthorized access to any portion of the Service or any other accounts, computer systems, or networks connected to the Service.</li>
                <li>Interfere with or disrupt the operation of the Service or the servers or networks connected to the Service.</li>
                <li>Collect or harvest any personally identifiable information from the Service.</li>
                <li>Use any robot, spider, scraper, or other automated means to access the Service for any purpose without our express written permission.</li>
            </ol>

            <h2>11. Termination</h2>
            <p>We may terminate or suspend your access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms.</p>
            <p>Upon termination, your right to use the Service will cease immediately.</p>

            <h2>12. Disclaimer of Warranties</h2>
            <p>THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. APPRENTICEWATCH EXPRESSLY DISCLAIMS ALL WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. APPRENTICEWATCH MAKES NO WARRANTY THAT THE SERVICE WILL BE UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE.</p>

            <h2>13. Limitation of Liability</h2>
            <p>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL APPRENTICEWATCH, NOR ITS DIRECTORS, EMPLOYEES, PARTNERS, AGENTS, SUPPLIERS, OR AFFILIATES, BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM (I) YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICE; (II) ANY CONTENT, INCLUDING APPRENTICESHIP LISTINGS, OBTAINED FROM THE SERVICE; AND (III) UNAUTHORIZED ACCESS, USE OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT, WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE) OR ANY OTHER LEGAL THEORY, WHETHER OR NOT WE HAVE BEEN INFORMED OF THE POSSIBILITY OF SUCH DAMAGE, AND EVEN IF A REMEDY SET FORTH HEREIN IS FOUND TO HAVE FAILED OF ITS ESSENTIAL PURPOSE.</p>

            <h2>14. Indemnification</h2>
            <p>You agree to indemnify, defend and hold harmless ApprenticeWatch and its affiliates, officers, directors, employees, agents, and licensors from and against any and all claims, liabilities, damages, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising from your use of the Service or your breach of these Terms.</p>

            <h2>15. Changes to Terms of Service</h2>
            <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>
            <p>By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, please stop using the Service.</p>

            <h2>16. Governing Law</h2>
            <p>These terms and conditions are governed by and construed in accordance with the laws of England and Wales, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.</p>

            <h2>17. Contact Us</h2>
            <p>If you have any questions about these Terms of Service, please contact us:</p>
            <ul>
                <li>By email: terms@apprenticewatch.com</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TermsOfService;