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

export default function LoginPage() {
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
  const updateAuthData = (data: Partial<AuthData>) => {
    setAuthData(prev => ({ ...prev, ...data }));
  };

  const resetError = () => setError('');

  const handleError = (message: string) => {
    setError(message);
    setLoading(false);
  };

  // Email step handler
  const handleEmailSubmit = async (email: string) => {
    if (!email?.trim()) {
      return handleError('Please enter your email');
    }

    setLoading(true);
    resetError();

    try {
      const result = await AuthService.checkUserExists(email);
      
      // Debug logging
      console.log('Check user result:', result);

      if (result.success) {
        updateAuthData({ email });
        
        if (result.data === true) {
          console.log('User exists - going to password step');
          setCurrentStep('password');
        } else if (result.data === false) {
          console.log('User does not exist - going to signup step');
          setCurrentStep('signup');
        } else {
          console.log('Unexpected data value:', result.data);
          handleError('Unexpected response from server');
        }
      } else {
        handleError(result.error || 'Failed to check user');
      }
    } catch (err) {
      console.error('Error in handleEmailSubmit:', err);
      handleError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Password step handler (existing users)
  const handlePasswordSubmit = async (password: string) => {
    if (!password?.trim()) {
      return handleError('Please enter your password');
    }

    setLoading(true);
    resetError();

    try {
      const result = await AuthService.login(authData.email, password);
      
      if (result.success && result.data?.accessToken) {
        AuthService.setToken(result.data.accessToken);
        router.push('/');
      } else {
        handleError(result.error || 'Invalid credentials');
      }
    } catch (err) {
      handleError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Signup step handler
  const handleSignUpSubmit = async (data: SignupData) => {
    setLoading(true);
    resetError();

    try {
      const result = await AuthService.sendOTP(data.email, 'SIGNUP');

      if (result.success) {
        setSignupData(data);
        updateAuthData(data);
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
    if (!otp || otp.length !== 6) {
      return handleError('Please enter a valid 6-digit OTP');
    }

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

      // Create user account
      const signupResult = await AuthService.signUp(signupData);
      if (!signupResult.success) {
        return handleError(signupResult.error || 'Failed to create account');
      }

      // Auto-login
      const loginResult = await AuthService.login(signupData.email, signupData.password);
      if (loginResult.success && loginResult.data?.accessToken) {
        AuthService.setToken(loginResult.data.accessToken);
        router.push('/');
      } else {
        setCurrentStep('email');
        handleError('Account created successfully. Please sign in.');
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

  // Navigation handlers
  const goToStep = (step: AuthStep, resetData = false) => {
    setCurrentStep(step);
    resetError();
    if (resetData) {
      setSignupData(null);
      updateAuthData({ name: '', password: '' });
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
            onSubmit={handleSignUpSubmit}
            onBack={() => goToStep('email', true)}
            onSignIn={() => goToStep('email', true)}
          />
        );

      case 'otp':
        return (
          <OtpStep
            {...commonProps}
            email={signupData?.email || authData.email}
            onSubmit={handleOtpSubmit}
            onBack={() => goToStep('signup')}
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