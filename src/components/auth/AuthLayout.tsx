// src/components/auth/AuthLayout.tsx
import React from 'react';
import SafeShareLogo from '@/components/ui/SafeShareLogo';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-8">
          <SafeShareLogo />
        </div>
        <h2 className="text-center text-3xl font-light text-gray-900 tracking-tight">
          SafeShare
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-6 shadow-xl sm:rounded-2xl sm:px-12 border border-gray-100">
          {children}
        </div>
      </div>
    </div>
  );
}