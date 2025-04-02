import type { MetadataRoute } from 'next'
import { vacancyService } from '@/services/supabase/vacancyService'
import { getAllArticlesMetadata } from '@/lib/articles'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch all active vacancies without pagination
  const vacancies = await vacancyService.getAllActiveVacanciesForSitemap();
  console.log(`Fetched ${vacancies.length} vacancies for sitemap.`); // Optional: log fetched count

  // Get all articles metadata
  const articlesMetadata = getAllArticlesMetadata();
  console.log(`Fetched ${articlesMetadata.length} total article metadata entries.`); // Optional: log fetched count

  // Base sitemap entries
  const baseUrls: MetadataRoute.Sitemap = [
    {
      url: 'https://apprenticewatch.com',
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
    {
      url: 'https://apprenticewatch.com/cookie-policy',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Generate sitemap URLs for each vacancy
  const vacancyUrls: MetadataRoute.Sitemap = vacancies.map((vacancy) => ({
    url: `https://apprenticewatch.com/apprenticeships/${vacancy.slug}`,
    lastModified: vacancy.postedDate,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  // Generate sitemap URLs for each article
  const articlesToInclude = articlesMetadata.filter(article => article.slug !== 'readme'); // Filter out 'readme' if it exists
  const articleUrls: MetadataRoute.Sitemap = articlesToInclude.map((article) => ({
    url: `https://apprenticewatch.com/resources/${article.slug}`,
    lastModified: new Date(article._rawDate),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));
  console.log(`Filtered down to ${articleUrls.length} articles for sitemap.`); // Optional: log filtered count

  // --- Calculate and Log Total ---
  const totalLinks = baseUrls.length + articleUrls.length + vacancyUrls.length;
  console.log(`---> Total links generated for sitemap: ${totalLinks} <---`);
  // -----------------------------

  // Combine all URLs
  const allUrls = [...baseUrls, ...articleUrls, ...vacancyUrls];

  // Return the combined sitemap array
  return allUrls;
}