// Clean AuthFlow.tsx
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

  // Utility functions
  const resetError = () => setError('');
  
  const handleError = (message: string) => {
    setError(message);
    setLoading(false);
  };

  const goToStep = (step: AuthStep) => {
    setCurrentStep(step);
    resetError();
  };

  // Email step handler
  const handleEmailSubmit = async (email: string) => {
    setLoading(true);
    resetError();

    try {
      const result = await AuthService.checkUserExists(email);

      if (result.success && result.data !== undefined) {
        setAuthData(prev => ({ ...prev, email }));
        setCurrentStep(result.data ? 'password' : 'signup');
      } else {
        handleError(result.error || 'Failed to check user');
      }
    } catch (err) {
      handleError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Password step handler
  const handlePasswordSubmit = async (password: string) => {
    setLoading(true);
    resetError();

    try {
      const result = await AuthService.login(authData.email, password);

      if (result.success && result.data) {
        AuthService.setToken(result.data.accessToken);
        setAuthToken(result.data.accessToken);
        router.push('/');
      } else {
        handleError(result.error || 'Invalid credentials');
      }
    } catch (err) {
      handleError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Signup step handler
  const handleSignupSubmit = async (data: SignupData) => {
    setLoading(true);
    resetError();

    try {
      const result = await AuthService.sendOTP(data.email, 'SIGNUP');

      if (result.success) {
        setSignupData(data);
        setCurrentStep('otp');
      } else {
        handleError(result.error || 'Failed to send verification code');
      }
    } catch (err) {
      handleError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // OTP verification handler
  const handleOtpSubmit = async (otp: string) => {
    if (!signupData) {
      handleError('Session expired. Please start again.');
      return setCurrentStep('email');
    }

    setLoading(true);
    resetError();

    try {
      // Verify OTP
      const otpResult = await AuthService.verifyOTP(signupData.email, otp);
      if (!otpResult.success) {
        return handleError(otpResult.error || 'Invalid verification code');
      }

      // Create user
      const signupResult = await AuthService.signUp(signupData);
      if (!signupResult.success) {
        return handleError(signupResult.error || 'Failed to create account');
      }

      // Auto-login
      const loginResult = await AuthService.login(signupData.email, signupData.password);
      if (loginResult.success && loginResult.data) {
        AuthService.setToken(loginResult.data.accessToken);
        router.push('/');
      } else {
        router.push('/login?message=Account created successfully. Please sign in.');
      }
    } catch (err) {
      handleError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (!signupData) return;

    setLoading(true);
    resetError();

    try {
      const result = await AuthService.sendOTP(signupData.email, 'SIGNUP');
      if (!result.success) {
        handleError(result.error || 'Failed to resend verification code');
      }
    } catch (err) {
      handleError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Render current step
  const renderCurrentStep = () => {
    const commonProps = { loading, error, setError };

    switch (currentStep) {
      case 'email':
        return (
          <EmailStep
            {...commonProps}
            email={authData.email}
            onSubmit={handleEmailSubmit}
            onCreateAccount={() => goToStep('signup')}
          />
        );

      case 'password':
        return (
          <PasswordStep
            {...commonProps}
            email={authData.email}
            password={authData.password}
            onSubmit={handlePasswordSubmit}
            onBack={() => goToStep('email')}
          />
        );

      case 'signup':
        return (
          <SignUpStep
            {...commonProps}
            initialData={authData}
            onSubmit={handleSignupSubmit}
            onBack={() => goToStep('email')}
            onSignIn={() => goToStep('email')}
          />
        );

      case 'otp':
        return (
          <OtpStep
            {...commonProps}
            email={signupData?.email || ''}
            onSubmit={handleOtpSubmit}
            onBack={() => goToStep('signup')}
            onResendOtp={handleResendOtp}
          />
        );

      default:
        return null;
    }
  };

  return <div className="w-full">{renderCurrentStep()}</div>;
}