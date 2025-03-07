import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Tag, Clock, User } from 'lucide-react';
import { getArticleBySlug, getAllArticlesMetadata } from '@/lib/articles';
import { Metadata, ResolvingMetadata } from 'next';

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

// Generate metadata for each article page
export async function generateMetadata(
  { params }: { params: { slug: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = params;
  const article = await getArticleBySlug(slug);
  
  // Use default metadata if article not found
  if (!article) {
    return {
      title: 'Article Not Found',
      description: 'The requested article could not be found.',
    };
  }
  
  // Get parent metadata (for site-wide defaults)
  const previousImages = (await parent).openGraph?.images || [];
  
  return {
    title: article.title,
    description: article.description,
    keywords: article.keywords,
    authors: article.author ? [{ name: article.author }] : undefined,
    openGraph: {
      title: article.title,
      description: article.description,
      type: 'article',
      publishedTime: article.date,
      modifiedTime: article.lastModified,
      authors: article.author ? [article.author] : undefined,
      images: article.image ? [article.image, ...previousImages] : previousImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
      images: article.image ? [article.image] : undefined,
    },
  };
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
          <div className="flex flex-wrap items-center gap-4">
            {article.author && (
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <User className="w-4 h-4 mr-1" />
                <span className="text-sm">{article.author}</span>
              </div>
            )}
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <Calendar className="w-4 h-4 mr-1" />
              <span className="text-sm">{article.date}</span>
            </div>
            {article.readingTime && (
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4 mr-1" />
                <span className="text-sm">{article.readingTime}</span>
              </div>
            )}
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
        
        {article.keywords && article.keywords.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Related Topics</h3>
            <div className="flex flex-wrap gap-2">
              {article.keywords.map((keyword, index) => (
                <span 
                  key={index} 
                  className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
