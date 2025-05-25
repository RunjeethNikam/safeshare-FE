// src/lib/api.ts
import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8080",
});

const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
if (token) {
  setAuthToken(token);
}


export function setAuthToken(token: string) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      if (typeof window !== "undefined") {
        const origin = window.location.origin;
        window.location.href = `${origin}/login`;
      }
    }
    return Promise.reject(error)
  }
);
