import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Shield, DollarSign, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { apiService, Policy } from '@/services/api';

const mockPoliciesData = [
  { name: 'Active', count: 3 },
  { name: 'Pending', count: 1 },
  { name: 'Expired', count: 2 },
];

export const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPolicies = async () => {
      try {
        const response = await apiService.getPolicies();
        if (response.success && response.data) {
          setPolicies(response.data);
        }
      } catch (error) {
        console.error('Failed to load policies', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPolicies();
  }, []);

  const activePolicies = policies.filter(p => p.status === 'active').length;
  const totalPremium = policies.reduce((sum, p) => sum + p.premium, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold">
            {t('dashboard.welcome').replace('{{name}}', user?.firstName || 'Guest')}
          </h1>
          <p className="text-muted-foreground mt-2">
            {activePolicies > 0
              ? `You have ${activePolicies} active insurance policies`
              : 'No active policies. Start by purchasing your first policy'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => window.location.href = '/agents/kyc'}>
            Complete KYC
          </Button>
          <Button className="gap-2" onClick={() => window.location.href = '/policies/purchase'}>
            Purchase Policy
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: t('dashboard.activePolicies'),
            value: activePolicies,
            icon: Shield,
            color: 'bg-blue-500/10 text-blue-600',
          },
          {
            label: t('dashboard.totalPolicies'),
            value: policies.length,
            icon: FileText,
            color: 'bg-green-500/10 text-green-600',
          },
          {
            label: 'Total Premium',
            value: `FRW ${totalPremium.toLocaleString()}`,
            icon: DollarSign,
            color: 'bg-purple-500/10 text-purple-600',
          },
          {
            label: t('dashboard.pendingClaims'),
            value: 0,
            icon: Clock,
            color: 'bg-orange-500/10 text-orange-600',
          },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card key={idx} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${kpi.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
              <p className="text-muted-foreground text-sm">{kpi.label}</p>
              <p className="text-2xl font-bold mt-2">{kpi.value}</p>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-6">{t('dashboard.overview')}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={mockPoliciesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Recent Policies */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold">{t('policies.myPolicies')}</h3>
          <Button variant="ghost" size="sm" onClick={() => window.location.href = '/policies'}>
            View All
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4">Type</th>
                <th className="text-left py-3 px-4">Premium</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {policies.slice(0, 5).map(policy => (
                <tr key={policy.id} className="border-b border-border hover:bg-muted/50">
                  <td className="py-4 px-4 font-medium capitalize">{policy.type}</td>
                  <td className="py-4 px-4">FRW {policy.premium.toLocaleString()}</td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      policy.status === 'active' ? 'bg-green-500/10 text-green-700' :
                      policy.status === 'pending' ? 'bg-yellow-500/10 text-yellow-700' :
                      'bg-red-500/10 text-red-700'
                    }`}>
                      {policy.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <Button variant="ghost" size="sm" onClick={() => window.location.href = `/policies/${policy.id}`}>
                    View
                  </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4">{t('dashboard.overview')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button className="w-full" onClick={() => window.location.href = '/policies/purchase'}>
            Purchase Policy
          </Button>
          <Button variant="outline" className="w-full" onClick={() => window.location.href = '/agents/kyc'}>
            Complete KYC
          </Button>
          <Button variant="outline" className="w-full" onClick={() => window.location.href = '/claims/new'}>
            File a Claim
          </Button>
        </div>
      </div>
    </div>
  );
};

// Import FileText for the dashboard
import { FileText } from 'lucide-react';

export default CustomerDashboard;
