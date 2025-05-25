// src/components/auth/AuthFlow.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import EmailStep from './EmailStep';
import PasswordStep from './PasswordStep';
import SignUpStep from './SignUpStep';
import OtpStep from './OtpStep';
import { AuthData, AuthStep } from '@/types/auth';
import { AuthService } from '@/lib/authService';
import { setAuthToken } from '@/lib/api';

interface SignupData {
  name: string;
  email: string;
  password: string;
}

export default function AuthFlow() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<AuthStep>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authData, setAuthData] = useState<AuthData>({
    email: '',
    password: '',
    name: '',
    otp: '',
  });
  const [signupData, setSignupData] = useState<SignupData | null>(null);

  // Email step handler - Check if user exists using backend API
  const handleEmailSubmit = async (email: string) => {
    setLoading(true);
    setError('');

    try {
      const result = await AuthService.checkUserExists(email);

      if (result.success && result.data) {
        setAuthData(prev => ({ ...prev, email }));
        
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
  const handlePasswordSubmit = async (password: string) => {
    setLoading(true);
    setError('');

    try {
      const result = await AuthService.login(authData.email, password);

      if (result.success && result.data) {
        // Store the token
        AuthService.setToken(result.data.accessToken);
        setAuthToken(result.data.accessToken);
        
        // Redirect to home page
        router.push('/');
      } else {
        setError(result.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Signup step handler - Send OTP via backend
  const handleSignupSubmit = async (data: SignupData) => {
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
    setLoading(true);
    setError('');

    if (!signupData) {
      setError('Session expired. Please start again.');
      setCurrentStep('email');
      return;
    }

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
        
        if (loginResult.success && loginResult.data) {
          AuthService.setToken(loginResult.data.accessToken);
          // setAuthToken(loginResult.data.accessToken);
          
          // Redirect to home page
          router.push('/');
        } else {
          // If auto-login fails, redirect to login page
          router.push('/login?message=Account created successfully. Please sign in.');
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
  const handleBackToEmail = () => {
    setCurrentStep('email');
    setError('');
  };

  const handleBackToSignup = () => {
    setCurrentStep('signup');
    setError('');
  };

  const handleGoToSignup = () => {
    setCurrentStep('signup');
    setError('');
  };

  const handleGoToSignin = () => {
    setCurrentStep('email');
    setError('');
  };

  // Render current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'email':
        return (
          <EmailStep
            email={authData.email}
            onSubmit={handleEmailSubmit}
            onCreateAccount={handleGoToSignup}
            loading={loading}
            error={error}
            setError={setError}
          />
        );

      case 'password':
        return (
          <PasswordStep
            email={authData.email}
            password={authData.password}
            onSubmit={handlePasswordSubmit}
            onBack={handleBackToEmail}
            loading={loading}
            error={error}
            setError={setError}
          />
        );

      case 'signup':
        return (
          <SignUpStep
            initialData={authData}
            onSubmit={handleSignupSubmit}
            onBack={handleBackToEmail}
            onSignIn={handleGoToSignin}
            loading={loading}
            error={error}
            setError={setError}
          />
        );

      case 'otp':
        return (
          <OtpStep
            email={signupData?.email || ''}
            onSubmit={handleOtpSubmit}
            onBack={handleBackToSignup}
            onResendOtp={handleResendOtp}
            loading={loading}
            error={error}
            setError={setError}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      {renderCurrentStep()}
    </div>
  );
}