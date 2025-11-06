import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { apiService } from '@/services/api';
import { useNoBackNavigation } from '@/hooks/useNoBackNavigation';


export const VerifyOtpPage: React.FC = () => {
  const { verifyOtp, verifyLoginOtp } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();

  const email = (location.state?.email as string) || '';
  const isLogin = location.state?.isLogin || false;
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!email) {
      // Replace history to prevent back navigation
      navigate('/register', { replace: true });
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [email, navigate]);

  useNoBackNavigation({ clearSession: true });

  useEffect(() => {
    if (resendTimer > 0) {
      timerRef.current = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [resendTimer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (code.length !== 6) {
      setError(t('auth.otp.invalidCode'));
      return;
    }

    setIsLoading(true);

    try {
      // Use different verification method based on flow (login or registration)
      if (isLogin) {
        await verifyLoginOtp(email, code);
      } else {
        await verifyOtp(email, code);
      }
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.otp.invalidCode'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const response = await apiService.resendOtp(email);
      if (response.success) {
        setResendTimer(60);
      } else {
        setError(response.error || 'Failed to resend OTP');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend OTP');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted px-4">
        <div className="w-full max-w-md text-center">
          <div className="mb-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold">{t('auth.otp.verificationSuccess')}</h1>
            <p className="text-muted-foreground mt-2">{t('common.loading')}</p>
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
          <h1 className="text-3xl font-bold">{t('auth.otp.title')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('auth.otp.subtitle').replace('{{email}}', email)}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive" role="alert">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="code">{t('auth.otp.code')}</Label>
            <InputOTP
              value={code}
              onChange={setCode}
              maxLength={6}
              disabled={isLoading}
              autoFocus
              aria-label={t('auth.otp.enterCode')}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <p className="text-xs text-muted-foreground text-center mt-2">
              {t('auth.otp.enterCode')}
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || code.length !== 6}
            aria-busy={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('auth.otp.submit')}
          </Button>
        </form>

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t('auth.otp.resend')}</span>
            <button
              onClick={handleResend}
              disabled={resendTimer > 0 || isLoading}
              className="text-primary hover:underline font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={t('auth.otp.resend')}
            >
              {resendTimer > 0
                ? t('auth.otp.resendTimer').replace('{{time}}', resendTimer.toString())
                : t('auth.otp.resend')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtpPage;
