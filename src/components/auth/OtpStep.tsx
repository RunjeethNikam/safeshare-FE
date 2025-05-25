// src/components/auth/OtpStep.tsx
import { useState, useEffect } from 'react';
import { StepProps } from '@/types/auth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ErrorMessage from '@/components/ui/ErrorMessage';
import BackButton from '@/components/ui/BackButton';

interface OtpStepProps extends StepProps {
  email: string;
  onSubmit: (otp: string) => void;
  onBack: () => void;
  onResendOtp: () => void;
}

export default function OtpStep({
  email,
  onSubmit,
  onBack,
  onResendOtp,
  loading,
  error,
  setError,
}: OtpStepProps) {
  const [otp, setOtp] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp.trim()) {
      setError('Please enter the verification code');
      return;
    }

    if (otp.length !== 6) {
      setError('Verification code must be 6 digits');
      return;
    }

    // Check if OTP contains only numbers
    if (!/^\d{6}$/.test(otp)) {
      setError('Verification code must contain only numbers');
      return;
    }

    setError('');
    onSubmit(otp);
  };

  const handleResend = () => {
    setCanResend(false);
    setCountdown(60);
    setError('');
    onResendOtp();
    
    // Restart the timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatOtp = (value: string) => {
    // Only allow numbers and limit to 6 digits
    const cleaned = value.replace(/\D/g, '').slice(0, 6);
    return cleaned;
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <BackButton onClick={onBack} />
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-light text-gray-900 mb-3">
            Enter verification code
          </h2>
          <p className="text-sm text-gray-600 mb-2">
            We've sent a 6-digit code to
          </p>
          <p className="text-sm font-medium text-gray-900">
            {email}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-center">
          <Input
            id="otp"
            name="otp"
            type="text"
            inputMode="numeric"
            required
            placeholder="000000"
            value={otp}
            onChange={(e) => {
              const formatted = formatOtp(e.target.value);
              setOtp(formatted);
              setError('');
            }}
            autoFocus
            className="text-center text-2xl font-mono tracking-widest w-48"
            maxLength={6}
          />
        </div>

        <ErrorMessage error={error} />

        <Button
          type="submit"
          loading={loading}
          loadingText="Verifying..."
          className="w-full"
          disabled={otp.length !== 6}
        >
          Verify & Create Account
        </Button>

        <div className="text-center pt-4">
          <p className="text-sm text-gray-600 mb-2">
            Didn't receive the code?
          </p>
          {canResend ? (
            <button
              type="button"
              className="text-blue-600 hover:text-blue-700 hover:underline transition-colors font-medium text-sm"
              onClick={handleResend}
              disabled={loading}
            >
              Resend verification code
            </button>
          ) : (
            <p className="text-sm text-gray-500">
              Resend code in {countdown}s
            </p>
          )}
        </div>
      </div>
    </form>
  );
}