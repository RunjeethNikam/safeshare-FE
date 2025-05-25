// src/app/auth/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthFlow from '@/components/auth/AuthFlow';
import { AuthService } from '@/lib/authService';
import { Metadata } from 'next';

// Note: Metadata export doesn't work with 'use client', so we'll handle this differently
// export const metadata: Metadata = {
//   title: 'Sign in to SafeShare',
//   description: 'Sign in to your SafeShare account',
// };

export default function AuthPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // If user is already authenticated, redirect to home
    const checkAuth = () => {
      if (AuthService.isAuthenticated()) {
        router.replace('/');
      } else {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Show loading while checking auth
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