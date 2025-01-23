import { jwtDecode } from 'jwt-decode';
import { userService } from '../firebase/userService';
import { auth } from '../../config/firebase';
import { signInWithCredential, GoogleAuthProvider } from 'firebase/auth';

interface GoogleUser {
  email: string;
  name: string;
  picture: string;
  sub: string;
}

export class GoogleAuthService {
  private static clientId = '423840207023-6r1aqpq3852onbj0s8tgrd0ic8llud3c.apps.googleusercontent.com';
  private static tokenKey = 'auth_token';
  private static userKey = 'user_data';

  static getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  static isAuthenticated(): boolean {
    return auth.currentUser !== null;
  }

  static async handleCredentialResponse(response: any) {
    const token = response.credential;

    if (!token) {
      throw new Error('No token received from Google');
    }

    const decodedUser: GoogleUser = jwtDecode(token);

    // Ensure that you're using the ID token for Firebase auth
    const credential = GoogleAuthProvider.credential(token);

    try {
      // Sign in to Firebase with the Google credential
      const userCredential = await signInWithCredential(auth, credential);
      const firebaseUser = userCredential.user;

      // Store the token and user data locally
      localStorage.setItem(this.tokenKey, token);
      const userData = {
        email: decodedUser.email,
        name: decodedUser.name,
        picture: decodedUser.picture,
        id: firebaseUser.uid,
        lastLogin: new Date().toISOString(),
      };
      localStorage.setItem(this.userKey, JSON.stringify(userData));  // Store user data in localStorage

      // Save user data to Firebase
      await userService.saveUserProfile(firebaseUser.uid, {
        ...userData,
        createdAt: new Date().toISOString(),
      });

      return decodedUser;
    } catch (error) {
      console.error('Firebase authentication failed:', error);
      throw error;
    }
  }

  static async logout() {
    const userId = auth.currentUser?.uid;
    if (userId) {
      try {
        await userService.saveUserProfile(userId, {
          lastLogout: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Failed to update logout time:', error);
      }
    }

    await auth.signOut();
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    window.location.href = '/';
  }

  static getCurrentUser() {
    return auth.currentUser;
  }
}