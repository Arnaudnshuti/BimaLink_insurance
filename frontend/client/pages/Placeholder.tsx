import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useI18n } from '@/contexts/I18nContext';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export const PlaceholderPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="inline-block p-4 bg-muted rounded-lg">
          <AlertCircle className="h-12 w-12 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-bold">{t('errors.notFound')}</h1>
        <p className="text-muted-foreground max-w-md">
          This page ({location.pathname}) is coming soon. Let us know what you'd like to see here!
        </p>
        <Button onClick={() => navigate('/dashboard')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default PlaceholderPage;
