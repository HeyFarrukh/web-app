import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';
import { getArticleBySlug, getAllArticlesMetadata } from '@/lib/articles';

// This makes the page static at build time for optimal performance and SEO
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

// Generate static paths for all articles at build time
export async function generateStaticParams() {
  const articles = getAllArticlesMetadata();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Article not found</h1>
        <Link href="/resources" className="text-orange-500 hover:text-orange-600 flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Resources
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section 
        className="px-4 py-24 text-center bg-gradient-to-r from-amber-400 to-orange-500"
      >
        <h1 className="text-4xl font-bold text-white mb-4">{article.title}</h1>
        <p className="text-xl text-white">{article.description}</p>
      </section>

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8 flex flex-wrap items-center justify-between">
          <Link 
            href="/resources" 
            className="text-orange-500 hover:text-orange-600 flex items-center mb-4 sm:mb-0"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Resources
          </Link>
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <Calendar className="w-4 h-4 mr-1" />
              <span className="text-sm">{article.date}</span>
            </div>
            <div className="flex items-center">
              <Tag className="w-4 h-4 mr-1 text-orange-500" />
              <span className="text-sm font-medium text-orange-500 bg-orange-100 dark:bg-orange-900 dark:text-orange-300 px-2 py-1 rounded-full">
                {article.category}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <article className="prose prose-orange max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white prose-a:text-orange-500 hover:prose-a:text-orange-600">
            <div dangerouslySetInnerHTML={{ __html: article.contentHtml }} />
          </article>
        </div>
      </div>
    </div>
  );
}
