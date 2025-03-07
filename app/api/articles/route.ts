import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Get the articles directory path
const articlesDirectory = path.join(process.cwd(), 'content/articles');

// Function to get all article slugs
function getArticleSlugs() {
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

// Function to get article by slug (metadata only)
function getArticleMetadata(slug: string) {
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
      image: data.image || null
    };
  } catch (error) {
    console.error(`Error reading article metadata ${slug}:`, error);
    return null;
  }
}

// GET handler for /api/articles
export async function GET() {
  try {
    const slugs = getArticleSlugs();
    const articles = slugs
      .map(slug => getArticleMetadata(slug))
      .filter(article => article !== null)
      // Sort articles by date in descending order
      .sort((a: any, b: any) => (new Date(b.date).getTime() - new Date(a.date).getTime()));
    
    return NextResponse.json(articles);
  } catch (error) {
    console.error('Error getting all articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}
