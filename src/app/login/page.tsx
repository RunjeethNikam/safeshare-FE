'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import EmailStep from '@/components/auth/EmailStep';
import PasswordStep from '@/components/auth/PasswordStep';
import SignUpStep from '@/components/auth/SignUpStep';
import OtpStep from '@/components/auth/OtpStep';
import AuthLayout from '@/components/auth/AuthLayout';
import { AuthService } from '@/lib/auth';
import type { AuthStep, AuthData } from '@/types/auth';
import { setAuthToken } from '@/lib/api';

export default function LoginPage() {
  const [currentStep, setCurrentStep] = useState<AuthStep>('email');
  const [authData, setAuthData] = useState<AuthData>({
    email: '',
    password: '',
    name: '',
    otp: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const updateAuthData = (data: Partial<AuthData>) => {
    setAuthData(prev => ({ ...prev, ...data }));
  };

  const handleEmailSubmit = async (email: string) => {
    if (!email) {
      setError('Please enter your email');
      return;
    }
    updateAuthData({ email });
    setError('');
    setCurrentStep('password');
  };

  const handleSignInSubmit = async (password: string) => {
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await AuthService.login(authData.email, password);
      
      if (result.success && result.data?.accessToken) {
        localStorage.setItem('accessToken', result.data.accessToken);
        setAuthToken(result.data.accessToken)
        router.push('/');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpSubmit = async (signUpData: { name: string; email: string; password: string }) => {
    setLoading(true);
    setError('');

    try {
      const result = await AuthService.signUp(signUpData);
      
      if (result.success && result.data) {
        updateAuthData(signUpData);
        setCurrentStep('otp');
        setError('');
      } else {
        setError(result.error || 'Sign up failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (otp: string) => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    // Simulate OTP verification - replace with actual API call
    setTimeout(() => {
      setLoading(false);
      router.push('/');
    }, 2000);
  };

  const resetToEmail = () => {
    setCurrentStep('email');
    updateAuthData({ password: '' });
    setError('');
  };

  const switchToSignUp = () => {
    setCurrentStep('signup');
    setError('');
  };

  const switchToSignIn = () => {
    setCurrentStep('email');
    updateAuthData({ name: '', password: '' });
    setError('');
  };

  const renderCurrentStep = () => {
    const commonProps = {
      loading,
      error,
      setError,
    };

    switch (currentStep) {
      case 'email':
        return (
          <EmailStep
            {...commonProps}
            email={authData.email}
            onSubmit={handleEmailSubmit}
            onCreateAccount={switchToSignUp}
          />
        );
      case 'password':
        return (
          <PasswordStep
            {...commonProps}
            email={authData.email}
            password={authData.password}
            onSubmit={handleSignInSubmit}
            onBack={resetToEmail}
          />
        );
      case 'signup':
        return (
          <SignUpStep
            {...commonProps}
            initialData={authData}
            onSubmit={handleSignUpSubmit}
            onBack={switchToSignIn}
            onSignIn={switchToSignIn}
          />
        );
      case 'otp':
        return (
          <OtpStep
            {...commonProps}
            email={authData.email}
            otp={authData.otp}
            onSubmit={handleOtpSubmit}
          />
        );
      default:
        return null;
    }
  };

  return (
    <AuthLayout>
      {renderCurrentStep()}
    </AuthLayout>
  );
}