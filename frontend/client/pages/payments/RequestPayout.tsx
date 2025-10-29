import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { apiService } from '@/services/api';
import { toast } from 'sonner';
import { Download, FileText, LineChart as LineChartIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, BarChart, Bar } from 'recharts';

// Simple number animator
const useCounter = (target: number, durationMs = 1000) => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / durationMs);
      setValue(Math.round(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, durationMs]);
  return value;
};

const ChannelBadge: React.FC<{ channel: 'mtn' | 'airtel'; onToggle?: () => void }> = ({ channel, onToggle }) => {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`h-10 px-4 rounded-md font-bold flex items-center justify-center shadow-sm select-none ${
          channel === 'mtn' ? 'bg-yellow-400 text-blue-800' : 'bg-red-600 text-white'
        }`}
      >
        {channel === 'mtn' ? 'MTN Mobile Money' : 'Airtel Money'}
      </div>
      <Button variant="outline" size="sm" onClick={onToggle}>
        Switch
      </Button>
    </div>
  );
};

// Mock analytics data
const mockMonthlyPayouts = [
  { month: 'Jan', requested: 450000, paid: 420000 },
  { month: 'Feb', requested: 520000, paid: 500000 },
  { month: 'Mar', requested: 480000, paid: 470000 },
  { month: 'Apr', requested: 610000, paid: 590000 },
  { month: 'May', requested: 550000, paid: 540000 },
  { month: 'Jun', requested: 670000, paid: 660000 },
];

type HistoryItem = {
  date: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  reference: string;
  channel: 'mtn' | 'airtel';
};

