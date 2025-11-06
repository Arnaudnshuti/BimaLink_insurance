import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/contexts/I18nContext';
import { Button } from '@/components/ui/button';
import { AlertCircle, Home } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted px-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="inline-block p-4 bg-muted rounded-lg">
          <AlertCircle className="h-12 w-12 text-muted-foreground" />
        </div>
        <div>
          <h1 className="text-6xl font-bold">404</h1>
          <p className="text-muted-foreground mt-2">{t('errors.notFound')}</p>
        </div>
        <p className="text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button onClick={() => navigate('/')} className="gap-2">
          <Home className="h-4 w-4" />
          {t('errors.goHome')}
        </Button>
      </div>
    </div>
  );
}
