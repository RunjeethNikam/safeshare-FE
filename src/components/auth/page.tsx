// src/app/auth/page.tsx - Fixed for async authentication
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthFlow from '@/components/auth/AuthFlow';
import { AuthService } from '@/lib/authService';

export default function AuthPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Use async authentication check
        const isAuthenticated = await AuthService.isAuthenticated();
        
        if (isAuthenticated) {
          router.replace('/');
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AuthLayout>
      <AuthFlow />
    </AuthLayout>
  );
}