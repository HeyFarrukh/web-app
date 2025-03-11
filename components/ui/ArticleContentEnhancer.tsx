"use client";

import React, { useEffect, useRef } from 'react';

/**
 * ArticleContentEnhancer component improves the formatting and alignment of article content
 * This component enhances readability and visual appeal of article elements
 */
const ArticleContentEnhancer: React.FC = () => {
  const articleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!articleRef.current) return;

    const articleWrapper = articleRef.current.closest('.article-content-wrapper');
    if (!articleWrapper) return;

    // Enhance images
    const images = articleWrapper.querySelectorAll('img:not(a img):not(.icon img):not(.lucide-icon img)');
    images.forEach(img => {
      const wrapper = document.createElement('div');
      wrapper.className = 'text-center my-8';
      img.parentNode?.insertBefore(wrapper, img);
      wrapper.appendChild(img);
      
      if (img instanceof HTMLElement) {
        img.style.margin = '0 auto';
        img.style.borderRadius = '0.75rem';
        img.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
      }
    });

    // Enhance blockquotes
    const blockquotes = articleWrapper.querySelectorAll('blockquote');
    blockquotes.forEach(blockquote => {
      if (blockquote instanceof HTMLElement) {
        blockquote.style.borderLeftWidth = '4px';
        blockquote.style.paddingLeft = '1.5rem';
        blockquote.style.fontStyle = 'italic';
        blockquote.style.margin = '2rem 0';
      }
    });

    // Enhance headings
    const headings = articleWrapper.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach(heading => {
      if (heading instanceof HTMLElement) {
        heading.style.marginTop = '2rem';
        heading.style.marginBottom = '1rem';
        heading.style.fontWeight = '700';
        heading.style.lineHeight = '1.2';
        
        // Fix Lucide icons in headings - make them inline with text
        const lucideIcon = heading.querySelector('.lucide-icon');
        if (lucideIcon) {
          // Make sure the icon is displayed inline with the text
          if (lucideIcon instanceof HTMLElement) {
            lucideIcon.style.display = 'inline-block';
            lucideIcon.style.verticalAlign = 'middle';
            lucideIcon.style.marginRight = '0.5rem';
            lucideIcon.style.marginTop = '-0.125rem'; // Slight adjustment to align with text
          }
          
          // Fix any line breaks between the icon and text
          const nextSibling = lucideIcon.nextSibling;
          if (nextSibling && nextSibling.nodeType === Node.TEXT_NODE && nextSibling.textContent?.trim() === '') {
            // Remove whitespace text node
            nextSibling.remove();
          }
          
          // If there's a <br> after the icon, remove it
          const nextElement = lucideIcon.nextElementSibling;
          if (nextElement && nextElement.tagName === 'BR') {
            nextElement.remove();
          }
          
          // Ensure the heading text is on the same line as the icon
          const headingHTML = heading.innerHTML;
          const cleanedHTML = headingHTML.replace(/>\s*<br\s*\/?>\s*/gi, '>');
          heading.innerHTML = cleanedHTML;
        }
      }
    });

    // Enhance lists
    const lists = articleWrapper.querySelectorAll('ul, ol');
    lists.forEach(list => {
      if (list instanceof HTMLElement) {
        list.style.paddingLeft = '1.5rem';
        list.style.margin = '1.5rem 0';
      }
    });

    // Enhance horizontal rules
    const hrs = articleWrapper.querySelectorAll('hr');
    hrs.forEach(hr => {
      if (hr instanceof HTMLElement) {
        hr.style.margin = '3rem 0';
        hr.style.borderWidth = '0';
        hr.style.height = '1px';
        hr.style.background = 'linear-gradient(to right, rgba(249, 115, 22, 0), rgba(249, 115, 22, 0.5), rgba(249, 115, 22, 0))';
      }
    });

    // Process badges in the content
    const badgeElements = articleWrapper.querySelectorAll('span[class^="badge-"]');
    badgeElements.forEach(badgeElement => {
      if (badgeElement instanceof HTMLElement) {
        // Add the base badge class if it's not there
        if (!badgeElement.classList.contains('badge')) {
          badgeElement.classList.add('badge');
        }
      }
    });

    // Create CTA sections from special divs with class "cta"
    const ctaDivs = articleWrapper.querySelectorAll('div.cta');
    ctaDivs.forEach(ctaDiv => {
      if (ctaDiv instanceof HTMLElement) {
        // Transform the div into a proper CTA
        ctaDiv.className = 'article-cta';
        
        // Process the CTA content
        const title = ctaDiv.querySelector('h3, h4');
        if (title) {
          title.className = 'article-cta-title';
        }
        
        const paragraphs = ctaDiv.querySelectorAll('p');
        paragraphs.forEach((p, index) => {
          if (index === paragraphs.length - 1 && p.querySelector('a')) {
            // Last paragraph with a link - transform to button
            const link = p.querySelector('a');
            if (link) {
              link.className = 'article-cta-button';
              // Only add arrow if it doesn't already have one
              if (!link.innerHTML.includes('→')) {
                link.innerHTML = link.innerHTML + ' →';
              }
            }
          } else {
            // Regular paragraph - add description class
            p.className = 'article-cta-description';
          }
        });
      }
    });

    // Create keywords section at the end of the article
    const article = articleWrapper.closest('article');
    if (article) {
      // Get tags from meta tags if available
      const metaTags = document.querySelector('meta[name="keywords"]');
      let keywords: string[] = [];
      
      if (metaTags && metaTags.getAttribute('content')) {
        keywords = metaTags.getAttribute('content')?.split(',').map(k => k.trim()) || [];
      }
      
      // If no meta tags, try to get from article tags in frontmatter (via data attributes)
      if (keywords.length === 0) {
        const articleElement = article.closest('[data-tags]');
        if (articleElement && articleElement.getAttribute('data-tags')) {
          keywords = articleElement.getAttribute('data-tags')?.split(',').map(k => k.trim()) || [];
        }
      }
      
      // If we have keywords, create the keywords section
      if (keywords.length > 0) {
        // Check if keywords section already exists
        if (!article.querySelector('.article-keywords')) {
          const keywordsSection = document.createElement('div');
          keywordsSection.className = 'article-keywords';
          
          const keywordsTitle = document.createElement('div');
          keywordsTitle.className = 'article-keywords-title';
          keywordsTitle.textContent = 'Keywords';
          keywordsSection.appendChild(keywordsTitle);
          
          const keywordsList = document.createElement('div');
          keywordsList.className = 'article-keywords-list';
          
          // Create badges for each keyword
          keywords.forEach(keyword => {
            const badge = document.createElement('span');
            badge.className = 'badge';
            badge.textContent = keyword;
            keywordsList.appendChild(badge);
          });
          
          keywordsSection.appendChild(keywordsList);
          article.appendChild(keywordsSection);
        }
      }
    }
  }, []);

  return <div ref={articleRef} />;
};

export default ArticleContentEnhancer;
