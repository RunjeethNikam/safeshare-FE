// src/services/authService.ts
import type {
  ApiResponse,
  LoginResponse,
  SignUpResponse,
  AuthResult
} from '@/types/auth';

const API_BASE_URL = 'http://localhost:8080/auth';

export class AuthService {
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

  static getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  static setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }
  }

  static removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
    }
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  static logout(): void {
    this.removeToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/auth';
    }
  }
}