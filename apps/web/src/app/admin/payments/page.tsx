'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Check, X, Eye, ShieldAlert, Award, Loader2, RefreshCw } from 'lucide-react';
import { getAdminPendingPayments, verifyPayment, rejectPayment } from '../../../features/payments/paymentsService';

export default function AdminPaymentsPage() {
  const [receiptsQueue, setReceiptsQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeReceiptId, setActiveReceiptId] = useState<string | null>(null);
  
  const [actioning, setActioning] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [showDeclineBox, setShowDeclineBox] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadPending = async () => {
    try {
      setLoading(true);
      const data = await getAdminPendingPayments();
      setReceiptsQueue(data);
      setErrorMsg('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch pending payments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleApprove = async (rcpId: string, invoiceId: string) => {
    setActioning(true);
    setErrorMsg('');
    try {
      await verifyPayment(rcpId);
      setReceiptsQueue(prev => prev.filter(r => r.id !== rcpId));
      setActiveReceiptId(null);
      setSuccessMsg(`Payment for ${invoiceId} verified successfully. PDF receipt generated and sent.`);
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed.');
    } finally {
      setActioning(false);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReceiptId) return;
    const rcp = receiptsQueue.find(r => r.id === activeReceiptId);
    if (!rcp) return;

    if (!declineReason.trim()) {
      alert('Please specify a rejection reason.');
      return;
    }

    setActioning(true);
    setErrorMsg('');
    try {
      await rejectPayment(activeReceiptId, declineReason);
      setReceiptsQueue(prev => prev.filter(r => r.id !== activeReceiptId));
      setActiveReceiptId(null);
      setShowDeclineBox(false);
      setDeclineReason('');
      setSuccessMsg(`Payment slip for ${rcp.invoiceId} declined.`);
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Rejection failed.');
    } finally {
      setActioning(false);
    }
  };

  const activeReceipt = receiptsQueue.find(r => r.id === activeReceiptId);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Manual Payment Queue</h1>
          <p className="text-slate-400 text-sm mt-1">Audit customer manual bank transfer receipt screenshots and mark invoices as paid in real-time.</p>
        </div>
        <button
          onClick={loadPending}
          disabled={loading}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-350 hover:text-white border border-slate-800 text-xs font-semibold transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs">
          {errorMsg}
        </div>
      )}

      {loading ? (
        <div className="flex h-[30vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column: Receipts Verification Queue List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="glass-panel border border-white/5 bg-slate-900/20 rounded-3xl p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Pending Approvals ({receiptsQueue.length})</h3>

              {receiptsQueue.length > 0 ? (
                <div className="space-y-3">
                  {receiptsQueue.map((rcp) => (
                    <div key={rcp.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-white/5 bg-slate-950/40 gap-4">
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold block">{rcp.id} • Uploaded {rcp.dateUploaded}</span>
                        <h4 className="text-xs font-bold text-white mt-1">Settle {rcp.invoiceId} (N {rcp.amount.toLocaleString()})</h4>
                        <span className="text-[10px] text-slate-400 mt-1 block">Depositor: {rcp.clientName}</span>
                      </div>

                      <button
                        onClick={() => {
                          setActiveReceiptId(rcp.id);
                          setShowDeclineBox(false);
                        }}
                        className="rounded-lg bg-rose-650/15 border border-rose-500/20 hover:bg-rose-600/30 px-4.5 py-2 text-xs font-bold text-rose-450 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
                      >
                        <Eye className="h-3.5 w-3.5" /> Inspect Slip
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl">
                  <p className="text-slate-500 text-xs">Verification queue empty. All payments settled.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Active Receipt Inspector */}
          <div className="lg:col-span-1">
            {activeReceipt ? (
              <div className="glass-panel border border-white/5 bg-slate-900/20 rounded-3xl p-6 space-y-6 animate-in fade-in duration-200">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Slip Inspector</h3>
                
                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 space-y-2">
                    <div className="flex justify-between border-b border-slate-850 pb-2">
                      <span className="text-slate-500">Invoice ID</span>
                      <span className="text-white font-bold">{activeReceipt.invoiceId}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-850 pb-2">
                      <span className="text-slate-500">Amount Settle</span>
                      <span className="text-rose-450 font-bold">N {activeReceipt.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-850 pb-2">
                      <span className="text-slate-500">Client Name</span>
                      <span className="text-white font-bold">{activeReceipt.clientName}</span>
                    </div>
                    <div className="pt-2 text-[10px] text-slate-400">
                      <span className="font-semibold block text-slate-500">Bank Narration Details:</span>
                      <span className="block mt-1 bg-slate-900/50 p-2 rounded">{activeReceipt.details}</span>
                    </div>
                  </div>

                  {/* Render Slip Image with high-quality styling */}
                  <div className="border border-slate-800 rounded-xl bg-slate-950 overflow-hidden relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={activeReceipt.receiptUrl} 
                      alt="Deposit Slip Proof" 
                      className="w-full h-44 object-cover"
                      onError={(e) => {
                        // fallback to document display if image fails to render
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.parentElement?.querySelector('.fallback-container');
                        if (fallback) fallback.classList.remove('hidden');
                      }}
                    />
                    <div className="fallback-container hidden h-44 flex flex-col items-center justify-center text-center p-4">
                      <FileText className="h-10 w-10 text-slate-500 mb-2" />
                      <span className="font-semibold text-slate-300 block text-[11px]">DepositSlipProof.pdf</span>
                      <span className="text-[10px] text-slate-500 block mt-1">Uploaded receipt document</span>
                    </div>

                    <a 
                      href={activeReceipt.receiptUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-semibold transition-opacity"
                    >
                      View Full File
                    </a>
                  </div>

                  {/* Reject Box */}
                  {showDeclineBox ? (
                    <form onSubmit={handleRejectSubmit} className="space-y-3 pt-3 border-t border-slate-900">
                      <div>
                        <label htmlFor="reason-input" className="text-xs font-semibold text-slate-400 block mb-1">Decline Reason</label>
                        <textarea
                          id="reason-input"
                          required
                          rows={2}
                          placeholder="e.g. Reference number does not match bank statement."
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-rose-500/50"
                          value={declineReason}
                          onChange={(e) => setDeclineReason(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          className="px-3 py-1.5 rounded-lg bg-slate-900 text-slate-400 hover:bg-slate-850"
                          onClick={() => setShowDeclineBox(false)}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={actioning}
                          className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold"
                        >
                          Confirm Decline
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* Actions Button panel */
                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-900">
                      <button
                        onClick={() => setShowDeclineBox(true)}
                        disabled={actioning}
                        className="rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-850 py-2.5 text-xs font-semibold text-slate-450 transition-colors flex items-center justify-center gap-1"
                      >
                        <X className="h-3.5 w-3.5" /> Decline
                      </button>
                      <button
                        onClick={() => handleApprove(activeReceipt.id, activeReceipt.invoiceId)}
                        disabled={actioning}
                        className="rounded-xl bg-rose-600 hover:bg-rose-500 py-2.5 text-xs font-semibold text-white transition-colors flex items-center justify-center gap-1 shadow-lg shadow-rose-500/10"
                      >
                        {actioning ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Check className="h-3.5 w-3.5" />
                        )}
                        Settle Verify
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="glass-panel border border-white/5 bg-slate-900/20 rounded-3xl p-6 text-center py-12 text-slate-500 text-xs">
                Select a receipt slip from the queue to start validation audit.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
