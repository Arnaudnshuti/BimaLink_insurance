import React, { useState, useEffect } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Users, FileText, DollarSign, TrendingUp, Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { apiService, ReportData } from '@/services/api';

const mockRevenueData = [
  { month: 'Jan', revenue: 45000, policies: 120 },
  { month: 'Feb', revenue: 52000, policies: 145 },
  { month: 'Mar', revenue: 48000, policies: 130 },
  { month: 'Apr', revenue: 61000, policies: 170 },
  { month: 'May', revenue: 55000, policies: 155 },
  { month: 'Jun', revenue: 67000, policies: 190 },
];

const mockAgentPerformance = [
  { agent: 'John Doe', policies: 45, commission: 4200 },
  { agent: 'Jane Smith', policies: 52, commission: 4800 },
  { agent: 'Bob Johnson', policies: 38, commission: 3600 },
  { agent: 'Alice Williams', policies: 61, commission: 5200 },
  { agent: 'Charlie Brown', policies: 55, commission: 5100 },
];

export const AdminDashboard: React.FC = () => {
  const { t } = useI18n();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const response = await apiService.getReports();
        if (response.success && response.data) {
          setReportData(response.data);
        }
      } catch (error) {
        console.error('Failed to load reports', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadReports();
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">{t('admin.title')}</h1>
          <p className="text-muted-foreground mt-2">Platform analytics and insights</p>
        </div>
        <Button className="gap-2">
          <Download className="h-4 w-4" />
          {t('admin.export')}
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          {
            label: t('admin.totalUsers'),
            value: (reportData?.totalUsers || 0).toLocaleString(),
            icon: Users,
            color: 'bg-blue-500/10 text-blue-600',
          },
          {
            label: t('admin.totalAgents'),
            value: (reportData?.totalAgents || 0).toLocaleString(),
            icon: Users,
            color: 'bg-green-500/10 text-green-600',
          },
          {
            label: t('admin.totalPolicies'),
            value: (reportData?.totalPolicies || 0).toLocaleString(),
            icon: FileText,
            color: 'bg-purple-500/10 text-purple-600',
          },
          {
            label: t('admin.totalRevenue'),
            value: `FRW ${(reportData?.totalRevenue || 0).toLocaleString()}`,
            icon: DollarSign,
            color: 'bg-yellow-500/10 text-yellow-600',
          },
          {
            label: t('admin.monthlyRevenue'),
            value: `FRW ${(reportData?.monthlyRevenue || 0).toLocaleString()}`,
            icon: TrendingUp,
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-6">{t('admin.monthlyRevenue')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockRevenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#3b82f6" name="Revenue (FRW)" />
              <Line yAxisId="right" type="monotone" dataKey="policies" stroke="#10b981" name="Policies" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Top Agents Performance */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-6">Top Agent Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockAgentPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="agent" width={80} />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="policies" fill="#3b82f6" name="Policies" />
              <Bar yAxisId="right" dataKey="commission" fill="#10b981" name="Commission (FRW)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* User Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users Table */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">{t('admin.users')}</h3>
          <div className="space-y-3">
            {[
              { type: 'Agents', count: reportData?.totalAgents || 0, percent: 35 },
              { type: 'Customers', count: (reportData?.totalUsers || 0) - (reportData?.totalAgents || 0), percent: 65 },
            ].map((item, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.type}</span>
                  <span className="text-muted-foreground">{item.count}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: `${item.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Button variant="outline" className="w-full" onClick={() => window.location.href = '/admin/agents'}>
              {t('admin.agents')}
            </Button>
            <Button variant="outline" className="w-full" onClick={() => window.location.href = '/admin/customers'}>
              {t('admin.users')}
            </Button>
            <Button variant="outline" className="w-full" onClick={() => window.location.href = '/admin/policies'}>
              {t('admin.policies')}
            </Button>
            <Button variant="outline" className="w-full" onClick={() => window.location.href = '/admin/transactions'}>
              {t('admin.transactions')}
            </Button>
            <Button className="w-full" onClick={() => window.location.href = '/agents/kyc'}>
              Complete KYC
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
