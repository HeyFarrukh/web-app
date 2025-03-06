import type { MetadataRoute } from 'next'
import { vacancyService } from '@/services/supabase/vacancyService'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch all active vacancies
  const { vacancies } = await vacancyService.getVacancies({ page: 1, pageSize: 1000, filters: {} });

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
      url: 'https://apprenticewatch.com/optimise-cv',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: 'https://apprenticewatch.com/cv-guide',
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

  return [...baseUrls, ...vacancyUrls];
}
