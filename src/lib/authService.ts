// Clean AuthService for HttpOnly cookies
import type { LoginResponse, SignUpResponse, AuthResult } from '@/types/auth';
import { apiBaseUrl } from '@/lib/config';

const API_BASE_URL = apiBaseUrl || 'http://localhost:8080/auth';

// API Response interface matching your backend exactly
interface ApiResponse<T = any> {
  timeStamp: string;
  data: T | null;
  error: {
    status: string;
    message: string;
    subErrors: string[] | null;
  } | null;
}

// Base API call function
const apiCall = async <T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<AuthResult<T>> => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    });

    const data: ApiResponse<T> = await response.json();

    if (response.ok && data.data !== null) {
      return { success: true, data: data.data };
    } else {
      return { 
        success: false, 
        error: data.error?.message || 'Request failed' 
      };
    }
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    return { 
      success: false, 
      error: 'Network error. Please try again.' 
    };
  }
};

export class AuthService {
  // Check if user exists
  static async checkUserExists(email: string): Promise<AuthResult<boolean>> {
    try {
      const response = await fetch(`${API_BASE_URL}/check-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const result: ApiResponse<boolean> = await response.json();

      if (response.ok) {
        return { 
          success: true, 
          data: result.data !== null ? result.data : false 
        };
      } else {
        return { 
          success: false, 
          error: result.error?.message || 'Failed to check user' 
        };
      }
    } catch (error) {
      console.error('Check user error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  }

  // Authentication
  static async login(email: string, password: string): Promise<AuthResult<LoginResponse>> {
    return apiCall<LoginResponse>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  static async signUp(userData: {
    name: string;
    email: string;
    password: string;
  }): Promise<AuthResult<SignUpResponse>> {
    return apiCall<SignUpResponse>('/signUp', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // OTP operations
  static async sendOTP(
    email: string, 
    type: 'SIGNUP' | 'PASSWORD_RESET' = 'SIGNUP'
  ): Promise<AuthResult<{ message: string }>> {
    return apiCall<{ message: string }>('/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email, type }),
    });
  }

  static async verifyOTP(
    email: string, 
    otp: string
  ): Promise<AuthResult<{ message: string; verified: boolean }>> {
    return apiCall<{ message: string; verified: boolean }>('/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  }

  // Token management
  static getToken(): string | null {
    return typeof window !== 'undefined' 
      ? localStorage.getItem('accessToken') 
      : null;
  }

  static getRefreshTokenFromCookie(): string | null {
    return null; // Cannot read HttpOnly cookies from JavaScript
  }

  static setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
      
      import('@/lib/api').then(({ setAuthToken }) => {
        setAuthToken(token);
      }).catch(console.error);
    }
  }

  static removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      
      import('@/lib/api').then(({ removeAuthToken }) => {
        removeAuthToken();
      }).catch(console.error);
    }
  }

  // Auth check with HttpOnly cookie support
  static async isAuthenticated(): Promise<boolean> {
    const accessToken = this.getToken();
    
    if (accessToken) {
      return true;
    }
    
    const refreshResult = await this.attemptTokenRefresh();
    return refreshResult.success;
  }

  // Attempt token refresh using HttpOnly cookie
  static async attemptTokenRefresh(): Promise<AuthResult<LoginResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data: ApiResponse<LoginResponse> = await response.json();

      if (response.ok && data.data) {
        this.setToken(data.data.accessToken);
        return { success: true, data: data.data };
      } else {
        return { 
          success: false, 
          error: data.error?.message || 'Token refresh failed' 
        };
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      return { 
        success: false, 
        error: 'Network error during token refresh' 
      };
    }
  }

  static async logout(): Promise<void> {
    try {
      await apiCall('/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.removeToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }

  // Ensure valid token for HttpOnly cookies
  static async ensureValidToken(): Promise<boolean> {
    const accessToken = this.getToken();
    
    if (accessToken) {
      return true;
    }
    
    const refreshResult = await this.attemptTokenRefresh();
    return refreshResult.success;
  }

  // Legacy method compatibility
  static async refreshToken(): Promise<AuthResult<LoginResponse>> {
    return this.attemptTokenRefresh();
  }
}