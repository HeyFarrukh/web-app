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
          `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,employer_name.ilike.%${filters.search}%,wage_type.ilike.%${filters.search}%,wage_unit.ilike.%${filters.search}%,wage_additional_information.ilike.%${filters.search}%`
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
          console.warn(`[VacancyService] Invalid level filter value: ${filters.level}`);
        }
      }

      if (isNaN(page) || page < 1) {
        page = 1;
      }
      if (isNaN(pageSize) || pageSize < 1) {
        pageSize = 10;
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);
      query = query.order('posted_date', { ascending: false });

      const { data, error, count } = await query;

      if (error) {
        console.error("[VacancyService] Supabase query error:", error);
        throw error;
      }
      console.log("[VacancyService] Supabase Data:", data);
      return {
        vacancies: data ? (data as SupabaseListing[]).map(d => this.transformListing(d)) : [],
        total: count || 0
      };
    } catch (error: any) {
      console.error("Error in getVacancies:", error);
      throw error;
    }
  }

  async getVacancyById(id: string): Promise<ListingType | null> { // Return type changed!
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('id', id); // Removed .single()!

      if (error) {
        console.error('Supabase error:', error); // Log the Supabase error
        throw error; // Re-throw for higher-level handling (if needed)
      }

      //  Handle the case where no data is returned.
      if (!data || data.length === 0) {
        console.log(`[VacancyService] No vacancy found for ID: ${id}`);
        return null; // Return null if no listing is found.
      }

      // If data is found, transform and return it.
      return this.transformListing(data[0] as SupabaseListing);

    } catch (error) {
      console.error('Error in getVacancyById:', error);
      throw error; // Or return null, depending on how you want to handle errors
    }
  }

  async getAvailableLocations(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('address_line3')
        .eq('is_active', true)
        .gt('closing_date', new Date().toISOString());

      if (error) {
        console.error('Error fetching locations:', error);
        throw error;
      }

      const locations = Array.from(new Set(
        data?.map(d => d.address_line3)
          .filter(loc => loc && loc.trim() !== '')
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

      if (error) {
        console.error('Error fetching levels:', error);
        throw error;
      }

      const levels = Array.from(new Set(
        data?.map(d => d.course_level)
          .filter(level => level != null)  // Filter out null values
          .map(level => parseInt(level, 10)) // Parse to number
          .filter(level => !isNaN(level))  // Remove any NaN values that got through.
      )) as number[];

      return levels.sort((a, b) => a - b);
    } catch (error) {
      console.error('Error in getAvailableLevels:', error);
      throw error;
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
  } = {}): Promise<ListingType[]> {
    try {
      console.log("[VacancyService] getAllVacanciesForMap called with filters:", filters);
      const now = new Date().toISOString();
      let query = supabase
        .from(this.TABLE_NAME)
        .select('*')  // Select all fields to ensure transformListing works correctly
        .eq('is_active', true)
        .gt('closing_date', now);

      // Apply filters
      if (filters.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,employer_name.ilike.%${filters.search}%,wage_type.ilike.%${filters.search}%,wage_unit.ilike.%${filters.search}%,wage_additional_information.ilike.%${filters.search}%`
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
          console.warn(`[VacancyService] Invalid level filter value: ${filters.level}`);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error("[VacancyService] Supabase query error:", error);
        throw error;
      }
      
      console.log(`[VacancyService] Found ${data?.length || 0} vacancies for map`);
      return data ? (data as SupabaseListing[]).map(d => this.transformListing(d)) : [];
    } catch (error: any) {
      console.error("Error in getAllVacanciesForMap:", error);
      throw error;
    }
  }
}

export const vacancyService = new VacancyService();