// src/lib/api.ts - Clean version for regular API calls
import axios from "axios";
import { apiBaseUrl } from '@/lib/config';

// Clean base URL configuration
const getBaseURL = () => {
  if (!apiBaseUrl) return 'http://localhost:8080';
  
  // Remove any auth-specific paths to get clean base URL
  return apiBaseUrl
    .replace('/auth', '')
    .replace('/login', '')
    .replace(/\/$/, ''); // Remove trailing slash
};

export const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true, // Include cookies for refresh token
});

// Function to set authorization header
export function setAuthToken(token: string) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Function to remove authorization header
export function removeAuthToken() {
  delete api.defaults.headers.common['Authorization'];
}

// Initialize auth token if it exists (only on client side)
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('accessToken');
  if (token) {
    setAuthToken(token);
  }
}

// Enhanced response interceptor with automatic token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401/403 errors with automatic token refresh
    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Use AuthService to attempt token refresh (handles HttpOnly cookies properly)
        const { AuthService } = await import('@/lib/authService');
        const refreshResult = await AuthService.attemptTokenRefresh();
        
        if (refreshResult.success && refreshResult.data) {
          const newAccessToken = refreshResult.data.accessToken;
          
          // Update token in localStorage and axios headers
          localStorage.setItem('accessToken', newAccessToken);
          setAuthToken(newAccessToken);
          
          // Retry the original request with new token
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }

      // Refresh failed - redirect to login
      handleAuthFailure();
    }

    return Promise.reject(error);
  }
);

// Handle authentication failure
function handleAuthFailure() {
  if (typeof window !== 'undefined') {
    // Clear all auth data
    localStorage.removeItem('accessToken');
    removeAuthToken();
    
    // Redirect to login page
    const currentPath = window.location.pathname;
    if (currentPath !== '/login') {
      window.location.href = '/login';
    }
  }
}

// Request interceptor to ensure fresh token
api.interceptors.request.use(
  async (config) => {
    // Only add token for non-auth endpoints to avoid conflicts
    if (!config.url?.includes('/auth/')) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Export utility function for manual token refresh
export async function refreshAuthToken(): Promise<boolean> {
  try {
    const { AuthService } = await import('@/lib/authService');
    const refreshResult = await AuthService.attemptTokenRefresh();
    
    if (refreshResult.success && refreshResult.data) {
      localStorage.setItem('accessToken', refreshResult.data.accessToken);
      setAuthToken(refreshResult.data.accessToken);
      return true;
    }

    handleAuthFailure();
    return false;
  } catch (error) {
    console.error('Manual token refresh failed:', error);
    handleAuthFailure();
    return false;
  }
}

// Export function to check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  try {
    const { AuthService } = await import('@/lib/authService');
    return await AuthService.isAuthenticated();
  } catch (error) {
    console.error('Auth check failed:', error);
    return false;
  }
}