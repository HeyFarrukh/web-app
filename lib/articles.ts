// This file should only be imported by server components
import 'server-only';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

// Get the articles directory path
const articlesDirectory = path.join(process.cwd(), 'content/articles');

export interface ArticleMetadata {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  slug: string;
  image?: string;
  author?: string;
  keywords?: string[];
  lastModified?: string;
  readingTime?: string;
}

export interface Article extends ArticleMetadata {
  content: string;
  contentHtml: string;
}

// Function to get all article slugs
export function getArticleSlugs() {
  try {
    if (!fs.existsSync(articlesDirectory)) {
      return [];
    }
    return fs.readdirSync(articlesDirectory)
      .filter(file => file.endsWith('.md') || file.endsWith('.mdx'))
      .map(file => file.replace(/\.mdx?$/, ''));
  } catch (error) {
    console.error('Error reading article slugs:', error);
    return [];
  }
}

// Function to get article metadata by slug
export function getArticleMetadata(slug: string): ArticleMetadata | null {
  try {
    const mdPath = path.join(articlesDirectory, `${slug}.md`);
    const mdxPath = path.join(articlesDirectory, `${slug}.mdx`);
    
    if (!fs.existsSync(mdPath) && !fs.existsSync(mdxPath)) {
      return null;
    }
    
    const filePath = fs.existsSync(mdPath) ? mdPath : mdxPath;
    const fileContents = fs.readFileSync(filePath, 'utf8');
    
    // Use gray-matter to parse the post metadata section
    const { data } = matter(fileContents);
    
    // Validate required fields
    if (!data.title || !data.description || !data.category || !data.date) {
      console.error(`Missing required metadata in article: ${slug}`);
      return null;
    }
    
    // Create article metadata object
    return {
      id: slug,
      slug: slug,
      title: data.title,
      description: data.description,
      category: data.category,
      date: data.date,
      image: data.image || null,
      author: data.author || null,
      keywords: data.keywords || null,
      lastModified: data.lastModified || null,
      readingTime: data.readingTime || null
    };
  } catch (error) {
    console.error(`Error reading article metadata ${slug}:`, error);
    return null;
  }
}

// Function to get all articles metadata
export function getAllArticlesMetadata(): ArticleMetadata[] {
  const slugs = getArticleSlugs();
  const articles = slugs
    .map(slug => getArticleMetadata(slug))
    .filter((article): article is ArticleMetadata => article !== null)
    // Sort articles by date in descending order
    .sort((a, b) => (new Date(b.date).getTime() - new Date(a.date).getTime()));
  
  return articles;
}

// Function to get article by slug with content
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const mdPath = path.join(articlesDirectory, `${slug}.md`);
    const mdxPath = path.join(articlesDirectory, `${slug}.mdx`);
    
    if (!fs.existsSync(mdPath) && !fs.existsSync(mdxPath)) {
      return null;
    }
    
    const filePath = fs.existsSync(mdPath) ? mdPath : mdxPath;
    const fileContents = fs.readFileSync(filePath, 'utf8');
    
    // Use gray-matter to parse the post metadata section
    const { data, content } = matter(fileContents);
    
    // Validate required fields
    if (!data.title || !data.description || !data.category || !data.date) {
      console.error(`Missing required metadata in article: ${slug}`);
      return null;
    }
    
    // Use remark to convert markdown into HTML string
    const processedContent = await remark()
      .use(html)
      .process(content);
    
    const contentHtml = processedContent.toString();
    
    // Create article object
    return {
      id: slug,
      slug: slug,
      title: data.title,
      description: data.description,
      category: data.category,
      date: data.date,
      image: data.image || null,
      author: data.author || null,
      keywords: data.keywords || null,
      lastModified: data.lastModified || null,
      readingTime: data.readingTime || null,
      content: content,
      contentHtml: contentHtml
    };
  } catch (error) {
    console.error(`Error reading article ${slug}:`, error);
    return null;
  }
}
