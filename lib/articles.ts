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

/**
 * Retrieves the creation and modification dates of a file.
 *
 * This function synchronously obtains file statistics for the specified path and returns an object with the file's creation date (birthtime) and last modification date (mtime) as ISO 8601 strings.
 * If either timestamp is unavailable, the current date and time is used for both values.
 *
 * @param filePath - The path to the file.
 * @returns An object containing "createdAt" and "modifiedAt" timestamps.
 */
function getFileDates(filePath: string) {
  const stats = fs.statSync(filePath);
  const now = new Date();
  
  // For new files, use current time as both dates
  if (!stats.birthtime || !stats.mtime) {
    return {
      createdAt: now.toISOString(),
      modifiedAt: now.toISOString()
    };
  }

  return {
    createdAt: stats.birthtime.toISOString(),
    modifiedAt: stats.mtime.toISOString()
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

/**
 * Retrieves a list of article slugs from the articles directory.
 *
 * This function reads the contents of the designated articles directory and filters
 * for files with markdown extensions (.md or .mdx). It returns the file names with the
 * markdown extension removed. If the directory does not exist or an error occurs,
 * an empty array is returned.
 *
 * @returns An array of strings representing the article slugs.
 */
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

/**
 * Retrieves the metadata for an article identified by its slug.
 *
 * This function attempts to locate a markdown (.md) or MDX (.mdx) file in the articles directory corresponding
 * to the provided slug. It reads the file contents, extracts front matter using gray-matter, obtains file creation and
 * modification dates, and formats these dates for display and SEO. The function also calculates the reading time and 
 * validates that the required fields (title, description, and category) are present. If the file does not exist,
 * lacks required metadata, or an error occurs during processing, the function returns null.
 *
 * @param slug - The unique identifier for the article, used to locate its markdown file.
 * @returns An ArticleMetadata object if the article exists and contains valid metadata; otherwise, null.
 */
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
    
    // Create article metadata object
    return {
      id: slug,
      slug: slug,
      title: data.title,
      description: data.description,
      category: data.category,
      date: formatDateForDisplay(data.date || createdAt),
      _rawDate: formatDateForSEO(data.date || createdAt),
      image: data.image ?? undefined,
      author: data.author ?? undefined,
      authorImage: data.authorImage ?? undefined,
      keywords: data.keywords ?? undefined,
      lastModified: formatDateForDisplay(modifiedAt),
      _rawLastModified: formatDateForSEO(modifiedAt),
      readingTime: calculateReadingTime(fileContents),
      featured: data.featured ?? undefined,
      partnerships: data.partnerships ?? undefined
    };
  } catch (error) {
    console.error(`Error reading article metadata ${slug}:`, error);
    return null;
  }
}

/**
 * Retrieves metadata for all articles, sorted by descending date.
 *
 * The function collects article slugs from the articles directory, converts each slug into its
 * corresponding metadata, filters out any missing or invalid entries, and sorts the results so that
 * the most recent articles appear first.
 *
 * @returns An array of article metadata objects.
 */
export function getAllArticlesMetadata(): ArticleMetadata[] {
  const slugs = getArticleSlugs();
  const articles = slugs
    .map(slug => getArticleMetadata(slug))
    .filter((article): article is ArticleMetadata => article !== null)
    // Sort articles by date in descending order
    .sort((a, b) => (new Date(b._rawDate).getTime() - new Date(a._rawDate).getTime()));
  
  return articles;
}

/**
 * Processes custom markdown syntax and converts them into corresponding HTML elements.
 *
 * This function replaces:
 * - Text enclosed in double equal signs (==text==) with a `<mark>` element decorated for highlighting.
 * - PDF embed directives formatted as `{{pdf:filepath}}` with a `<div>` containing an `<iframe>` for embedded PDF viewing.
 * - Font Awesome icon directives formatted as `:icon[fa-iconName]` with HTML that includes a Font Awesome `<i>` element.
 * - Lucide icon directives formatted as `:icon[lucide-iconName]` with HTML that includes an `<i>` element referencing a Lucide icon.
 *
 * @param content - Markdown content containing custom syntax.
 * @returns The content with custom markdown patterns replaced by their corresponding HTML elements.
 */
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
  
  return content;
}

/**
 * Processes markdown content by applying custom markdown transformations and converting it to HTML.
 *
 * The function first applies custom syntax rules (such as those for highlights, PDF embeds, and icons),
 * then passes the modified content through a unified pipeline with remark and rehype plugins to support
 * GitHub Flavored Markdown, emoji conversion, custom HTML parsing, syntax highlighting, and heading anchors.
 *
 * @param content - The markdown content to process.
 * @returns A promise that resolves to the resulting HTML string.
 */
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
    .use(rehypeAutolinkHeadings) // Add links to headings
    .use(rehypeStringify) // Convert to HTML string
    .process(content);

  return processedContent.toString();
}

/**
 * Retrieves a complete article, including metadata and processed content, from a markdown file.
 *
 * This function searches for a markdown (.md) or MDX (.mdx) file corresponding to the given slug. If a matching file is found,
 * it reads and parses the file's front matter to extract metadata and the markdown content. The metadata is validated for the
 * required fields (title, description, category), and the markdown content is processed into HTML using an enhanced processor.
 * The function returns an Article object that contains both the raw markdown and the generated HTML, along with additional metadata
 * such as formatted dates and a reading time estimate. If the file does not exist, metadata is missing, or an error occurs during processing,
 * the function returns null.
 *
 * @param slug - The unique identifier for the article (without file extension).
 * @returns A promise resolving to an Article object if successful; otherwise, null.
 */
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