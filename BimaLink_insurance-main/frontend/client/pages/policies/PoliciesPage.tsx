import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiService, Policy } from '@/services/api';
import { toast } from 'sonner';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, FileText, Search, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

type Filters = {
  search: string;
  type: string | 'all';
  status: string | 'all';
  startDate?: string;
  endDate?: string;
};

const STATUS_COLORS: Record<string, string> = {
  active: 'text-green-600',
  pending: 'text-yellow-600',
  lapsed: 'text-red-600',
  expired: 'text-gray-600',
};

const debounce = (fn: (...args: any[]) => void, ms = 300) => {
  let t: any;
  return (...args: any[]) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
};

const WorkflowTracker: React.FC<{ status: Policy['status'] }> = ({ status }) => {
  const stages = ['Application', 'Payment', 'Verification', 'Issued', 'Renewal Pending'];
  const progressMap: Record<Policy['status'], number> = {
    active: 4,
    pending: 2,
    expired: 4,
    cancelled: 1,
  } as any;
  const idx = progressMap[status] ?? 1;
  return (
    <div className="flex items-center gap-2 text-xs">
      {stages.map((s, i) => (
        <div key={s} className={`px-2 py-1 rounded ${i <= idx ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>{s}</div>
      ))}
    </div>
  );
};

const PoliciesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>(() => {
    const saved = localStorage.getItem('policies_filters');
    return saved ? JSON.parse(saved) : { search: '', type: 'all', status: 'all' };
  });
  const [showDetails, setShowDetails] = useState<Policy | null>(null);
  const [tab, setTab] = useState<'list' | 'pending'>('list');
  const [pendingApps, setPendingApps] = useState<any[]>([
    { id: 'APP-104', customer: 'Jane Doe', type: 'Motor', createdOn: '2025-10-20', stage: 'Payment Pending' },
    { id: 'APP-105', customer: 'John Smith', type: 'Micro-Health', createdOn: '2025-10-25', stage: 'Documents Review' },
  ]);

  const fetchPolicies = async () => {
    setLoading(true);
    const res = await apiService.getPolicies();
    if (res.success && res.data) {
      setPolicies(res.data);
    } else {
      toast.error(res.error || 'Failed to load policies');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPolicies();
    const interval = setInterval(fetchPolicies, 60000);
    return () => clearInterval(interval);
  }, []);

  // Persist filters
  useEffect(() => {
    localStorage.setItem('policies_filters', JSON.stringify(filters));
  }, [filters]);

  // Debounced search
  const onSearchChange = useMemo(() => debounce((val: string) => setFilters((f) => ({ ...f, search: val }))), []);

  const filtered = useMemo(() => {
    return policies.filter((p) => {
      const matchesSearch = !filters.search || `${p.id}`.includes(filters.search) || `${p.description || ''}`.toLowerCase().includes(filters.search.toLowerCase());
      const matchesType = filters.type === 'all' || p.type.toLowerCase() === filters.type.toLowerCase();
      const matchesStatus = filters.status === 'all' || p.status.toLowerCase() === filters.status.toLowerCase();
      const issueDate = new Date(p.startDate).getTime();
      const inStart = !filters.startDate || issueDate >= new Date(filters.startDate).getTime();
      const inEnd = !filters.endDate || issueDate <= new Date(filters.endDate).getTime();
      return matchesSearch && matchesType && matchesStatus && inStart && inEnd;
    });
  }, [policies, filters]);

  const totals = useMemo(() => {
    const total = policies.length;
    const active = policies.filter((p) => p.status === 'active').length;
    const expired = policies.filter((p) => p.status === 'expired').length;
    const pendingRenewals = policies.filter((p) => new Date(p.endDate).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000 && p.status === 'active').length;
    return { total, active, pendingRenewals, expired };
  }, [policies]);

  const exportCSV = () => {
    const header = ['PolicyNo', 'Customer', 'ProductType', 'IssueDate', 'Premium', 'Status', 'NextRenewal'];
    const rows = filtered.map((p) => [p.id, p.description?.split('|')[0] || 'N/A', p.type, p.startDate, p.premium, p.status, p.endDate]);
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'policies.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const win = window.open('', 'PRINT', 'height=700,width=900');
    if (!win) return;
    win.document.write('<html><head><title>Policies</title>');
    win.document.write('<style>table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px}th{background:#f5f5f5}</style>');
    win.document.write('</head><body><h2>Policies</h2>');
    win.document.write('<table><thead><tr><th>Policy No.</th><th>Customer</th><th>Product</th><th>Issue Date</th><th>Premium</th><th>Status</th><th>Next Renewal</th></tr></thead><tbody>');
    filtered.forEach((p) => win!.document.write(`<tr><td>${p.id}</td><td>${p.description?.split('|')[0] || 'N/A'}</td><td>${p.type}</td><td>${p.startDate}</td><td>${p.premium}</td><td>${p.status}</td><td>${p.endDate}</td></tr>`));
    win.document.write('</tbody></table></body></html>');
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  const renewPolicy = (p: Policy) => {
    if (!(user?.role === 'agent' || user?.role === 'admin')) {
      toast.error('You do not have permission to renew policies.');
      return;
    }
    const newPremium = Math.round(p.premium * 1.05);
    const newEnd = new Date(new Date(p.endDate).getTime() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    toast.success(`Renewal prepared: Premium FRW ${newPremium.toLocaleString()}, End ${newEnd}`);
  };

  const sendCopy = (p: Policy) => {
    toast.success(`Policy ${p.id} copy queued for Email/SMS`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Policies</h1>
          <p className="text-muted-foreground">View, issue, and manage all insurance policies</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => navigate('/dashboard/new-policy')}>+ Issue New Policy</Button>
          <div className="text-sm">
            <Link className="text-muted-foreground hover:text-primary" to="/dashboard">Dashboard</Link>
            <span className="mx-2">›</span>
            <span className="font-medium">Policies</span>
          </div>
        </div>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Policies Issued', value: totals.total, color: 'bg-blue-500/10 text-blue-700' },
          { label: 'Active Policies', value: totals.active, color: 'bg-green-500/10 text-green-700' },
          { label: 'Pending Renewals (Next 30 Days)', value: totals.pendingRenewals, color: 'bg-yellow-500/10 text-yellow-700' },
          { label: 'Lapsed / Expired Policies', value: totals.expired, color: 'bg-gray-500/10 text-gray-700' },
        ].map((k, i) => (
          <Card key={i} className="p-6">
            <div className="flex items-start justify-between">
              <div className={`w-10 h-10 rounded-md flex items-center justify-center ${k.color}`}>
                <LineChart className="h-5 w-5" />
              </div>
              <Button variant="ghost" size="icon" onClick={fetchPolicies} title="Refresh"><RefreshCw className="h-4 w-4" /></Button>
            </div>
            <p className="text-muted-foreground text-sm mt-2">{k.label}</p>
            <p className="text-3xl font-bold">{k.value}</p>
          </Card>
        ))}
      </div>

      {/* Search & Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="md:col-span-2">
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="search" placeholder="Search by Policy Number or Customer Name" className="pl-8" onChange={(e) => onSearchChange(e.target.value)} defaultValue={filters.search} />
            </div>
          </div>
          <div>
            <Label>Policy Type</Label>
            <Select value={filters.type} onValueChange={(v) => setFilters((f) => ({ ...f, type: v }))}>
              <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="motor">Motor</SelectItem>
                <SelectItem value="life">Life</SelectItem>
                <SelectItem value="microinsurance">Micro-Health</SelectItem>
                <SelectItem value="health">Health</SelectItem>
                <SelectItem value="property">Property</SelectItem>
                <SelectItem value="travel">Travel</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={filters.status} onValueChange={(v) => setFilters((f) => ({ ...f, status: v }))}>
              <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="lapsed">Lapsed</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Start</Label>
              <Input type="date" value={filters.startDate || ''} onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))} />
            </div>
            <div>
              <Label>End</Label>
              <Input type="date" value={filters.endDate || ''} onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))} />
            </div>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button variant="outline" onClick={() => setFilters({ search: '', type: 'all', status: 'all' })}>Reset Filters</Button>
          <Button variant="outline" onClick={exportCSV} className="gap-2"><Download className="h-4 w-4" /> Export CSV</Button>
          <Button variant="outline" onClick={exportPDF} className="gap-2"><FileText className="h-4 w-4" /> Export PDF</Button>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex items-center gap-4">
        <Button variant={tab === 'list' ? 'default' : 'outline'} onClick={() => setTab('list')}>All Policies</Button>
        <Button variant={tab === 'pending' ? 'default' : 'outline'} onClick={() => setTab('pending')}>Pending Applications</Button>
      </div>

      {/* Main content + AI Insights sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Policies Table or Cards */}
          {tab === 'list' ? (
        <Card className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm hidden md:table">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Policy No.</th>
                  <th className="py-2">Customer Name</th>
                  <th className="py-2">Product Type</th>
                  <th className="py-2">Issue Date</th>
                  <th className="py-2">Premium</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Next Renewal</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b">
                    <td className="py-2">{p.id}</td>
                    <td className="py-2">{p.description?.split('|')[0] || 'N/A'}</td>
                    <td className="py-2 capitalize">{p.type}</td>
                    <td className="py-2">{p.startDate}</td>
                    <td className="py-2">FRW {p.premium.toLocaleString()}</td>
                    <td className={`py-2 capitalize ${STATUS_COLORS[p.status] || ''}`}>{p.status}</td>
                    <td className="py-2">{p.endDate}</td>
                    <td className="py-2">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setShowDetails(p)}>View</Button>
                        <Button variant="outline" size="sm" onClick={() => renewPolicy(p)} disabled={!(user?.role === 'agent' || user?.role === 'admin')}>Renew</Button>
                        <Button variant="outline" size="sm" onClick={() => sendCopy(p)}>Send Copy</Button>
                      </div>
                      <div className="mt-2">
                        <WorkflowTracker status={p.status} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {filtered.map((p) => (
                <Card key={p.id} className="p-4">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Policy No.</p>
                      <p className="font-medium">{p.id}</p>
                    </div>
                    <span className={`capitalize ${STATUS_COLORS[p.status] || ''}`}>{p.status}</span>
                  </div>
                  <p className="mt-2 text-sm">Customer: {p.description?.split('|')[0] || 'N/A'}</p>
                  <p className="text-sm">Product: {p.type}</p>
                  <p className="text-sm">Issue: {p.startDate} • Renewal: {p.endDate}</p>
                  <div className="mt-2"><WorkflowTracker status={p.status} /></div>
                  <div className="mt-3 flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowDetails(p)}>View</Button>
                    <Button variant="outline" size="sm" onClick={() => renewPolicy(p)} disabled={!(user?.role === 'agent' || user?.role === 'admin')}>Renew</Button>
                    <Button variant="outline" size="sm" onClick={() => sendCopy(p)}>Send Copy</Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Application ID</th>
                  <th className="py-2">Customer</th>
                  <th className="py-2">Policy Type</th>
                  <th className="py-2">Created On</th>
                  <th className="py-2">Stage</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingApps.map((a) => (
                  <tr key={a.id} className="border-b">
                    <td className="py-2">{a.id}</td>
                    <td className="py-2">{a.customer}</td>
                    <td className="py-2">{a.type}</td>
                    <td className="py-2">{a.createdOn}</td>
                    <td className="py-2">{a.stage}</td>
                    <td className="py-2">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => navigate('/policies/new')}>Resume Application</Button>
                        <Button variant="outline" size="sm" onClick={() => setPendingApps((list) => list.filter((x) => x.id !== a.id))}>Cancel</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Applications older than 30 days are auto-cleaned by backend.</p>
        </Card>
      )}
        </div>

        {/* AI Insights Sidebar */}
        <div className="space-y-6">
          <Card className="p-4">
            <h3 className="text-lg font-semibold">AI Insights</h3>
            <p className="text-sm text-muted-foreground">Recommendations and alerts powered by placeholder AI API.</p>
            <div className="mt-4 space-y-3">
              <h4 className="font-medium">Expiring Soon (Top 5)</h4>
              <div className="space-y-2">
                {policies
                  .filter((p) => new Date(p.endDate).getTime() > Date.now())
                  .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
                  .slice(0, 5)
                  .map((p) => (
                    <div key={p.id} className="flex items-center justify-between text-sm">
                      <span>{p.id} • {p.description?.split('|')[0] || 'N/A'}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Renews {p.endDate}</span>
                        <Button size="sm" variant="outline" onClick={() => toast.success(`Client notified for ${p.id}`)}>Notify Client</Button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <h4 className="font-medium">Cross-sell Opportunities</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Motor Policy • Add Theft Cover</span>
                  <Button size="sm" variant="outline" onClick={() => toast.success('Suggestion sent to client')}>Notify Client</Button>
                </div>
                <div className="flex items-center justify-between">
                  <span>Health Policy • Family Bundle Discount</span>
                  <Button size="sm" variant="outline" onClick={() => toast.success('Suggestion sent to client')}>Notify Client</Button>
                </div>
              </div>
            </div>
            <div className="mt-6 space-y-2">
              <h4 className="font-medium">Client Risk Score</h4>
              <p className="text-sm text-muted-foreground">Indicative score from claims history and payment behavior.</p>
              <div className="flex items-center gap-2">
                <div className="w-2/3 bg-muted rounded h-2 overflow-hidden">
                  <div className="bg-primary h-2" style={{ width: `${Math.min(90, Math.max(10, Math.round(Math.random()*100)))}%` }} />
                </div>
                <span className="text-xs text-muted-foreground">Dynamic preview</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Compliance & KYC */}
      <Card className="p-4">
        <p className="text-sm">KYC Pending – Click to verify.</p>
        <Button variant="outline" onClick={() => navigate('/agents/kyc')}>Go to KYC</Button>
      </Card>

      {/* Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-2">
          <h3 className="text-lg font-bold mb-4">Policy Growth Over Time</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={policies.map((p, i) => ({ index: i + 1, premium: p.premium }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="index" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="premium" stroke="#3b82f6" name="Premium" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Distribution by Product Type</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie dataKey="value" data={Object.entries(policies.reduce((acc: any, p) => { acc[p.type] = (acc[p.type] || 0) + 1; return acc; }, {})).map(([k, v]) => ({ name: k, value: v }))} cx="50%" cy="50%" outerRadius={80} label>
                {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'].map((c, idx) => <Cell key={idx} fill={c} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Policy Details</h3>
              <Button variant="outline" onClick={() => setShowDetails(null)}>Close</Button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">Policy No.</span><div className="font-medium">{showDetails.id}</div></div>
              <div><span className="text-muted-foreground">Customer</span><div className="font-medium">{showDetails.description?.split('|')[0] || 'N/A'}</div></div>
              <div><span className="text-muted-foreground">Product</span><div className="font-medium capitalize">{showDetails.type}</div></div>
              <div><span className="text-muted-foreground">Issue</span><div className="font-medium">{showDetails.startDate}</div></div>
              <div><span className="text-muted-foreground">Premium</span><div className="font-medium">FRW {showDetails.premium.toLocaleString()}</div></div>
              <div><span className="text-muted-foreground">Status</span><div className={`font-medium capitalize ${STATUS_COLORS[showDetails.status] || ''}`}>{showDetails.status}</div></div>
            </div>
            <div className="mt-4">
              <h4 className="font-medium mb-2">Certificate & Coverage</h4>
              <p className="text-sm text-muted-foreground">Certificate PDF available. Coverage details include theft, fire, accident (sample).</p>
              <div className="mt-3 flex gap-2">
                <Button variant="outline" onClick={() => toast.success('Certificate opened')}>Open Certificate</Button>
                <Button variant="outline" onClick={() => sendCopy(showDetails!)}>Send Copy</Button>
              </div>
            </div>
            <div className="mt-6">
              <h4 className="font-medium mb-2">Workflow</h4>
              <WorkflowTracker status={showDetails.status} />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PoliciesPage;