// src/types/auth.ts
export type AuthStep = 'email' | 'password' | 'signup' | 'otp';

export interface AuthData {
  email: string;
  password: string;
  name: string;
  otp: string;
}

export interface ApiResponse<T = any> {
  timeStamp: string;
  data: T | null;
  error: {
    status: string;
    message: string;
    subErrors: null;
  } | null;
}

export interface LoginResponse {
  accessToken: string;
}

export interface SignUpResponse {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

// Fix: Change data to accept both null and undefined
export interface AuthResult<T = any> {
  success: boolean;
  data?: T | null;  // This allows both undefined and null
  error?: string;
}

export interface StepProps {
  loading: boolean;
  error: string;
  setError: (error: string) => void;
}