// Client-side interfaces and utility functions for articles

export interface ArticleMetadata {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  slug: string;
  image?: string;
}

export interface Article extends ArticleMetadata {
  content: string;
  contentHtml?: string;
}

// Client-side function to fetch all articles
export async function getAllArticles(): Promise<ArticleMetadata[]> {
  try {
    const response = await fetch('/api/articles');
    if (!response.ok) {
      throw new Error('Failed to fetch articles');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
}

// Client-side function to fetch a single article by slug
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const response = await fetch(`/api/articles/${slug}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch article');
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching article ${slug}:`, error);
    return null;
  }
}
