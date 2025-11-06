import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TrendingUp, Users, FileText, Award, DollarSign } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { apiService, Agent } from '@/services/api';

const mockChartData = [
  { month: 'Jan', policies: 45, commission: 4200 },
  { month: 'Feb', policies: 52, commission: 4800 },
  { month: 'Mar', policies: 48, commission: 4500 },
  { month: 'Apr', policies: 61, commission: 5200 },
  { month: 'May', policies: 55, commission: 5100 },
  { month: 'Jun', policies: 67, commission: 6000 },
];

const mockPolicyTypes = [
  { name: 'Motor', value: 45 },
  { name: 'Micro Insurance', value: 30 },
  { name: 'Health', value: 15 },
  { name: 'Travel', value: 10 },
];

const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export const AgentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAgentData = async () => {
      try {
        const response = await apiService.getAgentDashboard();
        if (response.success && response.data) {
          setAgent(response.data);
        }
      } catch (error) {
        console.error('Failed to load agent data', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAgentData();
  }, []);

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
            {agent?.kycStatus === 'verified'
              ? 'Your account is verified and active'
              : 'Complete your KYC verification to unlock all features'}
          </p>
        </div>
        <Button className="gap-2" onClick={() => (window.location.href = '/policies/new')}>
          <FileText className="h-4 w-4" />
          {t('policies.new')}
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          {
            label: t('dashboard.totalPolicies'),
            value: agent?.totalPolicies || 0,
            icon: FileText,
            color: 'bg-blue-500/10 text-blue-600',
          },
          {
            label: t('dashboard.activePolicies'),
            value: Math.floor((agent?.totalPolicies || 0) * 0.85),
            icon: TrendingUp,
            color: 'bg-green-500/10 text-green-600',
          },
          {
            label: t('dashboard.customers'),
            value: agent?.activeCustomers || 0,
            icon: Users,
            color: 'bg-purple-500/10 text-purple-600',
          },
          {
            label: t('dashboard.commission'),
            value: `FRW ${(agent?.commission || 0).toLocaleString()}`,
            icon: DollarSign,
            color: 'bg-yellow-500/10 text-yellow-600',
          },
          {
            label: t('dashboard.earnings'),
            value: 'FRW 12,500',
            icon: Award,
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
              <p className="text-3xl font-bold mt-2">{kpi.value}</p>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Policies & Commission Trend */}
        <Card className="lg:col-span-2 p-6">
          <h3 className="text-lg font-bold mb-6">{t('dashboard.overview')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="policies" stroke="#3b82f6" name="Policies" />
              <Line yAxisId="right" type="monotone" dataKey="commission" stroke="#10b981" name="Commission (FRW)" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Policy Types Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-6">Policy Types</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={mockPolicyTypes} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                {mockPolicyTypes.map((_, idx) => (
                  <Cell key={`cell-${idx}`} fill={colors[idx % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4">{t('dashboard.overview')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button className="w-full" onClick={() => window.location.href = '/policies/new'}>
            New Policy
          </Button>
          <Button variant="outline" className="w-full" onClick={() => window.location.href = '/agents/kyc'}>
            Complete KYC
          </Button>
          <Button variant="outline" className="w-full" onClick={() => window.location.href = '/payments'}>
            Request Payout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
