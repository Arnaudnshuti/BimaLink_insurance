import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  const [step, setStep] = useState<'role' | 'form'>('role');
  const [formData, setFormData] = useState({
    role: 'agent' as 'agent' | 'customer',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRoleSelect = (role: 'agent' | 'customer') => {
    setFormData(prev => ({ ...prev, role }));
    setStep('form');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!formData.agreeTerms) {
      setError('You must accept the Terms and Privacy Policy');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/verify-otp', { state: { email: formData.email } });
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted px-4">
        <div className="w-full max-w-md text-center">
          <div className="mb-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold">{t('auth.register.registrationSuccess')}</h1>
            <p className="text-muted-foreground mt-2">{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'role') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold text-lg mx-auto mb-4">
              B
            </div>
            <h1 className="text-3xl font-bold">{t('auth.register.selectRole')}</h1>
            <p className="text-muted-foreground mt-2">{t('auth.register.selectRoleMessage')}</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleRoleSelect('agent')}
              className="w-full p-6 border-2 border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-left"
              aria-label={t('auth.register.agent')}
            >
              <h3 className="font-bold text-lg">{t('auth.register.agent')}</h3>
              <p className="text-sm text-muted-foreground mt-1">{t('nav.dashboard')}</p>
            </button>

            <button
              onClick={() => handleRoleSelect('customer')}
              className="w-full p-6 border-2 border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-left"
              aria-label={t('auth.register.customer')}
            >
              <h3 className="font-bold text-lg">{t('auth.register.customer')}</h3>
              <p className="text-sm text-muted-foreground mt-1">{t('nav.policies')}</p>
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              {t('auth.register.accountExists')}{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-primary hover:underline font-medium"
              >
                {t('auth.register.loginHere')}
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold text-lg mx-auto mb-4">
            B
          </div>
          <h1 className="text-3xl font-bold">{t('auth.register.title')}</h1>
          <p className="text-muted-foreground mt-2">{t('auth.register.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive" role="alert">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="Enter your first name"
                value={formData.firstName}
                onChange={handleChange}
                disabled={isLoading}
                autoComplete="given-name"
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Enter your last name"
                value={formData.lastName}
                onChange={handleChange}
                disabled={isLoading}
                autoComplete="family-name"
                maxLength={50}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
              disabled={isLoading}
              autoComplete="tel"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={isLoading}
              autoComplete="new-password"
            />
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="agreeTerms"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onCheckedChange={() =>
                setFormData(prev => ({
                  ...prev,
                  agreeTerms: !prev.agreeTerms,
                }))
              }
              disabled={isLoading}
            />
            <Label htmlFor="agreeTerms" className="font-normal cursor-pointer text-sm">
              I agree to the Terms of Service and Privacy Policy
            </Label>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('auth.register.submit')}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-muted-foreground">
            {t('auth.register.accountExists')}{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              {t('auth.register.loginHere')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
