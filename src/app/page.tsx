// src/app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import HomePage from "@/components/home_page/HomePage";
import { AuthService } from '@/lib/authService';

export default function App() {
 const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const accessToken = AuthService.getToken();
        
        if (accessToken) {
          setIsAuthenticated(true);
          return;
        }
        
        const refreshResult = await AuthService.attemptTokenRefresh();
        
        if (refreshResult.success) {
          setIsAuthenticated(true);
        } else {
          router.replace('/login');
        }
        
      } catch (error) {
        console.error('Auth check failed:', error);
        router.replace('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-3 text-gray-600">Checking authentication...</p>
      </div>
    );
  }

  // Show home page only if authenticated
  if (isAuthenticated) {
    return <HomePage />;
  }

  // Return null while redirecting
  return null;
}