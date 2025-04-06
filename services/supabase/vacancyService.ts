import supabase from '@/config/supabase';
import { ListingType, SupabaseListing } from '@/types/listing';
import { Analytics } from '@/services/analytics/analytics';
import logger, { createLogger } from '@/services/logger/logger';

// Create a dedicated logger for the vacancy service
const vacancyLogger = createLogger({ module: 'VacancyService' });

class VacancyService {
  private readonly TABLE_NAME = 'vacancies';
  private readonly REVALIDATION_URL = '/api/revalidate';
  private readonly REVALIDATION_SECRET = process.env.REVALIDATION_SECRET_TOKEN;

  private transformListing(listing: SupabaseListing): ListingType {
    // Parse qualifications if it exists and is a string
    let qualifications = listing.qualifications;
    
    // Handle different possible formats of qualifications
    if (qualifications) {
      if (typeof qualifications === 'string') {
        try {
          // Try to parse if it's a JSON string
          qualifications = JSON.parse(qualifications);
        } catch (e) {
          // If it fails to parse, keep it as a string
          console.warn('Failed to parse qualifications JSON:', e);
        }
      }
      
      // If it's not an array but should be, convert it
      if (qualifications && !Array.isArray(qualifications)) {
        if (typeof qualifications === 'object') {
          // If it's a single object, wrap it in an array
          qualifications = [qualifications];
        } else {
          // If it's something else, make it an empty array
          qualifications = [];
        }
      }
    }

    return {
      id: listing.id,
      slug: listing.slug || listing.id.toString(),
      title: listing.title,
      description: listing.description,
      employerName: listing.employer_name,
      vacancyReference: listing.vacancy_reference,
      vacancyUrl: listing.vacancy_url,
      companyVacancyUrl: listing.company_vacancy_url,
      providerName: listing.provider_name,
      postedDate: new Date(listing.posted_date),
      closingDate: new Date(listing.closing_date),
      startDate: new Date(listing.start_date),
      expectedDuration: listing.expected_duration,
      hoursPerWeek: listing.hours_per_week,
      workingWeekDescription: listing.working_week_description,
      numberOfPositions: listing.number_of_positions,
      isDisabilityConfident: listing.is_disability_confident,
      isNationalVacancy: listing.is_national_vacancy ?? false,
      is_active: listing.is_active ?? true,
      address: {
        addressLine1: listing.address_line1,
        addressLine2: listing.address_line2,
        addressLine3: listing.address_line3,
        postcode: listing.postcode
      },
      location: {
        latitude: listing.latitude ?? 0,
        longitude: listing.longitude ?? 0
      },
      course: {
        larsCode: listing.lars_code ?? 0,
        level: listing.course_level,
        route: listing.course_route,
        title: listing.course_title
      },
      apprenticeshipLevel: listing.apprenticeship_level,
      wage: {
        wageType: listing.wage_type,
        wageUnit: listing.wage_unit,
        wageAdditionalInformation: listing.wage_additional_information
      },
      employerContactEmail: listing.employer_contact_email,
      employerContactName: listing.employer_contact_name,
      employerContactPhone: listing.employer_contact_phone,
      employerWebsiteUrl: listing.employer_website_url,
      ukprn: listing.ukprn ?? 0,
      logo: listing.logo,
      fullDescription: listing.full_description,
      skills: listing.skills,
      qualifications: qualifications,
      employerDescription: listing.employer_description
    };
  }

