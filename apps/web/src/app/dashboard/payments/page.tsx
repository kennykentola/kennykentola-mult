'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, Upload, Landmark, FileText, CheckCircle2, AlertCircle, Loader2, Download } from 'lucide-react';
import { getBankAccounts, getUnpaidInvoices, uploadReceipt, submitPayment, getPaymentHistory } from '../../../features/payments/paymentsService';

export default function PaymentsPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [selectedBankId, setSelectedBankId] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptName, setReceiptName] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [invs, banks, hist] = await Promise.all([
        getUnpaidInvoices(),
        getBankAccounts(),
        getPaymentHistory()
      ]);
      setInvoices(invs);
      setBankAccounts(banks);
      setPaymentHistory(hist);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load payments details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setReceiptFile(e.target.files[0]);
      setReceiptName(e.target.files[0].name);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceId) {
      alert('Please select an invoice first.');
      return;
    }
    if (!selectedBankId) {
      alert('Please select a bank account.');
      return;
    }
    if (!receiptFile) {
      alert('Please select a file containing payment proof.');
      return;
    }
    if (!referenceNumber.trim()) {
      alert('Please enter the transaction reference.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      // Convert file to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
      });
      reader.readAsDataURL(receiptFile);
      const base64Data = await base64Promise;

      // Upload receipt screenshot
      const uploadedUrl = await uploadReceipt(base64Data, receiptFile.name);

      const invoice = invoices.find(i => i.id === selectedInvoiceId);
      if (!invoice) {
        throw new Error('Invoice details not found.');
      }

      // Submit payment
      await submitPayment({
        type: invoice.type,
        referenceId: invoice.id,
        bankAccountId: selectedBankId,
        amount: invoice.rawAmount,
        receiptImage: uploadedUrl,
        referenceNumber
      });

      setSuccess(true);
      setSelectedInvoiceId('');
      setSelectedBankId('');
      setReceiptFile(null);
      setReceiptName('');
      setReferenceNumber('');
      await loadData();
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit payment proof.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
        <p className="text-slate-400 text-xs">Loading invoicing and payment configurations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white">Invoices & Payments</h1>
        <p className="text-slate-400 text-sm mt-1">Manage manual bank transfers, upload screenshots of deposit slips, and track settlement invoices.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="h-4.5 w-4.5" /> {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4.5 w-4.5" /> Receipt submitted successfully! Our billing admin will verify the transfer shortly.
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left 2 Cols: Invoices List & Upload Receipt */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoices List */}
          <div className="glass-panel border border-white/5 bg-slate-900/20 rounded-2xl p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Invoice Ledger</h2>
            <div className="space-y-3">
              {invoices.length > 0 ? (
                invoices.map((inv) => (
                  <div key={inv.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-white/5 bg-slate-950/40 gap-4">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block">{inv.id} • {inv.date}</span>
                      <h4 className="text-xs font-bold text-white mt-1">{inv.desc}</h4>
                    </div>
                    <div className="flex items-center gap-4 self-start sm:self-auto">
                      <span className="text-xs font-extrabold text-white">{inv.amount}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                        inv.status === 'pending_verification'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {inv.status === 'pending_verification' ? 'Pending Review' : 'Unpaid'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl">
                  <p className="text-slate-500 text-xs">No pending invoices found. All settled.</p>
                </div>
              )}
            </div>
          </div>

          {/* Upload Receipt Form */}
          {invoices.filter(i => i.status === 'unpaid').length > 0 && (
            <div className="glass-panel border border-white/5 bg-slate-900/20 rounded-2xl p-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Upload Transfer Receipt</h2>
              
              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div>
                  <label htmlFor="invoice-select" className="text-xs font-semibold text-slate-400 block mb-1.5">Select Invoice</label>
                  <select
                    id="invoice-select"
                    title="Select Invoice"
                    required
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                    value={selectedInvoiceId}
                    onChange={(e) => setSelectedInvoiceId(e.target.value)}
                  >
                    <option value="">-- Choose an Invoice to Settle --</option>
                    {invoices.filter(i => i.status === 'unpaid').map(i => (
                      <option key={i.id} value={i.id}>{i.id} - {i.desc} ({i.amount})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="bank-select" className="text-xs font-semibold text-slate-400 block mb-1.5">Paying to Bank Account</label>
                    <select
                      id="bank-select"
                      title="Paying to Bank Account"
                      required
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                      value={selectedBankId}
                      onChange={(e) => setSelectedBankId(e.target.value)}
                    >
                      <option value="">-- Select Destination Bank --</option>
                      {bankAccounts.map(b => (
                        <option key={b.$id} value={b.$id}>{b.bankName} ({b.accountNumber})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="ref-input" className="text-xs font-semibold text-slate-400 block mb-1.5">Bank Transfer Reference No.</label>
                    <input
                      id="ref-input"
                      type="text"
                      required
                      placeholder="e.g. UBA-829104812"
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                    />
                  </div>
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
                    <span className="text-[10px] text-slate-600 block mt-1">Accepts PNG, JPG, PDF up to 5MB</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !selectedInvoiceId || !selectedBankId}
                  className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 py-3 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting Payment Proof...
                    </>
                  ) : (
                    'Submit Receipt for Verification'
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Payment History List */}
          <div className="glass-panel border border-white/5 bg-slate-900/20 rounded-2xl p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Payment History</h2>
            <div className="space-y-3">
              {paymentHistory.length > 0 ? (
                paymentHistory.map((pay) => (
                  <div key={pay.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-white/5 bg-slate-950/40 gap-4">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block">
                        Submitted: {new Date(pay.submittedAt).toLocaleDateString()} · Ref: {pay.referenceNumber}
                      </span>
                      <h4 className="text-xs font-bold text-white mt-1">{pay.itemName}</h4>
                      <p className="text-[10px] text-slate-400 mt-1">Paid to: {pay.bankName}</p>
                      {pay.rejectedReason && (
                        <p className="text-[10px] text-rose-400 font-semibold mt-1">Declined reason: {pay.rejectedReason}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-4 self-start sm:self-auto">
                      <span className="text-xs font-extrabold text-white">N {pay.amount.toLocaleString()}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                        pay.status === 'verified'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : pay.status === 'rejected'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {pay.status.toUpperCase()}
                      </span>
                      {pay.status === 'verified' && pay.receiptPdfUrl && (
                        <a
                          href={pay.receiptPdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-350 hover:text-white transition-colors"
                          title="Download Invoice PDF"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 border border-dashed border-slate-850 rounded-xl">
                  <p className="text-slate-550 text-xs">No payment records found.</p>
                </div>
              )}
            </div>
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
              {bankAccounts.map((bank) => (
                <div key={bank.$id} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-850">
                  <span className="text-slate-500 font-semibold block uppercase text-[9px] tracking-wider">{bank.bankName}</span>
                  <span className="text-white font-extrabold text-sm block mt-1">{bank.accountNumber}</span>
                  <span className="text-slate-400 font-semibold block mt-1">{bank.accountName}</span>
                </div>
              ))}

              <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl text-slate-400 leading-relaxed text-[11px] flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  Please include the invoice ID or name in your transfer narration so our admin verification queue processes it immediately.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
