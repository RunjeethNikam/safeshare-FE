// src/app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import HomePage from "@/components/home_page/HomePage";
import { setAuthToken } from '@/lib/api';
import { AuthService } from '@/lib/authService';

export default function App() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const checkAuth = () => {
      const token = AuthService.getToken();
      
      if (!token) {
        // No token found, redirect to auth page
        router.replace('/login');
      } else {
        // Token exists, set it in API headers and show home page
        setAuthToken(token);
        setIsAuthenticated(true);
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show home page only if authenticated
  if (isAuthenticated) {
    return <HomePage />;
  }

  // Return null while redirecting (loading state handles the UI)
  return null;
}