import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getAllArticlesMetadata } from '@/lib/articles';

// This makes the page static at build time for optimal performance and SEO
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

export default function ResourcesPage() {
  const articles = getAllArticlesMetadata();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="px-4 py-24 text-center bg-gradient-to-r from-amber-400 to-orange-500">
        <h1 className="text-4xl font-bold text-white mb-4">Resources</h1>
        <p className="text-xl text-white">Helpful guides and articles to support your apprenticeship journey</p>
      </section>

      {/* Articles Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Latest Articles</h2>
        
        {articles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No articles found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article, index) => (
              <Link 
                key={article.id} 
                href={`/resources/${article.slug}`}
                className="group"
              >
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-transform duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
                  <div className="relative h-48 w-full">
                    <Image
                      src={article.image || "/images/default-article.jpg"}
                      alt={article.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <span className="inline-block px-3 py-1 text-sm font-semibold text-orange-500 bg-orange-100 dark:bg-orange-900 dark:text-orange-300 rounded-full mb-2">
                      {article.category}
                    </span>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2 group-hover:text-orange-500 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {article.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-500">
                        {article.date}
                      </span>
                      <span className="text-orange-500 font-medium group-hover:underline">
                        Read more
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
