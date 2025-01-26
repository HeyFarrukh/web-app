import { 
  collection, 
  query, 
  where, 
  getDocs,
  doc,
  getDoc,
  DocumentData,
  QueryDocumentSnapshot,
  FirestoreError,
  orderBy,
  limit,
  startAfter,
  Query,
  getCountFromServer
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { ListingType } from '../../types/listing';

class VacancyService {
  private readonly COLLECTION_NAME = 'vacancies';

  /**
   * Gets the total count of active apprenticeships
   * @returns Promise with the total count
   */
  async getTotalActiveVacancies(): Promise<number> {
    try {
      const vacanciesRef = collection(db, this.COLLECTION_NAME);
      const now = new Date();
      
      // Query for vacancies that haven't closed yet
      const q = query(
        vacanciesRef,
        where('closingDate', '>', now),
        orderBy('closingDate')
      );
      
      const snapshot = await getCountFromServer(q);
      return snapshot.data().count;
    } catch (error) {
      console.error('Error getting total vacancies:', error);
      throw this.handleFirestoreError(error as FirestoreError);
    }
  }

  /**
   * Gets a paginated list of vacancies with optional filters
   */
  async getVacancies({ 
    page = 1, 
    pageSize = 10,
    lastDoc = null,
    filters = {}
  }: {
    page: number;
    pageSize: number;
    lastDoc?: QueryDocumentSnapshot<DocumentData> | null;
    filters: {
      search?: string;
      location?: string;
      level?: string;
    };
  }) {
    try {
      const vacanciesRef = collection(db, this.COLLECTION_NAME);
      let baseQuery: Query = query(vacanciesRef);

      // Add filters first
      if (filters.location) {
        baseQuery = query(baseQuery, 
          where('address.addressLine3', '==', filters.location),
          orderBy('postedDate', 'desc')
        );
      } else if (filters.level) {
        baseQuery = query(baseQuery,
          where('course.level', '==', parseInt(filters.level)),
          orderBy('postedDate', 'desc')
        );
      } else {
        baseQuery = query(baseQuery, orderBy('postedDate', 'desc'));
      }

      // Add pagination
      let finalQuery = query(baseQuery, limit(pageSize));
      if (lastDoc) {
        finalQuery = query(finalQuery, startAfter(lastDoc));
      }

      const snapshot = await getDocs(finalQuery);
      
      // Get the total count of documents that match the query
      const countSnapshot = await getCountFromServer(baseQuery);
      const total = countSnapshot.data().count;
      
      const vacancies = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ListingType[];

      // Filter by search term if provided (client-side filtering as Firestore doesn't support full-text search)
      const filteredVacancies = filters.search 
        ? vacancies.filter(vacancy => 
            vacancy.title.toLowerCase().includes(filters.search!.toLowerCase()) ||
            vacancy.description.toLowerCase().includes(filters.search!.toLowerCase()) ||
            vacancy.employerName.toLowerCase().includes(filters.search!.toLowerCase())
          )
        : vacancies;

      return {
        vacancies: filteredVacancies,
        total,
        lastDoc: snapshot.docs[snapshot.docs.length - 1] || null
      };
    } catch (error) {
      console.error('Error getting vacancies:', error);
      throw this.handleFirestoreError(error as FirestoreError);
    }
  }

  /**
   * Gets a single vacancy by ID
   */
  async getVacancyById(id: string): Promise<ListingType> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Vacancy not found');
      }

      return {
        id: docSnap.id,
        ...docSnap.data()
      } as ListingType;
    } catch (error) {
      console.error('Error getting vacancy:', error);
      throw this.handleFirestoreError(error as FirestoreError);
    }
  }

  /**
   * Gets all available locations from vacancies
   */
  async getAvailableLocations(): Promise<string[]> {
    try {
      const snapshot = await getDocs(collection(db, this.COLLECTION_NAME));
      const locations = new Set<string>();
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.address?.addressLine3) {
          locations.add(data.address.addressLine3);
        }
      });

      return Array.from(locations).sort();
    } catch (error) {
      console.error('Error getting locations:', error);
      throw this.handleFirestoreError(error as FirestoreError);
    }
  }

  /**
   * Gets all available apprenticeship levels
   */
  async getAvailableLevels(): Promise<number[]> {
    try {
      const snapshot = await getDocs(collection(db, this.COLLECTION_NAME));
      const levels = new Set<number>();
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.course?.level) {
          levels.add(data.course.level);
        }
      });

      return Array.from(levels).sort((a, b) => a - b);
    } catch (error) {
      console.error('Error getting levels:', error);
      throw this.handleFirestoreError(error as FirestoreError);
    }
  }

  /**
   * Handles Firestore errors
   */
  private handleFirestoreError(error: FirestoreError): Error {
    // Add specific error handling if needed
    return error;
  }
}

export const vacancyService = new VacancyService();