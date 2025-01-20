import { jwtDecode } from 'jwt-decode';
import { userService } from '../firebase/userService';

interface GoogleUser {
  email: string;
  name: string;
  picture: string;
  sub: string; // Google's user ID
}

export class GoogleAuthService {
  private static clientId = '423840207023-6r1aqpq3852onbj0s8tgrd0ic8llud3c.apps.googleusercontent.com';
  private static tokenKey = 'auth_token';
  private static userKey = 'user_data';

  static getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  static isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decodedToken: any = jwtDecode(token);
      return decodedToken.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  static async handleCredentialResponse(response: any) {
    const token = response.credential;
    const decodedUser: GoogleUser = jwtDecode(token);

    // Store the token and user data locally
    localStorage.setItem(this.tokenKey, token);
    const userData = {
      email: decodedUser.email,
      name: decodedUser.name,
      picture: decodedUser.picture,
      id: decodedUser.sub,
      lastLogin: new Date().toISOString()
    };
    localStorage.setItem(this.userKey, JSON.stringify(userData));

    // Save user data to Firebase
    try {
      await userService.saveUserProfile(decodedUser.sub, {
        ...userData,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to save user data to Firebase:', error);
      // Still return the user even if Firebase save fails
      // This ensures the user can still use the app
    }

    return decodedUser;
  }

  static async logout() {
    const userId = this.getCurrentUser()?.id;
    if (userId) {
      try {
        // Update last logout time in Firebase
        await userService.saveUserProfile(userId, {
          lastLogout: new Date().toISOString()
        });
      } catch (error) {
        console.error('Failed to update logout time:', error);
      }
    }

    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    window.location.href = '/';
  }

  static getCurrentUser() {
    const userData = localStorage.getItem(this.userKey);
    return userData ? JSON.parse(userData) : null;
  }
}