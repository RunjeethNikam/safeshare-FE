// src/lib/authService.ts
import type {
  ApiResponse,
  LoginResponse,
  SignUpResponse,
  AuthResult
} from '@/types/auth';
import { apiBaseUrl } from '@/lib/config';

const API_BASE_URL = apiBaseUrl || 'http://localhost:8080/auth';

export class AuthService {
  // Authentication API calls
  static async login(email: string, password: string): Promise<AuthResult<LoginResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data: ApiResponse<LoginResponse> = await response.json();

      if (response.ok && data.data) {
        return {
          success: true,
          data: data.data,
        };
      } else {
        return {
          success: false,
          error: data.error?.message || 'Invalid email or password',
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.',
      };
    }
  }

  static async signUp(userData: {
    name: string;
    email: string;
    password: string;
    verified?: boolean;
  }): Promise<AuthResult<SignUpResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}/signUp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data: ApiResponse<SignUpResponse> = await response.json();

      if (response.ok && data.data) {
        return {
          success: true,
          data: data.data,
        };
      } else {
        return {
          success: false,
          error: data.error?.message || 'Failed to create account',
        };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.',
      };
    }
  }

  static async checkUserExists(email: string): Promise<AuthResult<{ exists: boolean }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/check-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: { exists: data.data || false },
        };
      } else {
        return {
          success: false,
          error: data.error?.message || 'Failed to check user',
        };
      }
    } catch (error) {
      console.error('Check user error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.',
      };
    }
  }

  // Token management methods
  static getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  static setToken(token: string): void {
    if (typeof window !== 'undefined') {
      // Save to localStorage
      localStorage.setItem('accessToken', token);
      
      // Dynamically import and set axios header to avoid circular dependency
      import('@/lib/api').then(({ setAuthToken }) => {
        setAuthToken(token);
      }).catch(error => {
        console.error('Failed to set auth token in api:', error);
      });
    }
  }

  static removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      
      // Dynamically import and remove axios header to avoid circular dependency
      import('@/lib/api').then(({ removeAuthToken }) => {
        removeAuthToken();
      }).catch(error => {
        console.error('Failed to remove auth token from api:', error);
      });
    }
  }

  // Authentication state methods
  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  static logout(): void {
    this.removeToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  // Utility methods
  static getApiUrl(): string {
    return API_BASE_URL;
  }
}