  async getTotalActiveVacancies(): Promise<number> {
    try {
      console.log('[VacancyService] Fetching total active vacancies');
      const now = new Date().toISOString();
      const { count, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .gt('closing_date', now);

      if (error) {
        console.error('[VacancyService] Error getting total vacancies:', error);
        Analytics.event('error', 'vacancy_count_error', error.message);
        throw error;
      }

      console.log('[VacancyService] Total active vacancies:', count);
      return count || 0;
    } catch (error) {
      console.error('[VacancyService] Error getting total vacancies:', error);
      throw error;
    }
  }

  async getVacancies({ page = 1, pageSize = 10, filters = {} }: {
    page: number;
    pageSize: number;
    filters: {
      search?: string;
      location?: string;
      level?: string;
      category?: string;
    };
  }) {
    try {
      vacancyLogger.info(`Fetching vacancies with page: ${page}, pageSize: ${pageSize}, filters: ${JSON.stringify(filters)}`);
      const now = new Date().toISOString();
      
      // Calculate pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // Start building the query
      let query = supabase
        .from(this.TABLE_NAME)
        .select(`
          *,
          quality_scores:vacancy_quality_scores(total_score, employer_reputation_score, listing_completeness_score, quality_indicators_score, time_factors_score, engagement_score, manual_boost_score)
        `, { count: 'exact' })
        .eq('is_active', true)
        .gt('closing_date', now);

      // Apply filters using Supabase's built-in methods which handle escaping
      if (filters.search?.trim()) {
        query = query.or(
          `title.ilike.%${filters.search}%,` +
          `description.ilike.%${filters.search}%,` +
          `employer_name.ilike.%${filters.search}%`
        );
        vacancyLogger.debug(`Applied search filter: ${filters.search}`);
      }

      if (filters.location?.trim()) {
        query = query.ilike('address_line3', `%${filters.location}%`);
        vacancyLogger.debug(`Applied location filter: ${filters.location}`);
      }

      if (filters.level?.trim()) {
        const levelNumber = parseInt(filters.level, 10);
        if (!isNaN(levelNumber) && levelNumber > 0) {
          query = query.eq('course_level', levelNumber);
          vacancyLogger.debug(`Applied level filter: ${levelNumber}`);
        }
      }

      if (filters.category?.trim()) {
        query = query.eq('course_route', filters.category.trim());
        vacancyLogger.debug(`Applied category filter: ${filters.category}`);
      }

      // Order by quality score (highest first)
      query = query.order('quality_scores(total_score)', { ascending: false, nullsFirst: false });
      vacancyLogger.info('Ordering results by quality_scores(total_score) DESC');

      // Add pagination
      query = query.range(from, to);

      const { data, count, error } = await query;

      if (error) {
        vacancyLogger.error(`Error fetching vacancies: ${error.message}`, error);
        throw error;
      }

      vacancyLogger.info(`Found ${count || 0} total vacancies matching criteria`);
      
      // Track quality scores for analysis
      const qualityScores: { id: string, employer: string, score: number, components: any }[] = [];
      
      // Transform the data
      const vacancies = data?.map(vacancy => {
        // Extract the quality score from the joined data
        const qualityData = vacancy.quality_scores?.[0];
        const totalScore = qualityData?.total_score || 0;
        
        // Store quality score info for logging
        qualityScores.push({
          id: vacancy.id,
          employer: vacancy.employer_name,
          score: totalScore,
          components: {
            employer_reputation: qualityData?.employer_reputation_score || 0,
            listing_completeness: qualityData?.listing_completeness_score || 0,
            quality_indicators: qualityData?.quality_indicators_score || 0,
            time_factors: qualityData?.time_factors_score || 0,
            engagement: qualityData?.engagement_score || 0,
            manual_boost: qualityData?.manual_boost_score || 0
          }
        });
        
        delete vacancy.quality_scores; // Remove from the object before transformation
        return this.transformListing(vacancy);
      }) || [];

      // Log detailed information about top apprenticeships
      if (qualityScores.length > 0) {
        vacancyLogger.info(`Top ${Math.min(5, qualityScores.length)} apprenticeships by quality score:`);
        qualityScores.slice(0, 5).forEach((item, index) => {
          vacancyLogger.info(`#${index + 1}: ${item.employer} (ID: ${item.id}) - Score: ${item.score}`);
          vacancyLogger.debug(`Score components for ${item.id}: ${JSON.stringify(item.components)}`);
        });
        
        // Calculate and log score distribution
        const totalScores = qualityScores.map(item => item.score);
        const avgScore = totalScores.reduce((sum, score) => sum + score, 0) / totalScores.length;
        const maxScore = Math.max(...totalScores);
        const minScore = Math.min(...totalScores);
        
        vacancyLogger.info(`Quality score stats - Avg: ${avgScore.toFixed(2)}, Min: ${minScore}, Max: ${maxScore}`);
      }

      return {
        vacancies,
        total: count || 0
      };
    } catch (error: any) {
      vacancyLogger.error(`Error in getVacancies: ${error.message}`, error);
      throw error;
    }
  }

  async getVacancyById(id: string): Promise<ListingType | null> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('[VacancyService] Error fetching vacancy:', error);
        return null;
      }

