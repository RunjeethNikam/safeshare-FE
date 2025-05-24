// src/components/auth/OtpStep.tsx
import { useState } from 'react';
import { StepProps } from '@/types/auth';
import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/ui/ErrorMessage';

interface OtpStepProps extends StepProps {
  email: string;
  otp: string;
  onSubmit: (otp: string) => void;
}

export default function OtpStep({
  email,
  otp: initialOtp,
  onSubmit,
  loading,
  error,
  setError,
}: OtpStepProps) {
  const [otp, setOtp] = useState(initialOtp);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    onSubmit(otp);
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    setError('');
  };

  const handleResendCode = () => {
    // TODO: Implement resend OTP functionality
    console.log('Resending OTP to:', email);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="text-center">
        <h2 className="text-2xl font-light text-gray-900 mb-3">
          Verify your email
        </h2>
        <p className="text-sm text-gray-600 mb-2">
          We've sent a verification code to
        </p>
        <p className="text-sm text-blue-600 font-medium break-all mb-8">
          {email}
        </p>
        <p className="text-sm text-gray-600">
          Please enter the code below.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-center">
          <input
            id="otp"
            name="otp"
            type="text"
            maxLength={6}
            required
            placeholder="000000"
            className="w-48 px-4 py-4 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-2xl tracking-[0.5em] font-mono"
            value={otp}
            onChange={handleOtpChange}
            autoFocus
          />
        </div>

        <ErrorMessage error={error} />

        <div className="text-center">
          <button
            type="button"
            className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
            onClick={handleResendCode}
          >
            Didn't receive the code? Resend
          </button>
        </div>

        <Button
          type="submit"
          loading={loading}
          loadingText="Verifying..."
          disabled={otp.length !== 6}
          className="w-full"
        >
          Verify
        </Button>
      </div>
    </form>
  );
}