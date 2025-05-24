// src/lib/auth.ts
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

      if (data.error) {
        return {
          success: false,
          error: data.error.message,
        };
      }

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
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

      if (data.error) {
        return {
          success: false,
          error: data.error.message,
        };
      }

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please try again.',
      };
    }
  }

  static async verifyOtp(email: string, otp: string): Promise<AuthResult> {
    // TODO: Implement actual OTP verification API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: { verified: true },
        });
      }, 2000);
    });
  }

  static getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  static removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
    }
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }
}