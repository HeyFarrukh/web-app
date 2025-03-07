'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getAllArticles, ArticleMetadata } from '@/utils/markdown';

export default function ResourcesPage() {
  const [articles, setArticles] = useState<ArticleMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load articles on the client side
    const loadArticles = async () => {
      try {
        const articleData = await getAllArticles();
        setArticles(articleData);
      } catch (error) {
        console.error('Error loading articles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadArticles();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="py-12 px-4 bg-gradient-to-r from-amber-400 to-orange-500">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white mb-4">ApprenticeWatch Resources</h1>
          <p className="text-xl text-white max-w-3xl mx-auto">
            Discover articles, guides, and resources to help you succeed in your apprenticeship journey.
          </p>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          ) : articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map(article => (
                <motion.div 
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  whileHover={{ y: -5 }}
                >
                  <Link href={`/resources/${article.slug}`} className="block">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg">
                      <div className="h-48 bg-gray-200 dark:bg-gray-700 relative">
                        {article.image ? (
                          <div 
                            className="absolute inset-0 bg-cover bg-center" 
                            style={{ backgroundImage: `url(${article.image})` }}
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-500 dark:text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <div className="flex items-center mb-2">
                          <span className="text-xs font-medium text-orange-500 bg-orange-100 dark:bg-orange-900 dark:text-orange-300 px-2 py-1 rounded-full">
                            {article.category}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{article.date}</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-orange-500 transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                          {article.description}
                        </p>
                        <div className="flex items-center text-orange-500 font-medium">
                          Read More
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">No articles found. Check back soon for new content!</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-12 px-4 bg-gray-100 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Subscribe to Our Newsletter</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Stay updated with the latest apprenticeship opportunities, career advice, and resources.
          </p>
          <form className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
              <button 
                type="submit" 
                className="px-6 py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              >
                Subscribe
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
