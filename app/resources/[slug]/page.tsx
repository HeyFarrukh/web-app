import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, Tag, Clock, User, Share2, Bookmark } from 'lucide-react';
import { getArticleBySlug, getAllArticlesMetadata } from '@/lib/articles';
import { Metadata, ResolvingMetadata } from 'next';
import '@/app/styles/markdown-enhanced.css';

// Company logos mapping
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
  }
];

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
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Article not found</h1>
        <Link href="/resources" className="text-orange-500 hover:text-orange-600 flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Resources
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <article className="relative">
        {/* Hero Section */}
        {article.image && (
          <div className="relative h-[60vh] w-full">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/90 z-10" />
            <Image
              src={article.image}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute bottom-0 left-0 right-0 z-20 p-8">
              <div className="max-w-4xl mx-auto">
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <span className="px-3 py-1 text-sm font-medium text-orange-400 bg-orange-500/10 backdrop-blur-sm rounded-full">
                    {article.category}
                  </span>
                  {article.readingTime && (
                    <span className="px-3 py-1 text-sm font-medium text-gray-300 bg-gray-700/30 backdrop-blur-sm rounded-full flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {article.readingTime}
                    </span>
                  )}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{article.title}</h1>
                <p className="text-xl text-gray-200 mb-6">{article.description}</p>
                <div className="flex items-center gap-6">
                  {article.author && (
                    <div className="flex items-center text-gray-300">
                      {article.authorImage ? (
                        <div className="relative w-6 h-6 mr-2">
                          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 blur-[1px]" />
                          <Image
                            src={article.authorImage}
                            alt={article.author}
                            width={24}
                            height={24}
                            className="relative rounded-full object-cover border-2 border-white dark:border-gray-800"
                          />
                        </div>
                      ) : (
                        <User className="w-5 h-5 mr-2" />
                      )}
                      <span>{article.author}</span>
                    </div>
                  )}
                  <div className="flex items-center text-gray-300">
                    <Calendar className="w-5 h-5 mr-2" />
                    <span>{article.date}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Article Content */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Back to Resources Link and Share buttons - added at the top of the article content */}
          <div className="flex items-center justify-between mb-8">
            <Link 
              href="/resources" 
              className="text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 flex items-center group transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" />
              Back to Resources
            </Link>
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Bookmark className="w-5 h-5" />
              </button>
            </div>
          </div>

          {!article.image && (
            <div className="mb-8">
              <span className="inline-block px-3 py-1 text-sm font-medium text-orange-500 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-300 rounded-full mb-4">
                {article.category}
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">{article.title}</h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">{article.description}</p>
              <div className="flex flex-wrap items-center gap-6 text-gray-600 dark:text-gray-400">
                {article.author && (
                  <div className="flex items-center">
                    {article.authorImage ? (
                      <div className="relative w-6 h-6 mr-2">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 blur-[1px]" />
                        <Image
                          src={article.authorImage}
                          alt={article.author}
                          width={24}
                          height={24}
                          className="relative rounded-full object-cover border-2 border-white dark:border-gray-800"
                        />
                      </div>
                    ) : (
                      <User className="w-5 h-5 mr-2" />
                    )}
                    <span>{article.author}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  <span>{article.date}</span>
                </div>
                {article.readingTime && (
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    <span>{article.readingTime}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Partnership Logos Section */}
          {article.partnerships && article.partnerships.length > 0 && (
            <div className="mb-8 py-6 border-y border-gray-100 dark:border-gray-700">
              <p className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 mb-6">
                Written in collaboration with{' '}
                {(() => {
                  const allCollaborators = article.partnerships.flatMap(p => p.collaborators);
                  const hasApprentices = allCollaborators.includes('apprentice');
                  const hasRecruiters = allCollaborators.includes('recruiter');
                  
                  if (hasApprentices && hasRecruiters) {
                    return 'apprentices and recruiters at';
                  } else if (hasApprentices) {
                    return 'apprentices at';
                  } else if (hasRecruiters) {
                    return 'recruiters at';
                  }
                  return '';
                })()}
              </p>
              <div className="flex justify-center items-center gap-12 flex-wrap">
                {article.partnerships.map((partnership) => {
                  const logo = partnerLogos.find(l => l.name === partnership.company);
                  if (!logo) return null;
                  return (
                    <div key={logo.name} className="flex items-center justify-center">
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
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 md:p-12">
            <article className="prose prose-lg max-w-none dark:prose-invert article-content
              prose-headings:text-gray-900 dark:prose-headings:text-white 
              prose-a:text-orange-500 hover:prose-a:text-orange-600
              prose-img:rounded-xl prose-img:shadow-md
              prose-blockquote:border-orange-500 prose-blockquote:bg-orange-50 dark:prose-blockquote:bg-orange-900/10 prose-blockquote:rounded-r-lg prose-blockquote:py-2 prose-blockquote:px-6
              prose-code:text-orange-500 dark:prose-code:text-orange-400 prose-code:bg-orange-50 dark:prose-code:bg-orange-900/10 prose-code:rounded prose-code:px-1
              prose-pre:bg-gray-50 dark:prose-pre:bg-gray-700/50 prose-pre:border prose-pre:border-gray-200 dark:prose-pre:border-gray-600 
              prose-pre:rounded-xl prose-pre:shadow-sm">
              <div dangerouslySetInnerHTML={{ __html: article.contentHtml }} />
            </article>
          </div>
          
          {/* Keywords section */}
          {article.keywords && article.keywords.length > 0 && (
            <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Related Topics</h3>
              <div className="flex flex-wrap gap-2">
                {article.keywords.map((keyword, index) => (
                  <span 
                    key={index} 
                    className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full transition-colors cursor-pointer"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Back to Resources and Share buttons - added at the bottom of the article */}
          <div className="mt-12 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-8">
            <Link 
              href="/resources" 
              className="px-5 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-orange-100 dark:hover:bg-orange-900/20 text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 rounded-full flex items-center group transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" />
              Back to Resources
            </Link>
            <div className="flex items-center space-x-3">
              <button className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-orange-100 dark:hover:bg-orange-900/20 text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 rounded-full transition-colors">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </button>
              <button className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-orange-100 dark:hover:bg-orange-900/20 text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 rounded-full transition-colors">
                <Bookmark className="w-4 h-4 mr-2" />
                Save
              </button>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}