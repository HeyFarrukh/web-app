import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

// Get the articles directory path
const articlesDirectory = path.join(process.cwd(), 'content/articles');

// Function to get article by slug with content
async function getFullArticle(slug: string) {
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
      content: content,
      contentHtml: contentHtml
    };
  } catch (error) {
    console.error(`Error reading article ${slug}:`, error);
    return null;
  }
}

// GET handler for /api/articles/[slug]
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    const article = await getFullArticle(slug);
    
    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(article);
  } catch (error) {
    console.error(`Error fetching article:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}
