import supabase from '@/config/supabase';
import { ListingType, SupabaseListing } from '@/types/listing';
import { Analytics } from '@/services/analytics/analytics';

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
      title: listing.title,
      description: listing.description,
      employerName: listing.employer_name,
      vacancyReference: listing.vacancy_reference,
      vacancyUrl: listing.vacancy_url,
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
      console.log("[VacancyService] getVacancies called with filters:", filters);
      const start = (page - 1) * pageSize;
      const end = start + pageSize - 1;
      const now = new Date().toISOString();

      let query = supabase
        .from(this.TABLE_NAME)
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .gt('closing_date', now);

      // Apply filters
      if (filters.search?.trim()) {
        query = query.or(
          `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,employer_name.ilike.%${filters.search}%`
        );
      }

      if (filters.location?.trim()) {
        const locationFilter = [
          `postcode.ilike.%${filters.location}%`,
          `address_line1.ilike.%${filters.location}%`,
          `address_line2.ilike.%${filters.location}%`,
          `address_line3.ilike.%${filters.location}%`
        ].join(',');
        query = query.or(locationFilter);
      }

      if (filters.level?.trim()) {
        // Ensure level is a valid number
        const levelNumber = parseInt(filters.level, 10);
        if (!isNaN(levelNumber) && levelNumber > 0) {
          query = query.eq('course_level', levelNumber);
        }
      }

      if (filters.category) {
        query = query.eq('course_route', filters.category);
      }

      // Apply ordering and pagination after all filters
      query = query
        .order('posted_date', { ascending: false })
        .range(start, end);

      const { data: listings, count, error } = await query;

      if (error) {
        console.error("[VacancyService] Error fetching vacancies:", error);
        throw new Error('Failed to fetch vacancies');
      }

      return {
        vacancies: listings?.map(listing => this.transformListing(listing)) || [],
        total: count || 0
      };
    } catch (error) {
      console.error("[VacancyService] Error in getVacancies:", error);
      throw error;
    }
  }

  async getVacancyById(id: string): Promise<ListingType | null> {
    try {
      // Validate ID format (assuming UUID format)
      if (!id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        console.error('Invalid vacancy ID format');
        return null;
      }

      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      if (!data) {
        console.log(`[VacancyService] No vacancy found for ID: ${id}`);
        return null;
      }

      return this.transformListing(data as SupabaseListing);
    } catch (error) {
      console.error('Error in getVacancyById:', error);
      throw error;
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

    try {
      console.log("[VacancyService] getAllVacanciesForMap called with filters:", filters);
      const now = new Date().toISOString();
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

      const { data, error } = await query;

      if (error) throw error;
      
      console.log(`[VacancyService] Found ${data?.length || 0} vacancies for map`);
      return data ? (data as SupabaseListing[]).map(d => this.transformListing(d)) : [];
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