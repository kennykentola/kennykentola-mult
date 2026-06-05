'use client';

import React, { useState } from 'react';
import { CreditCard, DollarSign, Upload, Landmark, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export default function PaymentsPage() {
  const [selectedInvoice, setSelectedInvoice] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptName, setReceiptName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const invoices = [
    { id: 'inv-101', desc: 'Academy Tuition: Full-Stack React', amount: '$150', status: 'paid', date: 'June 01, 2026' },
    { id: 'inv-204', desc: 'Software Project: Milestone 1 Setup', amount: '$1,250', status: 'unpaid', date: 'June 05, 2026' }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setReceiptFile(e.target.files[0]);
      setReceiptName(e.target.files[0].name);
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) {
      alert('Please select an invoice first.');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
      setSelectedInvoice('');
      setReceiptFile(null);
      setReceiptName('');
      setTimeout(() => setSuccess(false), 4000);
    }, 1500);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white">Invoices & Payments</h1>
        <p className="text-slate-400 text-sm mt-1">Manage manual bank transfers, upload screenshots of deposit slips, and track settlement invoices.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left 2 Cols: Invoices List & Upload Receipt */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoices List */}
          <div className="glass-panel border border-white/5 bg-slate-900/20 rounded-2xl p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Invoice Ledger</h2>
            <div className="space-y-3">
              {invoices.map((inv) => (
                <div key={inv.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-white/5 bg-slate-950/40 gap-4">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block">{inv.id} • {inv.date}</span>
                    <h4 className="text-xs font-bold text-white mt-1">{inv.desc}</h4>
                  </div>
                  <div className="flex items-center gap-4 self-start sm:self-auto">
                    <span className="text-xs font-extrabold text-white">{inv.amount}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                      inv.status === 'paid' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upload Receipt Form */}
          <div className="glass-panel border border-white/5 bg-slate-900/20 rounded-2xl p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Upload Transfer Receipt</h2>
            
            {success && (
              <div className="mb-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4.5 w-4.5" /> Receipt submitted successfully! Our billing admin will verify the transfer shortly.
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label htmlFor="invoice-select" className="text-xs font-semibold text-slate-400 block mb-1.5">Select Invoice</label>
                <select
                  id="invoice-select"
                  title="Select Invoice"
                  required
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                  value={selectedInvoice}
                  onChange={(e) => setSelectedInvoice(e.target.value)}
                >
                  <option value="">-- Choose an Invoice to Settle --</option>
                  {invoices.filter(i => i.status === 'unpaid').map(i => (
                    <option key={i.id} value={i.id}>{i.id} - {i.desc} ({i.amount})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Upload Receipt Proof (Screenshot, JPG, PNG, or PDF)</label>
                <div className="border-2 border-dashed border-slate-800 hover:border-slate-700 bg-slate-950/20 rounded-xl p-6 text-center cursor-pointer transition-colors relative">
                  <input
                    type="file"
                    title="Upload Receipt Proof"
                    accept="image/*,application/pdf"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                  />
                  <Upload className="mx-auto h-8 w-8 text-slate-500 mb-2" />
                  <span className="text-xs text-slate-400 block font-semibold">
                    {receiptName || 'Click to select file or drag & drop here'}
                  </span>
                  <span className="text-[10px] text-slate-650 block mt-1">Accepts PNG, JPG, PDF up to 5MB</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || !selectedInvoice}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 py-3 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                {submitting ? 'Submitting Receipt...' : 'Submit Receipt for Verification'}
              </button>
            </form>
          </div>
        </div>

        {/* Right 1 Col: Bank Accounts Info */}
        <div className="space-y-6">
          <div className="glass-panel border border-white/5 bg-slate-900/20 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-[-20%] right-[-10%] w-32 h-32 rounded-full bg-indigo-500/5 blur-[50px]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <Landmark className="h-4.5 w-4.5 text-indigo-400" /> Wire & Bank Details
            </h2>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-850">
                <span className="text-slate-500 font-semibold block uppercase text-[9px] tracking-wider">Zenith Bank Nigeria</span>
                <span className="text-white font-extrabold text-sm block mt-1">1012345678</span>
                <span className="text-slate-400 font-semibold block mt-1">KennyKentola Digital Ltd</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-850">
                <span className="text-slate-500 font-semibold block uppercase text-[9px] tracking-wider">GT Bank Nigeria</span>
                <span className="text-white font-extrabold text-sm block mt-1">0123456789</span>
                <span className="text-slate-400 font-semibold block mt-1">KennyKentola Digital Ltd</span>
              </div>

              <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl text-slate-400 leading-relaxed text-[11px] flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  Please include the invoice ID in your transfer narration so our admin verification queue processes it immediately.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
