// src/lib/api.ts
import axios from "axios";
import { apiBaseUrl } from '@/lib/config';

// Remove /auth from baseURL since config includes it
const baseURL = apiBaseUrl ? apiBaseUrl.replace('/login', '') : 'http://localhost:8080';

export const api = axios.create({
  baseURL: baseURL,
});

// Function to set authorization header
export function setAuthToken(token: string) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Function to remove authorization header
export function removeAuthToken() {
  delete api.defaults.headers.common['Authorization'];
}

// Set auth token if it exists (only on client side)
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('accessToken');
  if (token) {
    setAuthToken(token);
  }
}

// Response interceptor for handling auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Remove token from localStorage and API headers
      if (typeof window !== "undefined") {
        localStorage.removeItem('accessToken');
        removeAuthToken();
        
        // Redirect to auth page (FIXED: was /login, now /auth)
        const origin = window.location.origin;
        window.location.href = `${origin}/login`;
      }
    }
    return Promise.reject(error);
  }
);