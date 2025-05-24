// src/components/auth/PasswordStep.tsx
import { useState } from 'react';
import { StepProps } from '@/types/auth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ErrorMessage from '@/components/ui/ErrorMessage';
import BackButton from '@/components/ui/BackButton';

interface PasswordStepProps extends StepProps {
  email: string;
  password: string;
  onSubmit: (password: string) => void;
  onBack: () => void;
}

export default function PasswordStep({
  email,
  password: initialPassword,
  onSubmit,
  onBack,
  loading,
  error,
  setError,
}: PasswordStepProps) {
  const [password, setPassword] = useState(initialPassword);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    onSubmit(password);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <BackButton onClick={onBack} />
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-light text-gray-900 mb-3">
            Enter password
          </h2>
          <p className="text-sm text-blue-600 font-medium break-all">
            {email}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="text-base"
          autoFocus
        />

        <ErrorMessage error={error} />

        <div>
          <button
            type="button"
            className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
          >
            Forgot password?
          </button>
        </div>

        <Button
          type="submit"
          loading={loading}
          loadingText="Signing in..."
          className="w-full"
        >
          Sign in
        </Button>
      </div>
    </form>
  );
}