export const RequestPayoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [availableBalance, setAvailableBalance] = useState(1250000);
  const [pendingCommissions, setPendingCommissions] = useState(185000);
  const [lastPayout, setLastPayout] = useState<string>('2025-10-14');
  const [channel, setChannel] = useState<'mtn' | 'airtel'>('mtn');
  const [autoTransfer, setAutoTransfer] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([
    { date: '2025-10-01', amount: 250000, status: 'COMPLETED', reference: 'RP-001', channel: 'mtn' },
    { date: '2025-10-12', amount: 180000, status: 'PENDING', reference: 'RP-002', channel: 'airtel' },
    { date: '2025-10-20', amount: 300000, status: 'COMPLETED', reference: 'RP-003', channel: 'mtn' },
  ]);

  // Animated counters
  const animatedBalance = useCounter(availableBalance, 800);
  const animatedPending = useCounter(pendingCommissions, 800);

  // Form state
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [method, setMethod] = useState<'mtn' | 'airtel'>('mtn');
  const [purpose, setPurpose] = useState('Commission Withdrawal');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      errs.amount = 'Enter a valid amount greater than 0';
    } else if (numAmount > availableBalance) {
      errs.amount = 'Amount exceeds available balance';
    }
    if (!phone || !/^\+?\d{10,13}$/.test(phone)) {
      errs.phone = 'Enter a valid mobile money number';
    }
    if (!purpose) {
      errs.purpose = 'Purpose is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  useEffect(() => {
    // real-time validation
    validate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, phone, purpose, notes, method]);

  const submitPayout = async () => {
    if (!validate()) {
      toast("Please fix validation errors before submitting.");
      return;
    }
    const numAmount = Number(amount);
    // Reuse payment initiation as sandbox payout simulation
    const res = await apiService.initiatePayment({ amount: numAmount, method, phone });
    if (!res.success || !res.data) {
      toast.error(res.error || 'Payout request failed');
      return;
    }
    const ref = res.data.reference;
    setHistory((h) => [{ date: new Date().toISOString().slice(0, 10), amount: numAmount, status: 'PENDING', reference: ref, channel: method }, ...h]);
    toast.success(`Payout request submitted. Ref: ${ref}`);
  };

  const exportCSV = () => {
    const header = ['Date', 'Amount', 'Status', 'Reference', 'Channel'];
    const rows = history.map((h) => [h.date, h.amount, h.status, h.reference, h.channel]);
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'payout_history.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    // Open printable window for Save as PDF
    const win = window.open('', 'PRINT', 'height=600,width=800');
    if (!win) return;
    win.document.write('<html><head><title>Payout History</title>');
    win.document.write('<style>table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:8px;text-align:left}th{background:#f5f5f5}</style>');
    win.document.write('</head><body><h2>Payout History</h2>');
    win.document.write('<table><thead><tr><th>Date</th><th>Amount</th><th>Status</th><th>Reference</th><th>Channel</th></tr></thead><tbody>');
    history.forEach((h) => {
      win!.document.write(`<tr><td>${h.date}</td><td>FRW ${h.amount.toLocaleString()}</td><td>${h.status}</td><td>${h.reference}</td><td>${h.channel.toUpperCase()}</td></tr>`);
    });
    win.document.write('</tbody></table></body></html>');
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  // Status polling simulation via existing payments history
  useEffect(() => {
    const id = setInterval(async () => {
      const res = await apiService.getPaymentHistory();
      if (res.success && res.data) {
        // Merge statuses for known references (simple demo mapping)
        setHistory((list) =>
          list.map((item) => {
            const match = res.data!.find((p: any) => p.reference === item.reference);
            if (match) {
              const status = (match.status || 'pending').toUpperCase();
              return { ...item, status: status === 'SUCCESS' ? 'COMPLETED' : status === 'FAILED' ? 'FAILED' : 'PENDING' };
            }
            return item;
          })
        );
      }
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumb */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Request Payout</h1>
          <p className="text-muted-foreground">Withdraw Commissions and Earnings Securely via Mobile Money</p>
        </div>
        <div className="text-sm">
          <Link className="text-muted-foreground hover:text-primary" to="/dashboard">Dashboard</Link>
          <span className="mx-2">›</span>
          <span className="font-medium">Request Payout</span>
        </div>
      </div>

      {/* Wallet Overview */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Wallet Overview</h2>
          <ChannelBadge channel={channel} onToggle={() => setChannel(channel === 'mtn' ? 'airtel' : 'mtn')} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-primary/5 rounded-md">
            <p className="text-sm text-muted-foreground">Available Balance</p>
            <p className="text-2xl font-bold">FRW {animatedBalance.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-primary/5 rounded-md">
            <p className="text-sm text-muted-foreground">Pending Commissions</p>
            <p className="text-2xl font-bold">FRW {animatedPending.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-primary/5 rounded-md">
            <p className="text-sm text-muted-foreground">Last Payout Date</p>
            <p className="text-2xl font-bold">{lastPayout}</p>
          </div>
          <div className="p-4 bg-primary/5 rounded-md">
            <p className="text-sm text-muted-foreground">Payment Channel</p>
            <p className="text-2xl font-bold capitalize">{channel}</p>
          </div>
        </div>
      </Card>

      {/* Payout Request Form */}
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-medium">Payout Request</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g., 250000" />
            {errors.amount && <p className="text-red-600 text-sm mt-1">{errors.amount}</p>}
          </div>
          <div>
            <Label htmlFor="phone">Mobile Money Number</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g., +2507XXXXXXX" />
            {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
          </div>
          <div>
            <Label htmlFor="method">Payment Method</Label>
            <Select value={method} onValueChange={(v) => setMethod(v as 'mtn' | 'airtel')}>
              <SelectTrigger id="method"><SelectValue placeholder="Select method" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="mtn">MTN MoMo</SelectItem>
                <SelectItem value="airtel">Airtel Money</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="purpose">Purpose</Label>
            <Input id="purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g., Commission Withdrawal" />
            {errors.purpose && <p className="text-red-600 text-sm mt-1">{errors.purpose}</p>}
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Switch checked={autoTransfer} onCheckedChange={setAutoTransfer} />
            <span className="text-sm">Enable auto-transfer when commissions settle</span>
          </div>
          <Button onClick={submitPayout}>Submit Request</Button>
        </div>
      </Card>

      {/* Payout History */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Payout History</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportCSV} className="gap-2"><Download className="h-4 w-4" /> Export CSV</Button>
            <Button variant="outline" onClick={exportPDF} className="gap-2"><FileText className="h-4 w-4" /> Export PDF</Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Date</th>
                <th className="py-2">Amount</th>
                <th className="py-2">Status</th>
                <th className="py-2">Reference</th>
                <th className="py-2">Channel</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.reference} className="border-b">
                  <td className="py-2">{h.date}</td>
                  <td className="py-2">FRW {h.amount.toLocaleString()}</td>
                  <td className="py-2 flex items-center gap-2">
                    {h.status === 'COMPLETED' ? <CheckCircle className="h-4 w-4 text-green-600" /> : h.status === 'FAILED' ? <AlertCircle className="h-4 w-4 text-red-600" /> : <AlertCircle className="h-4 w-4 text-yellow-600" />}
                    <span>{h.status}</span>
                  </td>
                  <td className="py-2">{h.reference}</td>
                  <td className="py-2 capitalize">{h.channel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Analytics & Smart Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Monthly Payout Trends</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={mockMonthlyPayouts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="requested" stroke="#3b82f6" name="Requested" />
              <Line type="monotone" dataKey="paid" stroke="#10b981" name="Paid" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Smart Tips</h3>
          <ul className="space-y-2 text-sm">
            <li>• Offer multi-policy bundles to boost commission.</li>
            <li>• Encourage annual payments to reduce churn.</li>
            <li>• Track client renewals and set reminders.</li>
            <li>• Use instant payout toggle for faster cashflow.</li>
          </ul>
          <div className="mt-4 flex items-center gap-3">
            <Switch checked={autoTransfer} onCheckedChange={setAutoTransfer} />
            <span className="text-sm">Instant payout when balance exceeds threshold</span>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RequestPayoutPage;