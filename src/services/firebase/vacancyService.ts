import { 
  collection, 
  getDocs,
  getDoc,
  doc,
  query, 
  limit, 
  startAfter, 
  orderBy,
  where,
  QueryConstraint,
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp,
  FirestoreError
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { ListingType } from '../../types/listing';

class VacancyService {
  private locationCache: Map<string, number> = new Map();
  private levelCache: Set<number> = new Set();
  private readonly COLLECTION_NAME = 'vacancies';

  /**
   * Fetches all available locations from vacancies
   * @returns Array of unique location names
   */
  async getAvailableLocations(): Promise<string[]> {
    try {
      this.locationCache.clear();
      
      const vacanciesRef = collection(db, this.COLLECTION_NAME);
      const q = query(
        vacanciesRef,
        orderBy('address.addressLine3', 'asc')
      );
      
      const snapshot = await getDocs(q);
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.address?.addressLine3) {
          const city = data.address.addressLine3.trim();
          this.locationCache.set(
            city, 
            (this.locationCache.get(city) || 0) + 1
          );
        }
      });

      return Array.from(this.locationCache.entries())
        .filter(([_, count]) => count > 0)
        .map(([city]) => city)
        .sort();
    } catch (error) {
      console.error('Error fetching locations:', error);
      throw this.handleFirestoreError(error as FirestoreError);
    }
  }

  /**
   * Fetches all available apprenticeship levels
   * @returns Array of unique level numbers
   */
  async getAvailableLevels(): Promise<number[]> {
    try {
      this.levelCache.clear();
      
      const vacanciesRef = collection(db, this.COLLECTION_NAME);
      const q = query(
        vacanciesRef,
        orderBy('course.level', 'asc')
      );
      
      const snapshot = await getDocs(q);
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.course?.level) {
          this.levelCache.add(data.course.level);
        }
      });

      return Array.from(this.levelCache).sort((a, b) => a - b);
    } catch (error) {
      console.error('Error fetching levels:', error);
      throw this.handleFirestoreError(error as FirestoreError);
    }
  }

  /**
   * Fetches a single vacancy by ID
   * @param id Vacancy reference ID
   * @returns Promise with vacancy details
   */
  async getVacancyById(id: string): Promise<ListingType> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Vacancy not found');
      }

      const data = docSnap.data();
      return this.transformVacancyData(docSnap.id, data);
    } catch (error) {
      console.error('Error fetching vacancy:', error);
      throw this.handleFirestoreError(error as FirestoreError);
    }
  }

  /**
   * Fetches vacancies with pagination and filtering
   * @param options Query options including pagination and filters
   * @returns Promise with vacancies, total count, and pagination info
   */
  async getVacancies({
    page = 1,
    pageSize = 5,
    lastDoc = null,
    filters = {}
  }: {
    page?: number;
    pageSize?: number;
    lastDoc?: QueryDocumentSnapshot<DocumentData> | null;
    filters?: {
      search?: string;
      location?: string;
      level?: string;
    };
  }) {
    try {
      const queryConstraints: QueryConstraint[] = [];
      const vacanciesRef = collection(db, this.COLLECTION_NAME);

      // Apply filters
      this.applyFilters(queryConstraints, filters);

      // Add sorting
      queryConstraints.push(orderBy('postedDate', 'desc'));

      // Add pagination
      if (lastDoc) {
        queryConstraints.push(startAfter(lastDoc));
      }
      queryConstraints.push(limit(pageSize));

      // Execute main query
      const q = query(vacanciesRef, ...queryConstraints);
      const snapshot = await getDocs(q);

      // Get total count (without pagination)
      const countQuery = query(
        vacanciesRef, 
        ...queryConstraints.filter(c => c.type !== 'limit' && c.type !== 'startAfter')
      );
      const countSnapshot = await getDocs(countQuery);

      // Transform results
      const vacancies = snapshot.docs.map(doc => 
        this.transformVacancyData(doc.id, doc.data())
      );

      return {
        vacancies,
        total: countSnapshot.size,
        lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
        hasMore: snapshot.docs.length === pageSize
      };
    } catch (error) {
      console.error('Error fetching vacancies:', error);
      throw this.handleFirestoreError(error as FirestoreError);
    }
  }

  /**
   * Transforms raw Firestore data into ListingType
   * @param id Document ID
   * @param data Raw Firestore data
   * @returns Transformed ListingType object
   */
  private transformVacancyData(id: string, data: DocumentData): ListingType {
    return {
      id,
      ...data,
      postedDate: this.convertTimestamp(data.postedDate),
      startDate: this.convertTimestamp(data.startDate),
      closingDate: this.convertTimestamp(data.closingDate),
      location: {
        latitude: data.location?.latitude || 0,
        longitude: data.location?.longitude || 0
      }
    } as ListingType;
  }

  /**
   * Converts Firestore timestamp to Date
   * @param timestamp Timestamp to convert
   * @returns Date object
   */
  private convertTimestamp(timestamp: Timestamp | Date | null): Date {
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate();
    }
    if (timestamp instanceof Date) {
      return timestamp;
    }
    return new Date();
  }

  /**
   * Applies filters to query constraints
   * @param queryConstraints Array of query constraints
   * @param filters Filter options
   */
  private applyFilters(
    queryConstraints: QueryConstraint[],
    filters: {
      search?: string;
      location?: string;
      level?: string;
    }
  ): void {
    // Handle search filter
    if (filters.search?.trim()) {
      const searchTerm = filters.search.toLowerCase().trim();
      queryConstraints.push(
        where('searchableText', 'array-contains', searchTerm)
      );
    }

    // Handle location filter
    if (filters.location?.trim()) {
      queryConstraints.push(
        where('address.addressLine3', '==', filters.location.trim())
      );
    }

    // Handle level filter
    if (filters.level?.trim()) {
      const levelNum = parseInt(filters.level, 10);
      if (!isNaN(levelNum)) {
        queryConstraints.push(where('course.level', '==', levelNum));
      }
    }
  }

  /**
   * Handles Firestore errors
   * @param error Firestore error
   * @returns Formatted error
   */
  private handleFirestoreError(error: FirestoreError): Error {
    let message = 'An error occurred while accessing the database';
    
    switch (error.code) {
      case 'permission-denied':
        message = 'You do not have permission to access this data';
        break;
      case 'not-found':
        message = 'The requested data could not be found';
        break;
      case 'resource-exhausted':
        message = 'Too many requests. Please try again later';
        break;
      default:
        message = error.message;
    }

    return new Error(message);
  }
}

export const vacancyService = new VacancyService();