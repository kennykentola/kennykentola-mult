'use client';

import React, { useState } from 'react';
import { FileText, Check, X, Eye, ShieldAlert, Award } from 'lucide-react';

export default function AdminPaymentsPage() {
  const [receiptsQueue, setReceiptsQueue] = useState([
    {
      id: 'rcp-901',
      invoiceId: 'inv-204',
      clientName: 'Jane Smith',
      amount: '$1,250',
      dateUploaded: '10 mins ago',
      details: 'Zenith Bank Transfer Ref: ZEN-891048102',
      receiptUrl: '/images/mock-receipt.png'
    },
    {
      id: 'rcp-902',
      invoiceId: 'inv-102',
      clientName: 'John Doe',
      amount: '$150',
      dateUploaded: '2 hrs ago',
      details: 'GT Bank Transfer Ref: GTB-771829391',
      receiptUrl: '/images/mock-receipt.png'
    }
  ]);

  const [activeReceiptId, setActiveReceiptId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const handleApprove = (rcpId: string, invoiceId: string) => {
    setReceiptsQueue(receiptsQueue.filter(r => r.id !== rcpId));
    setActiveReceiptId(null);
    setSuccessMsg(`Payment for ${invoiceId} approved successfully. Invoice marked as Settle-Paid.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleReject = (rcpId: string, invoiceId: string) => {
    setReceiptsQueue(receiptsQueue.filter(r => r.id !== rcpId));
    setActiveReceiptId(null);
    setSuccessMsg(`Payment receipt for ${invoiceId} has been rejected. Notification sent to client.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const activeReceipt = receiptsQueue.find(r => r.id === activeReceiptId);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white">Manual Payment Queue</h1>
        <p className="text-slate-400 text-sm mt-1">Audit customer manual bank transfer receipt screenshots and mark invoices as paid in real-time.</p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs">
          {successMsg}
        </div>
      )}

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
                      <h4 className="text-xs font-bold text-white mt-1">Settle {rcp.invoiceId} ({rcp.amount})</h4>
                      <span className="text-[10px] text-slate-400 mt-1 block">Depositor: {rcp.clientName}</span>
                    </div>

                    <button
                      onClick={() => setActiveReceiptId(rcp.id)}
                      className="rounded-lg bg-rose-600/15 border border-rose-500/20 hover:bg-rose-600/30 px-4.5 py-2 text-xs font-bold text-rose-400 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
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
                    <span className="text-rose-450 font-bold">{activeReceipt.amount}</span>
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

                {/* Simulated Slip Image rendering with high-quality styling */}
                <div className="relative h-44 rounded-xl border border-slate-800 bg-slate-950 flex flex-col items-center justify-center text-center p-4">
                  <FileText className="h-10 w-10 text-slate-500 mb-2" />
                  <span className="font-semibold text-slate-300 block text-[11px]">Screenshot_DepositSlip_{activeReceipt.invoiceId}.png</span>
                  <span className="text-[10px] text-slate-500 block mt-1">File Size: 1.4 MB • Type: Image/PNG</span>
                </div>

                {/* Actions Button panel */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-900">
                  <button
                    onClick={() => handleReject(activeReceipt.id, activeReceipt.invoiceId)}
                    className="rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-850 py-2.5 text-xs font-semibold text-slate-450 transition-colors flex items-center justify-center gap-1"
                  >
                    <X className="h-3.5 w-3.5" /> Decline
                  </button>
                  <button
                    onClick={() => handleApprove(activeReceipt.id, activeReceipt.invoiceId)}
                    className="rounded-xl bg-rose-600 hover:bg-rose-500 py-2.5 text-xs font-semibold text-white transition-colors flex items-center justify-center gap-1 shadow-lg shadow-rose-500/10"
                  >
                    <Check className="h-3.5 w-3.5" /> Settle Verify
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel border border-white/5 bg-slate-900/20 rounded-3xl p-6 text-center py-12 text-slate-500 text-xs">
              Select a receipt slip from the queue to start validation audit.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
