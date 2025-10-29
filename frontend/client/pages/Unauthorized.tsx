import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/contexts/I18nContext';
import { Button } from '@/components/ui/button';
import { Lock, ArrowLeft } from 'lucide-react';

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted px-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="inline-block p-4 bg-destructive/10 rounded-lg">
          <Lock className="h-12 w-12 text-destructive" />
        </div>
        <h1 className="text-3xl font-bold">{t('errors.forbidden')}</h1>
        <p className="text-muted-foreground">
          {t('errors.unauthorized')}
        </p>
        <Button onClick={() => navigate('/dashboard')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
