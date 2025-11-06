import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';

import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import SignatureCanvas from 'react-signature-canvas';
import Tesseract from 'tesseract.js';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { apiService, Policy } from '@/services/api';

const clientSchema = z.object({
  fullName: z.string().min(2),
  nationalId: z.string().min(6),
  phone: z.string().min(8),
  email: z.string().email(),
  address: z.string().min(2),
  district: z.string().min(2),
  gender: z.enum(['male', 'female']).optional(),
  dob: z.string().optional(),
  photo: z.any().optional(),
});

const policySchema = z.object({
  type: z.enum(['motor', 'microinsurance', 'health', 'travel']),
  startDate: z.string(),
  endDate: z.string(),
  premium: z.coerce.number().min(0),
  coverageAmount: z.coerce.number().min(0),
  paymentFrequency: z.enum(['monthly', 'quarterly', 'yearly']),
  addons: z.array(z.string()).optional(),
  agentAssigned: z.string().min(2),
});

type FormValues = z.infer<typeof clientSchema> & z.infer<typeof policySchema> & {
  policyNumber: string;
  paymentChannel: 'mtn' | 'airtel' | 'bank';
  paymentPhone?: string;
};

const baseRates: Record<FormValues['type'], number> = {
  motor: 0.04,
  microinsurance: 0.015,
  health: 0.035,
  travel: 0.02,
};

function generatePolicyNumber() {
  const now = new Date();
  return `POL-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${Math.floor(Math.random()*9000)+1000}`;
}

function frequencyMultiplier(freq: FormValues['paymentFrequency']) {
  switch (freq) {
    case 'monthly': return 1;
    case 'quarterly': return 3;
    case 'yearly': return 12;
    default: return 1;
  }
}

