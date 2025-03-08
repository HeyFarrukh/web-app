import type { MetadataRoute } from 'next'
import { vacancyService } from '@/services/supabase/vacancyService'
import { getAllArticlesMetadata } from '@/lib/articles'

/**
 * Generates a sitemap for the website.
 *
 * This asynchronous function constructs a sitemap by combining a set of predefined base URLs
 * with dynamic entries derived from active vacancies and articles metadata. It fetches active
 * vacancies (up to 1000) and retrieves metadata for all articles, excluding those with the slug "readme".
 * Vacancy URLs incorporate the vacancy's ID and its posted date, while article URLs use the article's slug
 * and raw date.
 *
 * @returns A promise that resolves to the complete sitemap, containing base, article, and vacancy URL entries.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch all active vacancies
  const { vacancies } = await vacancyService.getVacancies({ page: 1, pageSize: 1000, filters: {} });

  // Get all articles metadata
  const articles = getAllArticlesMetadata();

  // Base sitemap entries
  const baseUrls: MetadataRoute.Sitemap = [
    {
      url: 'https://apprenticewatch.com/',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: 'https://apprenticewatch.com/apprenticeships',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: 'https://apprenticewatch.com/resources',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: 'https://apprenticewatch.com/optimise-cv',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: 'https://apprenticewatch.com/team',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: 'https://apprenticewatch.com/join',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: 'https://apprenticewatch.com/privacy',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: 'https://apprenticewatch.com/terms',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Generate sitemap URLs for each vacancy
  const vacancyUrls: MetadataRoute.Sitemap = vacancies.map((vacancy) => ({
    url: `https://apprenticewatch.com/apprenticeships/${vacancy.id}`,
    lastModified: vacancy.postedDate, 
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  // Generate sitemap URLs for each article
  const articleUrls: MetadataRoute.Sitemap = articles
    .filter(article => article.slug !== 'readme')  
    .map((article) => ({
      url: `https://apprenticewatch.com/resources/${article.slug}`,
      lastModified: new Date(article._rawDate), 
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

  // Return URLs in order: base URLs, article URLs, then vacancy URLs
  return [...baseUrls, ...articleUrls, ...vacancyUrls];
}
