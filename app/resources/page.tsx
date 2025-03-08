import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getAllArticlesMetadata } from '@/lib/articles';
import { Metadata } from 'next';
import { Star, Clock, ChevronRight, Search } from 'lucide-react';

// This makes the page static at build time for optimal performance and SEO
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

// Generate metadata for the resources page
export const metadata: Metadata = {
  title: 'Resources',
  description: 'Discover helpful guides, articles, and resources to support your apprenticeship journey.',
  keywords: ['apprenticeship', 'resources', 'guides', 'career advice', 'skills development'],
  openGraph: {
    title: 'Resources | ApprenticeWatch',
    description: 'Discover helpful guides, articles, and resources to support your apprenticeship journey.',
    type: 'website',
  },
};

// Article card component to avoid duplication
const ArticleCard = ({ article }: { article: ReturnType<typeof getAllArticlesMetadata>[0] }) => (
  <Link 
    key={article.id} 
    href={`/resources/${article.slug}`}
    className="group"
  >
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg overflow-hidden transition-all duration-300 border border-gray-100 dark:border-gray-700">
      <div className="relative h-48 w-full">
        <Image
          src={article.image || "/images/default-article.jpg"}
          alt={article.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {article.featured && (
          <div className="absolute top-3 right-3 bg-orange-500 text-white rounded-full p-1.5 shadow-md">
            <Star className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="inline-block px-3 py-1 text-sm font-medium text-orange-700 bg-orange-50 dark:bg-orange-900/30 dark:text-orange-300 rounded-full">
            {article.category}
          </span>
          <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded-full">
            <Clock className="w-3.5 h-3.5 mr-1" />
            {article.readingTime || '5 min read'}
          </span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-orange-500 transition-colors line-clamp-2">
          {article.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
          {article.description}
        </p>
        <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {article.date}
          </span>
          <span className="inline-flex items-center text-orange-500 font-medium group-hover:translate-x-1 transition-transform">
            Read more
            <ChevronRight className="w-4 h-4 ml-1" />
          </span>
        </div>
      </div>
    </div>
  </Link>
);

// Company logos for credibility section
const partnerLogos = [
  { 
    name: 'Accenture', 
    url: '/assets/logos/accenture.svg',
    width: 120
  },
  { 
    name: 'Digital Catapult', 
    url: '/assets/logos/Digital_Catapult.svg',
    width: 160
  },
  { 
    name: 'HSBC', 
    url: '/assets/logos/HSBC.svg',
    width: 120
  },
  // { 
  //   name: 'Ada', 
  //   url: '/assets/logos/ada.svg',
  //   width: 120
  // }
];

/**
 * Renders the static resources page for the apprenticeship platform.
 *
 * This component retrieves article metadata and separates the articles into featured and latest groups.
 * It then conditionally renders a featured resources section (if any featured articles exist) and a
 * latest resources section. The page also includes a hero section with a title and description, along
 * with a credibility section displaying partner logos.
 *
 * @returns A React element representing the complete resources page.
 */
export default function ResourcesPage() {
  const allArticles = getAllArticlesMetadata();
  
  // Separate featured and non-featured articles
  const featuredArticles = allArticles.filter(article => article.featured);
  const regularArticles = allArticles.filter(article => !article.featured);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative px-4 py-24 text-center bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">Resources Hub</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">Discover expert guides and insights to excel in your apprenticeship journey</p>
          
          {/* Search Bar DO NOT REMOVE, WILL BE IMPLEMENTED LATER WHEN MORE ARTICLES ARE ADDED */}
          {/* <div className="relative max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search articles..."
                className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-shadow"
              />
            </div>
          </div> */}
        </div>
      </section>

      {/* Credibility Section */}
      <section className="bg-gray-50 dark:bg-gray-900 py-8 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 mb-6">
             Resources developed in collaboration with {/*teachers,*/} recruiters and apprentices at 
          </p>
          <div className="flex justify-center items-center gap-12 flex-wrap">
            {partnerLogos.map((logo) => (
              <div
                key={logo.name}
                className="flex items-center justify-center"
              >
                <img
                  src={logo.url}
                  alt={`${logo.name} logo`}
                  style={{ width: logo.width }}
                  className={`h-12 object-contain transition-all duration-300 ${
                    logo.name === 'Digital Catapult' 
                      ? 'brightness-0' 
                      : 'grayscale'
                  } hover:grayscale-0 dark:invert`}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Content Container */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Featured Articles Section */}
        {featuredArticles.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center mb-8">
              <Star className="w-6 h-6 text-orange-500 mr-2" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Featured Resources</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        )}

        {/* Latest Articles Section */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Latest Resources</h2>
          
          {regularArticles.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-400">No articles found. Check back soon for new content!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
