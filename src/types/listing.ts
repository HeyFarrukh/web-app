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
  logo?: string; // Added for UI purposes
}