import supabase from '@/config/supabase';
import { ListingType, SupabaseListing } from '@/types/listing';
import { Analytics } from '@/services/analytics/analytics';

class VacancyService {
  private readonly TABLE_NAME = 'vacancies';
  private readonly REVALIDATION_URL = '/api/revalidate';
  private readonly REVALIDATION_SECRET = process.env.REVALIDATION_SECRET_TOKEN;

  private transformListing(listing: SupabaseListing): ListingType {
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
      logo: listing.logo
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
        console.error('[VacancyService] Error fetching total vacancies:', error);
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

  async getVacancies({
    page = 1,
    pageSize = 10,
    filters = {}
  }: {
    page: number;
    pageSize: number;
    filters: {
      search?: string;
      location?: string;
      level?: string;
    };
  }) {
    try {
      console.log("[VacancyService] getVacancies called with filters:", filters);
      const now = new Date().toISOString();
      let query = supabase
        .from(this.TABLE_NAME)
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .gt('closing_date', now);

      // Apply filters *BEFORE* pagination
      if (filters.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,employer_name.ilike.%${filters.search}%`
        );
      }

      if (filters.location) {
        query = query.ilike('address_line3', `%${filters.location}%`);
      }

      if (filters.level) {
        const levelNumber = parseInt(filters.level, 10);
        if (!isNaN(levelNumber)) {
          query = query.eq('course_level', levelNumber);
        } else {
          console.warn(`[VacancyService] Invalid level filter value: ${filters.level}`); //Still a good idea.
        }
      }

      // Pagination: Calculate 'from' and 'to' *after* applying filters.  Crucial change
      if (isNaN(page) || page < 1) {
        page = 1;
      }
      if (isNaN(pageSize) || pageSize < 1) {
        pageSize = 10; // Or some other reasonable default
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);
      query = query.order('posted_date', { ascending: false }); //Order needs to be here

      const { data, error, count } = await query;

      if (error) {
        console.error("[VacancyService] Supabase query error:", error);
        throw error;
      }
      console.log("[VacancyService] Supabase Data:", data);
      return {
        vacancies: data ? (data as SupabaseListing[]).map(d => this.transformListing(d)) : [],
        total: count || 0 // Use count from the query, which is now filtered.
      };
    } catch (error: any) {
      console.error("Error in getVacancies:", error);
      throw error;
    }
  }

  async getVacancyById(id: string): Promise<ListingType> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Vacancy not found');

      return this.transformListing(data as SupabaseListing);
    } catch (error) {
      console.error('Error getting vacancy by ID:', error);
      throw error;
    }
  }

  async getAvailableLocations(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('address_line3')
        .eq('is_active', true)
        .not('address_line3', 'is', null);

      if (error) throw error;

      const locations = Array.from(new Set(data?.map(d => d.address_line3))) as string[];
      return locations.sort();
    } catch (error) {
      console.error('Error getting available locations:', error);
      throw error;
    }
  }

  async getAvailableLevels(): Promise<number[]> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('course_level')
        .eq('is_active', true)
        .not('course_level', 'is', null);

      if (error) throw error;

      const levels = Array.from(new Set(
        data?.map(d => d.course_level)
          .filter(level => level != null)  // Filter out null values
          .map(level => parseInt(level, 10)) // Parse to number
          .filter(level => !isNaN(level))  // Remove any NaN values that got through.
      )) as number[];

      return levels.sort((a, b) => a - b);
    } catch (error) {
      console.error('Error getting available levels:', error);
      throw error;
    }
  }

  // --- CRUD Methods with Revalidation ---

  async addVacancy(newVacancyData: any) { // Replace 'any' with a proper type
    const { data, error } = await supabase.from(this.TABLE_NAME).insert([newVacancyData]).select();
    if (error) {
      console.error("Error adding vacancy:", error);
      throw error;
    }
    await this.revalidateCache(`/apprenticeships`);
    return data; // Usually a good idea to return the added data
  }

  async updateVacancy(id: string, updatedVacancyData: any) { // Replace 'any'
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .update(updatedVacancyData)
      .eq('id', id)
      .select();

    if (error) {
      console.error("Error updating vacancy:", error);
      throw error;
    }
    await this.revalidateCache(`/apprenticeships/${id}`);
    await this.revalidateCache(`/apprenticeships`); // Revalidate main page too
    return data;
  }

  async deleteVacancy(id: string) {
    const { error } = await supabase
      .from(this.TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting vacancy:", error);
      throw error;
    }
    await this.revalidateCache(`/apprenticeships`);
  }

  // Private method to handle revalidation
  private async revalidateCache(path: string) {
    if (!this.REVALIDATION_SECRET) {
      console.error("REVALIDATION_SECRET_TOKEN is not set.");
      return; // Or throw an error, depending on your needs
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
      const json = await res.json();  //Try to get JSON, even on error (it might contain useful info).
      if (json.revalidated) {
        console.log(`Successfully revalidated path: ${path}`);
      } else {
        console.error(`Revalidation failed (but no server error) for ${path}. Response:`, json); //Log full response
      }

    } catch (error) {
      console.error(`Error revalidating path: ${path}`, error);
    }
  }

}

export const vacancyService = new VacancyService();
