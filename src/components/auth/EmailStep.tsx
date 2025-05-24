// src/components/auth/EmailStep.tsx
import { useState } from 'react';
import { StepProps } from '@/types/auth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ErrorMessage from '@/components/ui/ErrorMessage';

interface EmailStepProps extends StepProps {
  email: string;
  onSubmit: (email: string) => void;
  onCreateAccount: () => void;
}

export default function EmailStep({
  email: initialEmail,
  onSubmit,
  onCreateAccount,
  loading,
  error,
  setError,
}: EmailStepProps) {
  const [email, setEmail] = useState(initialEmail);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    onSubmit(email);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="text-center">
        <h2 className="text-2xl font-light text-gray-900 mb-3">
          Sign in
        </h2>
        <p className="text-sm text-gray-600 mb-8">
          to continue to your account
        </p>
      </div>

      <div className="space-y-4">
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="Email, phone, or Skype"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="text-base"
        />

        <ErrorMessage error={error} />

        <div className="flex items-center justify-between">
          <button
            type="button"
            className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
            onClick={onCreateAccount}
          >
            Create account
          </button>
        </div>

        <Button
          type="submit"
          loading={loading}
          className="w-full"
        >
          Next
        </Button>
      </div>
    </form>
  );
}