      if (!data) {
        return null;
      }

      return this.transformListing(data);
    } catch (error) {
      console.error('[VacancyService] Error in getVacancyById:', error);
      return null;
    }
  }

  async getVacancyBySlug(slug: string): Promise<ListingType | null> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        console.error('[VacancyService] Error fetching vacancy by slug:', error);
        return null;
      }

      if (!data) {
        // Try fetching by ID as fallback for backward compatibility
        return this.getVacancyById(slug);
      }

      return this.transformListing(data);
    } catch (error) {
      console.error('[VacancyService] Error in getVacancyBySlug:', error);
      return null;
    }
  }

  async getAvailableLocations(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('address_line3')
        .eq('is_active', true)
        .gt('closing_date', new Date().toISOString());

      if (error) throw error;

      // Sanitize and deduplicate locations
      const locations = Array.from(new Set(
        data?.map(d => d.address_line3)
          .filter(loc => loc && typeof loc === 'string' && loc.trim() !== '')
          .map(loc => loc.trim())
      )) as string[];

      return locations.sort();
    } catch (error) {
      console.error('Error in getAvailableLocations:', error);
      throw error;
    }
  }

  async getAvailableLevels(): Promise<number[]> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('course_level')
        .eq('is_active', true)
        .gt('closing_date', new Date().toISOString());

      if (error) throw error;

      // Sanitize and deduplicate levels
      const levels = Array.from(new Set(
        data?.map(d => d.course_level)
          .filter(level => level != null && !isNaN(Number(level)))
          .map(level => Math.floor(Number(level)))
          .filter(level => level > 0 && level <= 8) // Valid apprenticeship levels
      )) as number[];

      return levels.sort((a, b) => a - b);
    } catch (error) {
      console.error('Error in getAvailableLevels:', error);
      throw error;
    }
  }

  async getAvailableCategories(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('vacancies')
        .select('course_route')
        .not('course_route', 'is', null)
        .eq('is_active', true)
        .gt('closing_date', new Date().toISOString());

      if (error) {
        throw error;
      }

      const categories = Array.from(new Set(
        data
          .map(item => item.course_route)
          .filter(category => category && typeof category === 'string' && category.trim() !== '')
          .map(category => category.trim())
      )).sort();

      return categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  async addVacancy(newVacancyData: any) {
    const { data, error } = await supabase.from(this.TABLE_NAME).insert([newVacancyData]).select();
    if (error) {
      console.error("Error adding vacancy:", error);
      throw error;
    }
    console.log("Vacancy added successfully:", data);
    await this.revalidateCache(`/apprenticeships`);
    return data;
  }

  async updateVacancy(id: string, updatedVacancyData: any) {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .update(updatedVacancyData)
      .eq('id', id)
      .select();

    if (error) {
      console.error("Error updating vacancy:", error);
      throw error;
    }
    console.log("Vacancy updated successfully:", data);
    await this.revalidateCache(`/apprenticeships/${id}`);
    await this.revalidateCache(`/apprenticeships`);
    return data;
  }

  async deleteVacancy(id: string) {
    const { error } = await supabase.from(this.TABLE_NAME).delete().eq('id', id);
    if (error) {
      console.error("Error deleting vacancy:", error);
      throw error;
    }
    console.log("Vacancy deleted successfully");
    await this.revalidateCache(`/apprenticeships`);
  }

  async getAllActiveVacanciesForSitemap() {
    try {
      const now = new Date().toISOString();
      const pageSize = 1000; // Supabase's max limit per request
      let startIndex = 0;
      let allVacancies: SupabaseListing[] = [];
      
      // Keep fetching until we get all vacancies
      while (true) {
        const { data, error } = await supabase
          .from(this.TABLE_NAME)
          .select('*')
          .eq('is_active', true)
          .gt('closing_date', now)
          .order('posted_date', { ascending: false })
          .range(startIndex, startIndex + pageSize - 1);

        if (error) {
          console.error("[VacancyService] Supabase query error:", error);
          throw error;
        }

        if (!data || data.length === 0) break; // No more results
        
        allVacancies = [...allVacancies, ...data];
        if (data.length < pageSize) break; // Last page
        
        startIndex += pageSize;
      }

      const vacancies = allVacancies.map(d => this.transformListing(d));
      console.log(`[VacancyService] Found ${vacancies.length} active vacancies for sitemap`);
      return vacancies;
    } catch (error: any) {
      console.error("Error in getAllActiveVacanciesForSitemap:", error);
      throw error;
    }
  }

  private async revalidateCache(path: string) {
    if (!this.REVALIDATION_SECRET) {
        console.error("REVALIDATION_SECRET_TOKEN is not set.");
        return;
    }
    try {
        const res = await fetch(`${this.REVALIDATION_URL}?path=${path}&secret=${this.REVALIDATION_SECRET}`, {
            method: 'POST'
        });

        if (!res.ok) {
           const errorText = await res.text();
           console.error(`Revalidation failed for ${path}. Status: ${res.status} ${res.statusText}. Response: ${errorText}`);
          return;
        }
        const json = await res.json();
        if (json.revalidated) {
            console.log(`Successfully revalidated path: ${path}`);
        } else {
             console.error(`Revalidation failed (but no server error) for ${path}. Response:`, json);
        }

    } catch (error) {
        console.error(`Error revalidating path: ${path}`, error);
    }
  }

  async getAllVacanciesForMap(filters: {
    search?: string;
    location?: string;
    level?: string;
    category?: string;
  } = {}, attempt = 0): Promise<ListingType[]> {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 2000;
    const PAGE_SIZE = 1000; // Supabase's max limit per request

    try {
      console.log("[VacancyService] getAllVacanciesForMap called with filters:", filters);
      const now = new Date().toISOString();
      let allVacancies: SupabaseListing[] = [];
      let startIndex = 0;

      while (true) {
        let query = supabase
          .from(this.TABLE_NAME)
          .select('*')
          .eq('is_active', true)
          .gt('closing_date', now);

        // Apply filters using Supabase's built-in methods which handle escaping
        if (filters.search?.trim()) {
          query = query.or(
            `title.ilike.%${filters.search}%,` +
            `description.ilike.%${filters.search}%,` +
            `employer_name.ilike.%${filters.search}%`
          );
        }

        if (filters.location?.trim()) {
          query = query.ilike('address_line3', `%${filters.location}%`);
        }

        if (filters.level?.trim()) {
          const levelNumber = parseInt(filters.level, 10);
          if (!isNaN(levelNumber) && levelNumber > 0) {
            query = query.eq('course_level', levelNumber);
          }
        }

        if (filters.category?.trim()) {
          query = query.eq('course_route', filters.category.trim());
        }

        // Add pagination
        query = query.range(startIndex, startIndex + PAGE_SIZE - 1);

        const { data, error } = await query;

        if (error) throw error;
        
        if (!data || data.length === 0) break; // No more results
        
        allVacancies = [...allVacancies, ...data];
        if (data.length < PAGE_SIZE) break; // Last page
        
        startIndex += PAGE_SIZE;
      }
      
      console.log(`[VacancyService] Found ${allVacancies.length} vacancies for map`);
      return allVacancies.map(d => this.transformListing(d));
    } catch (error: any) {
      console.error("Error in getAllVacanciesForMap:", error);
      
      // If we haven't reached max retries, wait and try again
      if (attempt < MAX_RETRIES) {
        console.log(`[VacancyService] Retrying getAllVacanciesForMap (Attempt ${attempt + 1}/${MAX_RETRIES})`);
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(this.getAllVacanciesForMap(filters, attempt + 1));
          }, RETRY_DELAY);
        });
      }
      
      throw error;
    }
  }
}

export const vacancyService = new VacancyService();