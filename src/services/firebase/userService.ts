import { db } from '../../config/firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';

export const userService = {
  // Create or update user profile
  async saveUserProfile(userId: string, userData: any) {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...userData,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  },

  // Get user profile
  async getUserProfile(userId: string) {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? userSnap.data() : null;
  },

  // Save apprenticeship bookmark
  async bookmarkApprenticeship(userId: string, apprenticeshipId: string) {
    const bookmarkRef = doc(db, 'bookmarks', `${userId}_${apprenticeshipId}`);
    await setDoc(bookmarkRef, {
      userId,
      apprenticeshipId,
      createdAt: new Date().toISOString()
    });
  },

  // Get user's bookmarked apprenticeships
  async getBookmarkedApprenticeships(userId: string) {
    const bookmarksRef = collection(db, 'bookmarks');
    const q = query(bookmarksRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data());
  }
};