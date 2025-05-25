'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import EmailStep from '@/components/auth/EmailStep';
import PasswordStep from '@/components/auth/PasswordStep';
import SignUpStep from '@/components/auth/SignUpStep';
import OtpStep from '@/components/auth/OtpStep';
import AuthLayout from '@/components/auth/AuthLayout';
import { AuthService } from '@/lib/authService';
import type { AuthStep, AuthData } from '@/types/auth';

interface SignupData {
  name: string;
  email: string;
  password: string;
}

// This must be the default export for Next.js pages
export default function LoginPage() {
  const [currentStep, setCurrentStep] = useState<AuthStep>('email');
  const [authData, setAuthData] = useState<AuthData>({
    email: '',
    password: '',
    name: '',
    otp: '',
  });
  const [signupData, setSignupData] = useState<SignupData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const updateAuthData = (data: Partial<AuthData>) => {
    setAuthData(prev => ({ ...prev, ...data }));
  };

  // Email step handler - Check if user exists using backend API
  const handleEmailSubmit = async (email: string) => {
    if (!email) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await AuthService.checkUserExists(email);

      if (result.success && result.data) {
        updateAuthData({ email });
        
        if (result.data.exists) {
          setCurrentStep('password');
        } else {
          setCurrentStep('signup');
        }
      } else {
        setError(result.error || 'Failed to check user');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Password step handler (for existing users)
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
        AuthService.setToken(result.data.accessToken);
        // Redirect to home page instead of /media
        router.push('/');
      } else {
        setError(result.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Signup step handler - Send OTP via backend
  const handleSignUpSubmit = async (data: SignupData) => {
    setLoading(true);
    setError('');

    try {
      // Send OTP via your backend API
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          type: 'signup',
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSignupData(data);
        updateAuthData(data);
        setCurrentStep('otp');
      } else {
        setError(result.error || 'Failed to send verification code');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // OTP verification handler - Verify OTP and create user via backend
  const handleOtpSubmit = async (otp: string) => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    if (!signupData) {
      setError('Session expired. Please start again.');
      setCurrentStep('email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // First verify OTP
      const otpResponse = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: signupData.email,
          otp,
        }),
      });

      const otpResult = await otpResponse.json();

      if (!otpResponse.ok) {
        setError(otpResult.error || 'Invalid verification code');
        return;
      }

      // If OTP is valid, create user via backend API
      const signupResult = await AuthService.signUp({
        name: signupData.name,
        email: signupData.email,
        password: signupData.password,
        verified: true,
      });

      if (signupResult.success) {
        // Now login the user automatically
        const loginResult = await AuthService.login(signupData.email, signupData.password);
        
        if (loginResult.success && loginResult.data?.accessToken) {
          AuthService.setToken(loginResult.data.accessToken);
          // Redirect to home page instead of /media
          router.push('/');
        } else {
          // If auto-login fails, redirect to login page
          setCurrentStep('email');
          setError('Account created successfully. Please sign in.');
        }
      } else {
        setError(signupResult.error || 'Failed to create account');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (!signupData) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: signupData.email,
          type: 'signup',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Failed to resend verification code');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Navigation handlers
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
    setSignupData(null);
    setError('');
  };

  const handleBackToSignup = () => {
    setCurrentStep('signup');
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
            email={signupData?.email || authData.email}
            onSubmit={handleOtpSubmit}
            onBack={handleBackToSignup}
            onResendOtp={handleResendOtp}
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