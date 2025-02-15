import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

export const CVGuide = () => {
  return (
    <div className="cv-guide">
      <h1>CV Guide</h1>
      <p>
        <strong>“The most important thing about a CV is making a strong first impression.”</strong>
      </p>

      <h2>Personal Details</h2>
      <table>
        <tbody>
          <tr>
            <td><strong>First Last</strong></td>
            <td>
              <p>
                <a href="https://www.linkedin.com/company/apprenticewatch">LinkedIn</a> |{' '}
                <a href="https://github.com/apprenticewatch">Github</a> (if applicable)
              </p>
              <ul>
                <li>
                  44 1234567890 |{' '}
                  <a href="mailto:jamal@apprenticewatch.com">Email</a>
                </li>
              </ul>
            </td>
          </tr>
        </tbody>
      </table>

      <h2>Personal Statement</h2>
      <p>
        Your personal statement should remain consistent across applications, emphasizing your
        strongest skills and aligning with your ideal company. Use it to showcase your motivation and
        research the company thoroughly.
      </p>

      <h2>Work Experience</h2>
      <table>
        <tbody>
          <tr>
            <td><strong>Most Recent Relevant Work Experience Firm</strong></td>
            <td>Location, Country</td>
          </tr>
          <tr>
            <td>
              <em>Role/Event</em>
            </td>
            <td>
              <em>Start (Month, Year) - End/"Present"</em>
            </td>
          </tr>
        </tbody>
      </table>
      <ul>
        <li>Highlight measurable impacts of your work.</li>
        <li>Detail projects or achievements relevant to the role.</li>
        <li>Keep each point concise (1-2 lines).</li>
      </ul>

      <h2>Education</h2>
      <table>
        <tbody>
          <tr>
            <td>
              <strong>Sixth Form/College</strong> | Location, Country
            </td>
            <td>
              <em>Start (Year) - End</em>
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        <em>(Qualification): [Subject] 'Grade', ...</em>
      </p>
      <p>Any notable achievements.</p>

      <h2>Leadership/Extracurricular Activities</h2>
      <table>
        <tbody>
          <tr>
            <td>
              <strong>Assistant Coaching (Basketball & Boxing)</strong>
            </td>
            <td>
              <strong>3D Modelling Club</strong>
            </td>
            <td>
              <strong>Gaming</strong>
            </td>
            <td>
              <strong>Music Performance</strong>
            </td>
          </tr>
        </tbody>
      </table>

      <h2>Skills & Interests</h2>
      <p>
        <strong>Certifications & Skills:</strong> Include programming languages, Excel, Word,
        PowerPoint, etc.
      </p>
      <p>
        <strong>Activities & Interests:</strong> Mixed Martial Arts, Piano, Cooking, etc.
      </p>

      <h2>Final Tips</h2>
      <ul>
        <li>Keep your CV under 2 pages.</li>
        <li>Tailor your CV to the job description and company culture.</li>
        <li>Use measurable impacts and avoid clichés.</li>
        <li>Save your CV as a PDF with the name: "First Last [Company] CV".</li>
      </ul>

      <h3>Additional Resources</h3>
      <ul>
        <li>
          <a href="https://www.youtube.com/watch?v=Tt08KmFfIYQ">
            Write an Incredible Resume: 5 Golden Rules!
          </a>
        </li>
        <li>
          <a href="https://www.ox.ac.uk/admissions/graduate/applying-to-oxford/how-to-guides/writing-a-cv">
            How to write a CV | University of Oxford
          </a>
        </li>
      </ul>
    </div>
  );
};
