// This file should only be imported by server components
import 'server-only';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';
import remarkEmoji from 'remark-emoji';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import { formatDateForSEO, formatDateForDisplay } from './utils/dateFormat';
import { calculateReadingTime } from './utils/readingTime';

// Get the articles directory path
const articlesDirectory = path.join(process.cwd(), 'content/articles');

// Helper to log errors in production
function logError(message: string, error: any) {
  console.error(`[Articles Service Error] ${message}:`, error);
  // You could add more sophisticated logging here if needed
}

// Function to validate and format ISO date
function validateAndFormatDate(dateStr: string | undefined): string {
  if (!dateStr) {
    return new Date().toISOString();
  }

  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return new Date().toISOString();
    }
    return date.toISOString();
  } catch {
    return new Date().toISOString();
  }
}

// Function to get file dates
function getFileDates(filePath: string) {
  const stats = fs.statSync(filePath);
  const now = new Date();
  
  // Validate dates to ensure they're valid
  const birthtime = stats.birthtime && stats.birthtime.getTime() > 0 ? stats.birthtime : now;
  const mtime = stats.mtime && stats.mtime.getTime() > 0 ? stats.mtime : now;
  
  return {
    createdAt: birthtime.toISOString(),
    modifiedAt: mtime.toISOString()
  };
}

export interface ArticleMetadata {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  _rawDate: string;
  slug: string;
  image?: string | undefined;
  author?: string | undefined;
  authorImage?: string | undefined;
  keywords?: string[] | undefined;
  lastModified?: string | undefined;
  _rawLastModified?: string | undefined;
  readingTime?: string | undefined;
  featured?: boolean | undefined;
  partnerships?: Array<{
    company: string;
    collaborators: Array<'apprentice' | 'recruiter'>;
  }> | undefined;
}

export interface Article extends ArticleMetadata {
  content: string;
  contentHtml: string;
}

// Custom processor options
const processorOptions = {
  highlight: {
    ignoreMissing: true,
    subset: ['javascript', 'typescript', 'jsx', 'tsx', 'html', 'css', 'json', 'python'],
  },
  emoji: {
    emoticon: true,
  },
};

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
    logError('Error reading article slugs:', error);
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
    
    // Get file dates
    const fileDates = getFileDates(filePath);
    
    // Ensure date is in ISO format for both display and SEO
    const rawDate = validateAndFormatDate(data.date);
    const rawLastModified = validateAndFormatDate(data.lastModified || fileDates.modifiedAt);
    
    // Validate required fields
    if (!data.title || !data.description || !data.category) {
      logError(`Missing required metadata in article: ${slug}`, null);
      return null;
    }
    
    // Create article metadata object
    return {
      id: slug,
      title: data.title,
      description: data.description,
      category: data.category,
      date: formatDateForDisplay(rawDate),
      _rawDate: rawDate,
      slug: slug,
      image: data.image ?? undefined,
      author: data.author ?? undefined,
      authorImage: data.authorImage ?? undefined,
      keywords: data.keywords ?? undefined,
      lastModified: formatDateForDisplay(rawLastModified),
      _rawLastModified: rawLastModified,
      readingTime: calculateReadingTime(fileContents),
      featured: data.featured ?? undefined,
      partnerships: data.partnerships ?? undefined
    };
  } catch (error) {
    logError(`Error reading article metadata ${slug}:`, error);
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
    .sort((a, b) => (new Date(b._rawDate).getTime() - new Date(a._rawDate).getTime()));
  
  return articles;
}

// Function to process custom markdown syntax 
function processCustomMarkdown(content: string): string {
  // Process text highlights (==text== to <mark>text</mark>)
  content = content.replace(/==([^=]+)==/g, '<mark class="highlight-orange">$1</mark>');
  
  // Process PDF embeds using custom syntax: {{pdf:path/to/file.pdf}}
  content = content.replace(/{{pdf:([^}]+)}}/g, 
    '<div class="pdf-embed"><iframe src="/api/pdf-viewer?file=$1" width="100%" height="500px" frameborder="0"></iframe></div>');
  
  // Process Font Awesome icons using custom syntax: :icon[fa-solid fa-check]
  content = content.replace(/:icon\[fa-([^\]]+)\]/g, 
    '<span class="icon"><i class="fa-$1"></i></span>');

  // Process Lucide icons using custom syntax: :icon[lucide-check]
  // Using a span with a class that we can target with CSS or JavaScript
  content = content.replace(/:icon\[lucide-([^\]]+)\]/g, 
    '<span class="lucide-icon lucide-$1"></span>');
  
  return content;
}

// Enhanced processor for article content
async function processMarkdownContent(content: string): Promise<string> {
  // First, process our custom markdown syntax
  content = processCustomMarkdown(content);
  
  // Then use the unified/remark/rehype pipeline for standard and extended markdown
  const processedContent = await unified()
    .use(remarkParse)
    .use(remarkGfm) // GitHub Flavored Markdown: tables, strikethrough, etc.
    .use(remarkEmoji, processorOptions.emoji) // Convert emoji shortcodes to emojis
    .use(remarkRehype, { allowDangerousHtml: true }) // Convert to HTML (allowing custom HTML)
    .use(rehypeRaw) // Parse custom HTML in the markdown
    .use(rehypeHighlight, processorOptions.highlight) // Syntax highlighting with highlight.js
    .use(rehypeSlug) // Add IDs to headings
    // Removing rehypeAutolinkHeadings to get rid of the heading anchor links
    .use(rehypeStringify) // Convert to HTML string
    .process(content);

  return processedContent.toString();
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
    
    // Get file dates
    const fileDates = getFileDates(filePath);
    
    // Ensure date is in ISO format for both display and SEO
    const rawDate = validateAndFormatDate(data.date);
    const rawLastModified = validateAndFormatDate(data.lastModified || fileDates.modifiedAt);
    
    // Validate required fields
    if (!data.title || !data.description || !data.category) {
      logError(`Missing required metadata in article: ${slug}`, null);
      return null;
    }
    
    // Use enhanced markdown processor
    const contentHtml = await processMarkdownContent(content);
    
    // Create article object
    return {
      id: slug,
      slug: slug,
      title: data.title,
      description: data.description,
      category: data.category,
      date: formatDateForDisplay(rawDate),
      _rawDate: rawDate,
      image: data.image || undefined,
      author: data.author || undefined,
      authorImage: data.authorImage || undefined,
      keywords: data.keywords || undefined,
      lastModified: formatDateForDisplay(rawLastModified),
      _rawLastModified: rawLastModified,
      readingTime: calculateReadingTime(content),
      featured: data.featured || undefined,
      partnerships: data.partnerships || undefined,
      content: content,
      contentHtml: contentHtml
    };
  } catch (error) {
    logError(`Error reading article ${slug}:`, error);
    return null;
  }
}