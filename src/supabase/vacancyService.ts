// services/supabase/vacancyService.ts
import supabase  from '../config/supabase';
import { ListingType, SupabaseListing } from '../types/listing'; // Import both interfaces

class VacancyService {
  private readonly TABLE_NAME = 'vacancies';

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
      const now = new Date().toISOString();
      const { count, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .gt('closing_date', now);

      if (error) {
        console.error('Supabase error in getTotalActiveVacancies:', error);
        throw error;
      }
      return count || 0;
    } catch (error) {
      console.error('Error getting total vacancies:', error);
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
    const now = new Date().toISOString();
    let query = supabase
      .from(this.TABLE_NAME)
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .gt('closing_date', now)
      .order('posted_date', { ascending: false });

if (filters.search) {
  query = query.or(
    `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,employer_name.ilike.%${filters.search}%`
  );
}

    if (filters.location) {
      query = query.eq('address_line3', filters.location);
    }

    if (filters.level) {
      query = query.eq('course_level', parseInt(filters.level));
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query.range(from, to);

    if (error) {
      console.error('Supabase error in getVacancies:', error);
      throw error;
    }

    return {
      vacancies: (data as SupabaseListing[]).map(d => this.transformListing(d)),
      total: count || 0,
    };
  } catch (error) {
    console.error('Error getting vacancies:', error);
    throw error;
  }
}

  async getVacancyById(id: string): Promise<ListingType> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Supabase error in getVacancyById:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Vacancy not found');
      }

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

      if (error) {
        console.error('Supabase error in getAvailableLocations:', error);
        throw error;
      }

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
        .not('course_level', 'is', null)
        .order('course_level');

      if (error) {
        console.error('Supabase error in getAvailableLevels:', error);
        throw error;
      }

      // Use Set to get unique values and filter out any remaining null/undefined
      const levels = Array.from(new Set(
        data
          ?.map(d => d.course_level)
          .filter(level => level != null)
      )) as number[];
      
      return levels;
    } catch (error) {
      console.error('Error getting available levels:', error);
      throw error;
    }
  }
}

export const vacancyService = new VacancyService();
