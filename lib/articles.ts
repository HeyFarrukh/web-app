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
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { formatDateForSEO, formatDateForDisplay } from './utils/dateFormat';
import { calculateReadingTime } from './utils/readingTime';

// Get the articles directory path
const articlesDirectory = path.join(process.cwd(), 'content/articles');

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
    
    // Get file dates
    const { createdAt, modifiedAt } = getFileDates(filePath);
    
    // Validate required fields
    if (!data.title || !data.description || !data.category) {
      console.error(`Missing required metadata in article: ${slug}`);
      return null;
    }
    
    // Use current date if no date is provided in frontmatter
    const currentDate = new Date().toISOString();
    const articleDate = data.date ? new Date(data.date).toISOString() : createdAt;
    const lastModifiedDate = data.lastModified ? new Date(data.lastModified).toISOString() : modifiedAt;
    
    // Create article metadata object
    return {
      id: slug,
      slug: slug,
      title: data.title,
      description: data.description,
      category: data.category,
      date: formatDateForDisplay(articleDate),
      _rawDate: formatDateForSEO(articleDate),
      image: data.image ?? undefined,
      author: data.author ?? undefined,
      authorImage: data.authorImage ?? undefined,
      keywords: data.keywords ?? undefined,
      lastModified: formatDateForDisplay(lastModifiedDate),
      _rawLastModified: formatDateForSEO(lastModifiedDate),
      readingTime: calculateReadingTime(fileContents),
      featured: data.featured ?? undefined,
      partnerships: data.partnerships ?? undefined
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
  content = content.replace(/:icon\[lucide-([^\]]+)\]/g, 
    '<span class="icon"><i data-lucide="$1"></i></span>');
  
  // Process chart embeds using custom syntax: 
  // {{chart:type:title:height:width:data}}
  // Example: {{chart:bar:Monthly Sales:400:600:{"labels":["Jan","Feb","Mar"],"datasets":[{"label":"Sales","data":[30,50,20]}]}}}
  content = content.replace(/{{chart:([^:]+):([^:]*):([^:]*):([^:]*):([^}]+)}}/g, (match, type, title, height, width, data) => {
    // Sanitize and validate inputs
    const chartType = ['bar', 'line', 'pie', 'doughnut'].includes(type) ? type : 'bar';
    const chartTitle = title || '';
    const chartHeight = parseInt(height) || 300;
    const chartWidth = parseInt(width) || 600;
    
    // Escape the data JSON to prevent issues with quotes
    const escapedData = data.replace(/"/g, '&quot;');
    
    // Create a special HTML comment that won't be processed by the markdown parser
    return `<!-- CHART_START -->
<div class="chart-wrapper" data-chart-type="${chartType}" data-chart-title="${chartTitle}" data-chart-height="${chartHeight}" data-chart-width="${chartWidth}" data-chart-data="${escapedData}"></div>
<!-- CHART_END -->`;
  });
  
  return content;
}

// Enhanced processor for article content
async function processMarkdownContent(content: string): Promise<string> {
  // First, process our custom markdown syntax (except charts)
  let processedContent = processCustomMarkdown(content);
  
  // Then use the unified/remark/rehype pipeline for standard and extended markdown
  const htmlContent = await unified()
    .use(remarkParse)
    .use(remarkGfm) // GitHub Flavored Markdown: tables, strikethrough, etc.
    .use(remarkEmoji, processorOptions.emoji) // Convert emoji shortcodes to emojis
    .use(remarkRehype, { allowDangerousHtml: true }) // Convert to HTML (allowing custom HTML)
    .use(rehypeRaw, { passThrough: ['div', 'span'] }) // Parse custom HTML in the markdown with specific elements passed through
    .use(rehypeHighlight, processorOptions.highlight) // Syntax highlighting with highlight.js
    .use(rehypeSlug) // Add IDs to headings
    .use(rehypeAutolinkHeadings) // Add links to headings
    .use(rehypeStringify, { allowDangerousHtml: true }) // Convert to HTML string with dangerous HTML allowed
    .process(processedContent);

  return htmlContent.toString();
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
    const { createdAt, modifiedAt } = getFileDates(filePath);
    
    // Validate required fields
    if (!data.title || !data.description || !data.category) {
      console.error(`Missing required metadata in article: ${slug}`);
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
      date: formatDateForDisplay(data.date || createdAt),
      _rawDate: formatDateForSEO(data.date || createdAt),
      image: data.image || undefined,
      author: data.author || undefined,
      authorImage: data.authorImage || undefined,
      keywords: data.keywords || undefined,
      lastModified: formatDateForDisplay(modifiedAt),
      _rawLastModified: formatDateForSEO(modifiedAt),
      readingTime: calculateReadingTime(content),
      featured: data.featured || undefined,
      partnerships: data.partnerships || undefined,
      content: content,
      contentHtml: contentHtml
    };
  } catch (error) {
    console.error(`Error reading article ${slug}:`, error);
    return null;
  }
}