export default function NewPolicyPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const signatureRef = useRef<SignatureCanvas | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string>('');
  const [paymentReference, setPaymentReference] = useState<string>('');

  const form = useForm<FormValues>({
    resolver: zodResolver(clientSchema.merge(policySchema).extend({
      policyNumber: z.string(),
      paymentChannel: z.enum(['mtn','airtel','bank']),
      paymentPhone: z.string().optional(),
    })),
    defaultValues: {
      fullName: '', nationalId: '', phone: '', email: '', address: '', district: '', gender: 'male', dob: '',
      type: 'motor', startDate: '', endDate: '', premium: 0, coverageAmount: 0, paymentFrequency: 'monthly', addons: [], agentAssigned: '',
      policyNumber: generatePolicyNumber(), paymentChannel: 'mtn', paymentPhone: '',
    }
  });

  const watchType = form.watch('type');
  const watchCoverage = form.watch('coverageAmount');
  const watchFrequency = form.watch('paymentFrequency');

  const estimatedPremium = useMemo(() => {
    const rate = baseRates[watchType] || 0.02;
    const premium = watchCoverage * rate;
    const freq = frequencyMultiplier(watchFrequency);
    return Math.round(premium / freq);
  }, [watchType, watchCoverage, watchFrequency]);

  const commission = useMemo(() => Math.round(estimatedPremium * 0.1), [estimatedPremium]);

  useEffect(() => {
    if (!Number.isNaN(estimatedPremium)) {
      form.setValue('premium', estimatedPremium);
    }
  }, [estimatedPremium]);

  // Auto-fill from local cache
  const tryAutoFill = (query: string) => {
    try {
      const store = localStorage.getItem('recentClients');
      if (!store) return;
      const list = JSON.parse(store) as Array<any>;
      const match = list.find(c => c.phone === query || c.email === query || c.nationalId === query);
      if (match) {
        form.reset({
          ...form.getValues(),
          fullName: match.fullName,
          nationalId: match.nationalId,
          phone: match.phone,
          email: match.email,
          address: match.address,
          district: match.district,
          gender: match.gender,
          dob: match.dob,
          policyNumber: generatePolicyNumber(),
        });
        toast({ title: 'Auto-filled', description: 'Client info loaded from recent records.' });
      }
    } catch {}
  };

  const handleOcr = async (file: File) => {
    setOcrLoading(true);
    try {
      const result = await Tesseract.recognize(URL.createObjectURL(file), 'eng');
      const text = result.data.text || '';
      const idMatch = text.match(/[A-Z0-9]{6,}/);
      if (idMatch) {
        form.setValue('nationalId', idMatch[0]);
        toast({ title: 'OCR complete', description: 'National ID extracted.' });
      } else {
        toast({ title: 'OCR complete', description: 'Could not parse ID. Please enter manually.' });
      }
    } catch (e) {
      toast({ title: 'OCR error', description: e instanceof Error ? e.message : 'Failed to scan ID' });
    } finally {
      setOcrLoading(false);
    }
  };

  const requestPayment = async () => {
    const vals = form.getValues();
    if (!vals.paymentPhone) {
      toast({ title: 'Phone required', description: 'Enter client phone for mobile money.' });
      return;
    }
    const method = vals.paymentChannel === 'bank' ? 'card' : vals.paymentChannel;
    const res = await apiService.initiatePayment({ amount: vals.premium, method, phone: vals.paymentPhone });
    if (!res.success || !res.data) {
      toast({ title: 'Payment error', description: res.error || 'Could not initiate payment' });
      return;
    }
    setPaymentStatus(res.data.status);
    setPaymentReference(res.data.reference);
    toast({ title: 'Payment initiated', description: `Status: ${res.data.status} | Ref: ${res.data.reference}` });
  };

  const generatePdf = async (policy: Policy, signatureDataUrl?: string) => {
    const doc = new jsPDF();
    const vals = form.getValues();
    const qrPayload = JSON.stringify({ policyId: policy.id, policyNumber: vals.policyNumber, client: vals.fullName });
    const qrDataUrl = await QRCode.toDataURL(qrPayload);

    doc.setFontSize(16);
    doc.text('BimaLink Policy Document', 20, 20);
    doc.setFontSize(12);
    doc.text(`Policy Number: ${vals.policyNumber}`, 20, 35);
    doc.text(`Client: ${vals.fullName}`, 20, 45);
    doc.text(`National ID: ${vals.nationalId}`, 20, 55);
    doc.text(`Type: ${vals.type}`, 20, 65);
    doc.text(`Coverage: FRW ${vals.coverageAmount}`, 20, 75);
    doc.text(`Premium (/${vals.paymentFrequency}): FRW ${vals.premium}`, 20, 85);
    doc.text(`Agent: ${vals.agentAssigned}`, 20, 95);
    doc.text('BNR Audit: Tracked via QR payload & timestamp', 20, 105);

    try { doc.addImage(qrDataUrl, 'PNG', 150, 20, 40, 40); } catch {}
    if (signatureDataUrl) {
      try { doc.addImage(signatureDataUrl, 'PNG', 20, 120, 60, 30); } catch {}
    }
    doc.save(`${vals.policyNumber}.pdf`);
  };

  const onSubmit = async (vals: FormValues) => {
    const description = JSON.stringify({
      client: {
        fullName: vals.fullName,
        nationalId: vals.nationalId,
        phone: vals.phone,
        email: vals.email,
        address: vals.address,
        district: vals.district,
        gender: vals.gender,
        dob: vals.dob,
      },
      paymentFrequency: vals.paymentFrequency,
      addons: vals.addons,
      commission,
      policyNumber: vals.policyNumber,
      paymentChannel: vals.paymentChannel,
      paymentReference,
    });

    const create = await apiService.createPolicy({
      type: vals.type,
      status: 'pending',
      premium: vals.premium,
      startDate: vals.startDate,
      endDate: vals.endDate,
      coverageAmount: vals.coverageAmount,
      description,
    });

    if (!create.success || !create.data) {
      toast({ title: 'Create policy failed', description: create.error || 'Unknown error' });
      return;
    }

    // persist client for future auto-fill
    try {
      const store = localStorage.getItem('recentClients');
      const list = store ? JSON.parse(store) : [];
      list.unshift({ fullName: vals.fullName, nationalId: vals.nationalId, phone: vals.phone, email: vals.email, address: vals.address, district: vals.district, gender: vals.gender, dob: vals.dob });
      localStorage.setItem('recentClients', JSON.stringify(list.slice(0, 20)));
    } catch {}

    const sig = signatureRef.current?.toDataURL();
    await generatePdf(create.data, sig);
    toast({ title: 'Policy issued', description: 'PDF generated and saved. Redirecting…' });
    navigate('/dashboard');
  };

  return (
    <div className="space-y-6 p-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Create New Policy</h1>
        <p className="text-sm text-muted-foreground">Issue Policies Digitally — Fast, Secure, and Compliant</p>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>New Policy</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Client Info */}
        <Card className="p-4 space-y-4 lg:col-span-2">
          <h2 className="text-lg font-medium">Client Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" {...form.register('fullName')} />
            </div>
            <div>
              <Label htmlFor="nationalId">National ID/Passport</Label>
              <Input id="nationalId" {...form.register('nationalId')} />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" {...form.register('phone')} onBlur={(e) => tryAutoFill(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register('email')} onBlur={(e) => tryAutoFill(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input id="address" {...form.register('address')} />
            </div>
            <div>
              <Label htmlFor="district">District</Label>
              <Input id="district" {...form.register('district')} />
            </div>
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select value={form.watch('gender')} onValueChange={(v) => form.setValue('gender', v as any)}>
                <SelectTrigger id="gender"><SelectValue placeholder="Select gender" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="dob">Date of Birth</Label>
              <Input id="dob" type="date" {...form.register('dob')} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div>
              <Label htmlFor="photo">Upload Photo/ID</Label>
              <Input id="photo" type="file" accept="image/*" capture="environment" onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleOcr(f);
              }} />
              <p className="text-xs text-muted-foreground mt-1">Scan ID via OCR to auto-fill.</p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" disabled={ocrLoading}>{ocrLoading ? 'Scanning…' : 'Scan Again'}</Button>
              <Button type="button" variant="secondary" onClick={() => tryAutoFill(form.getValues('phone') || form.getValues('email') || form.getValues('nationalId'))}>Auto-fill</Button>
            </div>
          </div>
        </Card>

        {/* Right column: Quick Actions */}
        <Card className="p-4 space-y-3">
          <h2 className="text-lg font-medium">Quick Actions</h2>
          <div className="flex flex-col gap-2">
            <Button variant="secondary" onClick={() => form.setValue('type', 'motor')}>Motor Policy</Button>
            <Button variant="secondary" onClick={() => form.setValue('type', 'microinsurance')}>Microinsurance Policy</Button>
            <Button variant="outline" onClick={() => navigate('/policies')}>View Product Guides</Button>
          </div>
        </Card>
      </div>

      {/* Policy Details */}
      <Card className="p-4 space-y-4">
        <h2 className="text-lg font-medium">Policy Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="type">Policy Type</Label>
            <Select value={form.watch('type')} onValueChange={(v) => form.setValue('type', v as any)}>
              <SelectTrigger id="type"><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="motor">Motor</SelectItem>
                <SelectItem value="microinsurance">Microinsurance</SelectItem>
                <SelectItem value="health">Health</SelectItem>
                <SelectItem value="travel">Travel</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Policy Number</Label>
            <Input readOnly value={form.watch('policyNumber')} />
          </div>
          <div>
            <Label htmlFor="agentAssigned">Agent Assigned</Label>
            <Input id="agentAssigned" {...form.register('agentAssigned')} />
          </div>
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input id="startDate" type="date" {...form.register('startDate')} />
          </div>
          <div>
            <Label htmlFor="endDate">End Date</Label>
            <Input id="endDate" type="date" {...form.register('endDate')} />
          </div>
          <div>
            <Label htmlFor="coverageAmount">Coverage Value (FRW)</Label>
            <Input id="coverageAmount" type="number" {...form.register('coverageAmount', { valueAsNumber: true })} />
          </div>
          <div>
            <Label htmlFor="paymentFrequency">Payment Frequency</Label>
            <Select value={form.watch('paymentFrequency')} onValueChange={(v) => form.setValue('paymentFrequency', v as any)}>
              <SelectTrigger id="paymentFrequency"><SelectValue placeholder="Select frequency" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="premium">Premium Amount (FRW)</Label>
            <Input id="premium" type="number" {...form.register('premium', { valueAsNumber: true })} />
            <p className="text-xs text-muted-foreground">Estimated: FRW {estimatedPremium} | Commission: FRW {commission}</p>
          </div>
          <div className="md:col-span-3">
            <Label htmlFor="addons">Add-ons</Label>
            <Textarea id="addons" placeholder="e.g., roadside assistance, extended coverage" onBlur={(e) => {
              const arr = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
              form.setValue('addons', arr);
            }} />
          </div>
        </div>
      </Card>

      {/* Payment */}
      <Card className="p-4 space-y-4">
        <h2 className="text-lg font-medium">Mobile Money Payment</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <Label htmlFor="paymentChannel">Channel</Label>
            <Select value={form.watch('paymentChannel')} onValueChange={(v) => form.setValue('paymentChannel', v as any)}>
              <SelectTrigger id="paymentChannel"><SelectValue placeholder="Select channel" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="mtn">MTN MoMo</SelectItem>
                <SelectItem value="airtel">Airtel Money</SelectItem>
                <SelectItem value="bank">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="paymentPhone">Client Phone</Label>
            <Input id="paymentPhone" {...form.register('paymentPhone')} />
          </div>
          <div className="flex gap-2">
            <Button type="button" onClick={requestPayment}>Send Payment Request</Button>
            <Button type="button" variant="outline" onClick={() => {
              const vals = form.getValues();
              const amount = vals.premium;
              const ref = paymentReference || vals.policyNumber;
              const ussd = vals.paymentChannel === 'mtn' ? `*182*8*1*${amount}*${ref}#` : vals.paymentChannel === 'airtel' ? `*182*4*1*${amount}*${ref}#` : `REF: ${ref}`;
              navigator.clipboard.writeText(ussd).then(() => toast({ title: 'USSD copied', description: ussd })).catch(() => toast({ title: 'Copy failed', description: ussd }));
            }}>Copy USSD / Reference</Button>
          </div>
          <div>
            <p className="text-sm">Status: {paymentStatus || '—'}</p>
            <p className="text-sm">Reference: {paymentReference || form.watch('policyNumber')}</p>
          </div>
        </div>
      </Card>

      {/* Summary & Signature */}
      <Card className="p-4 space-y-4">
        <h2 className="text-lg font-medium">Summary & Confirmation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Policy Summary</Label>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Client: {form.watch('fullName')} ({form.watch('nationalId')})</p>
              <p>Type: {form.watch('type')} | Number: {form.watch('policyNumber')}</p>
              <p>Coverage: FRW {form.watch('coverageAmount')} | Premium: FRW {form.watch('premium')}</p>
              <p>Frequency: {form.watch('paymentFrequency')} | Commission: FRW {commission}</p>
              <p>Agent: {form.watch('agentAssigned')}</p>
            </div>
          </div>
          <div>
            <Label>Digital Signature</Label>
            <div className="border rounded-md">
              <SignatureCanvas ref={signatureRef as any} penColor="#111" canvasProps={{ width: 500, height: 150, className: 'sigCanvas w-full h-[150px]' }} />
            </div>
            <div className="flex gap-2 mt-2">
              <Button type="button" variant="outline" onClick={() => signatureRef.current?.clear()}>Clear</Button>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => navigate('/dashboard')}>Cancel</Button>
          <Button type="button" onClick={form.handleSubmit(onSubmit)}>Issue Policy</Button>
        </div>
      </Card>
    </div>
  );
}