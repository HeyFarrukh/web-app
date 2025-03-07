'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';
import { getArticleBySlug, Article } from '@/utils/markdown';

interface ArticlePageProps {
  params: {
    slug: string;
  };
}

export default function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = params;
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadArticle = async () => {
      try {
        setIsLoading(true);
        const articleData = await getArticleBySlug(slug);
        
        if (!articleData) {
          setError('Article not found');
          setIsLoading(false);
          return;
        }
        
        setArticle(articleData);
      } catch (err) {
        console.error('Error loading article:', err);
        setError('Failed to load article');
      } finally {
        setIsLoading(false);
      }
    };

    loadArticle();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">{error || 'Article not found'}</h1>
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
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="px-4 py-24 text-center bg-gradient-to-r from-amber-400 to-orange-500"
      >
        <h1 className="text-4xl font-bold text-white mb-4">{article.title}</h1>
        <p className="text-xl text-white">{article.description}</p>
      </motion.section>

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

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8"
        >
          <article className="prose prose-orange max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white prose-a:text-orange-500 hover:prose-a:text-orange-600">
            <div dangerouslySetInnerHTML={{ __html: article.contentHtml || '' }} />
          </article>
        </motion.div>
      </div>
    </div>
  );
}
