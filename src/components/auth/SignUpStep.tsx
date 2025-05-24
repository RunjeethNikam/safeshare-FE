// src/components/auth/SignUpStep.tsx
import { useState } from 'react';
import { StepProps, AuthData } from '@/types/auth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ErrorMessage from '@/components/ui/ErrorMessage';
import BackButton from '@/components/ui/BackButton';

interface SignUpStepProps extends StepProps {
  initialData: AuthData;
  onSubmit: (data: { name: string; email: string; password: string }) => void;
  onBack: () => void;
  onSignIn: () => void;
}

export default function SignUpStep({
  initialData,
  onSubmit,
  onBack,
  onSignIn,
  loading,
  error,
  setError,
}: SignUpStepProps) {
  const [formData, setFormData] = useState({
    name: initialData.name,
    email: initialData.email,
    password: '',
    confirmPassword: '',
  });

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setError('');
    onSubmit({
      name: formData.name,
      email: formData.email,
      password: formData.password,
    });
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <BackButton onClick={onBack} />
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-light text-gray-900 mb-3">
            Create account
          </h2>
          <p className="text-sm text-gray-600">
            Let's get you set up so you can access your personal account.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <Input
          id="name"
          name="name"
          type="text"
          required
          placeholder="Full name"
          value={formData.name}
          onChange={(e) => updateField('name', e.target.value)}
          autoFocus
        />

        <Input
          id="signup-email"
          name="email"
          type="email"
          required
          placeholder="Email"
          value={formData.email}
          onChange={(e) => updateField('email', e.target.value)}
        />

        <Input
          id="signup-password"
          name="password"
          type="password"
          required
          placeholder="Create password"
          value={formData.password}
          onChange={(e) => updateField('password', e.target.value)}
        />

        <Input
          id="confirm-password"
          name="confirmPassword"
          type="password"
          required
          placeholder="Confirm password"
          value={formData.confirmPassword}
          onChange={(e) => updateField('confirmPassword', e.target.value)}
        />

        <ErrorMessage error={error} />

        <Button
          type="submit"
          loading={loading}
          loadingText="Creating account..."
          className="w-full"
        >
          Create account
        </Button>

        <div className="text-center pt-4 border-t border-gray-100">
          <span className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              type="button"
              className="text-blue-600 hover:text-blue-700 hover:underline transition-colors font-medium"
              onClick={onSignIn}
            >
              Sign in
            </button>
          </span>
        </div>
      </div>
    </form>
  );
}