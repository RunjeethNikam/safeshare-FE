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
    name: initialData.name || '',
    email: initialData.email || '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validatePassword = (password: string) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    return {
      isValid: Object.values(requirements).every(Boolean),
      requirements,
    };
  };

  const passwordValidation = validatePassword(formData.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!formData.email.trim()) {
      setError('Please enter your email');
      return;
    }

    if (!formData.password) {
      setError('Please enter a password');
      return;
    }

    if (!formData.confirmPassword) {
      setError('Please confirm your password');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!passwordValidation.isValid) {
      setError('Password does not meet requirements');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    
    // Pass data to parent component which will handle OTP sending
    onSubmit({
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
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

        <div className="relative">
          <Input
            id="signup-password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            placeholder="Create password"
            value={formData.password}
            onChange={(e) => updateField('password', e.target.value)}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>

        {formData.password && (
          <div className="text-xs space-y-1 px-3 py-2 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-700 mb-2">Password requirements:</p>
            <div className="grid grid-cols-1 gap-1">
              <div className={`flex items-center gap-2 ${passwordValidation.requirements.length ? 'text-green-600' : 'text-gray-500'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${passwordValidation.requirements.length ? 'bg-green-500' : 'bg-gray-300'}`} />
                At least 8 characters
              </div>
              <div className={`flex items-center gap-2 ${passwordValidation.requirements.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${passwordValidation.requirements.uppercase ? 'bg-green-500' : 'bg-gray-300'}`} />
                One uppercase letter
              </div>
              <div className={`flex items-center gap-2 ${passwordValidation.requirements.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${passwordValidation.requirements.lowercase ? 'bg-green-500' : 'bg-gray-300'}`} />
                One lowercase letter
              </div>
              <div className={`flex items-center gap-2 ${passwordValidation.requirements.number ? 'text-green-600' : 'text-gray-500'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${passwordValidation.requirements.number ? 'bg-green-500' : 'bg-gray-300'}`} />
                One number
              </div>
              <div className={`flex items-center gap-2 ${passwordValidation.requirements.special ? 'text-green-600' : 'text-gray-500'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${passwordValidation.requirements.special ? 'bg-green-500' : 'bg-gray-300'}`} />
                One special character
              </div>
            </div>
          </div>
        )}

        <div className="relative">
          <Input
            id="confirm-password"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            required
            placeholder="Confirm password"
            value={formData.confirmPassword}
            onChange={(e) => updateField('confirmPassword', e.target.value)}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>

        {formData.confirmPassword && formData.password !== formData.confirmPassword && (
          <p className="text-xs text-red-600 px-3">
            Passwords do not match
          </p>
        )}

        <ErrorMessage error={error} />

        <Button
          type="submit"
          loading={loading}
          loadingText="Sending verification code..."
          className="w-full"
          disabled={!passwordValidation.isValid || formData.password !== formData.confirmPassword}
        >
          Continue
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