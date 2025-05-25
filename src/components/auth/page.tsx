// src/app/auth/page.tsx
import AuthLayout from '@/components/auth/AuthLayout';
import AuthFlow from '@/components/auth/AuthFlow';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign in to Microsoft',
  description: 'Sign in to your Microsoft account',
};

export default function AuthPage() {
  return (
    <AuthLayout>
      <AuthFlow />
    </AuthLayout>
  );
}