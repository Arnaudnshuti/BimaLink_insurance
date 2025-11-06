import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useI18n } from '@/contexts/I18nContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { BarChart3, Shield, TrendingUp, Users, ArrowRight, Sun, Moon, Globe } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useI18n();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold">
              B
            </div>
            <span className="text-xl font-bold hidden sm:inline">{t('common.appName')}</span>
          </button>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              title={theme === 'light' ? t('common.darkMode') : t('common.lightMode')}
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')}
              className="gap-2"
            >
              <Globe className="h-4 w-4" />
              {language.toUpperCase()}
            </Button>

            <div className="flex gap-2 ml-2">
              <Button variant="outline" onClick={() => navigate('/login')}>
                {t('common.login')}
              </Button>
              <Button onClick={() => navigate('/register')}>
                {t('common.register')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="min-h-[90vh] flex items-center justify-center px-4 py-20">
          <div className="container mx-auto max-w-5xl text-center">
            <div className="mb-6 inline-block">
              <span className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                {t('common.tagline')}
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              {t('landing.hero.title')}
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              {t('landing.hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" onClick={() => navigate('/register')} className="gap-2">
                {t('landing.hero.cta')}
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/login')}>
                {t('common.login')}
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto text-sm text-muted-foreground">
              <div>
                <div className="text-2xl font-bold text-foreground">10K+</div>
                <div>{t('nav.agents')}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">50K+</div>
                <div>{t('nav.customers')}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">FRW 5M+</div>
                <div>{t('admin.totalRevenue')}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">{t('common.appName')} Works For Everyone</h2>
              <p className="text-muted-foreground text-lg">
                Powerful tools designed for each role in the insurance ecosystem
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Agent Feature */}
              <div className="p-8 rounded-lg border border-border bg-card hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">{t('landing.features.agent.title')}</h3>
                <p className="text-muted-foreground mb-4">{t('landing.features.agent.description')}</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                    {t('dashboard.totalPolicies')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                    {t('dashboard.commission')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                    {t('dashboard.customers')}
                  </li>
                </ul>
              </div>

              {/* Customer Feature */}
              <div className="p-8 rounded-lg border border-border bg-card hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">{t('landing.features.customer.title')}</h3>
                <p className="text-muted-foreground mb-4">{t('landing.features.customer.description')}</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                    {t('policies.motor')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                    {t('policies.microinsurance')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                    {t('payment.history')}
                  </li>
                </ul>
              </div>

              {/* Admin Feature */}
              <div className="p-8 rounded-lg border border-border bg-card hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">{t('landing.features.admin.title')}</h3>
                <p className="text-muted-foreground mb-4">{t('landing.features.admin.description')}</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                    {t('admin.analytics')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                    {t('admin.reports')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                    {t('nav.policies')}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to get started?</h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Join thousands of agents and customers using BimaLink to streamline their insurance operations.
            </p>
            <Button size="lg" onClick={() => navigate('/register')} className="gap-2">
              {t('landing.hero.cta')}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2024 {t('common.appName')}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
