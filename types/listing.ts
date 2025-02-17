export interface ApprenticeshipCourse {
  larsCode: number;
  level: number;
  route: string;
  title: string;
}

export interface ApprenticeshipWage {
  wageAdditionalInformation?: string;
  wageType: string;
  wageUnit: string;
}

export interface ApprenticeshipAddress {
  addressLine1: string;
  addressLine2?: string;
  addressLine3?: string;
  postcode: string;
}

export interface ListingType {
  id: string;
  address: ApprenticeshipAddress;
  apprenticeshipLevel: string;
  closingDate: Date;
  course: ApprenticeshipCourse;
  description: string;
  distance?: number;
  employerContactEmail?: string;
  employerContactName?: string;
  employerContactPhone?: string;
  employerName: string;
  employerWebsiteUrl?: string;
  expectedDuration: string;
  hoursPerWeek: number;
  isDisabilityConfident: boolean;
  isNationalVacancy: boolean;
  location: {
    latitude: number;
    longitude: number;
  };
  numberOfPositions: number;
  postedDate: Date;
  providerName: string;
  startDate: Date;
  title: string;
  ukprn: number;
  vacancyReference: string;
  vacancyUrl: string;
  wage: ApprenticeshipWage;
  workingWeekDescription: string;
  logo?: string;
}

export interface SupabaseListing {
  id: string;
  title: string;
  description: string;
  employer_name: string;
  vacancy_reference: string;
  vacancy_url: string;
  course_title: string;
  apprenticeship_level: string;
  is_active: boolean;
  employer_contact_email?: string;
  employer_contact_name?: string;
  employer_contact_phone?: string;
  employer_website_url?: string;
  provider_name: string;
  posted_date: string;
  closing_date: string;
  start_date: string;
  expected_duration: string;
  hours_per_week: number;
  working_week_description: string;
  number_of_positions: number;
  is_disability_confident: boolean;
  is_national_vacancy: boolean;
  address_line1: string;
  address_line2?: string;
  address_line3?: string;
  postcode: string;
  latitude: number;
  longitude: number;
  lars_code: number;
  course_level: number;
  course_route: string;
  wage_type: string;
  wage_unit: string;
  wage_additional_information?: string;
  logo?: string;
  ukprn: number;
}