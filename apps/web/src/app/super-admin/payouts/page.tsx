'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../features/auth/AuthContext';
import { getSessionJwt } from '../../../lib/sessionJwt';
import { 
  DollarSign, 
  CheckCircle2, 
  Loader2,
  AlertCircle,
  X,
  CreditCard
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

type Payout = {
  id: string;
  instructor: string;
  amount: number;
  status: 'pending' | 'paid';
  date: string;
};

export default function SuperAdminPayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchPayouts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/super-admin/payouts`, {
        headers: { Authorization: `Bearer ${await getSessionJwt()}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPayouts(data.payouts || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, []);

  const handleMarkPaid = async (id: string) => {
    if (!confirm('Mark this payout as completed?')) return;
    setProcessingId(id);
    setError('');
    
    try {
      const res = await fetch(`${API_BASE}/super-admin/payouts/${id}`, {
        method: 'PATCH',
        headers: { 
          Authorization: `Bearer ${await getSessionJwt()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'paid' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setSuccess('Payout marked as paid successfully.');
      
      // Update local state instead of refetching just to show immediate feedback on mocked data
      setPayouts(prev => prev.map(p => p.id === id ? { ...p, status: 'paid' } : p));
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  function fmt(n: number) {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
          <DollarSign className="h-3.5 w-3.5" />
          Financial Operations
        </span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white">Instructor Payouts</h1>
        <p className="mt-2 text-slate-400 text-sm">
          Review and process pending revenue share payouts for instructors.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-300 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto" aria-label="Close error"><X className="h-4 w-4" /></button>
        </div>
      )}

      {success && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Payouts Table */}
      <div className="rounded-3xl border border-white/5 bg-slate-900/30 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs font-bold uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">Instructor</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Date Requested</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-500 mb-4" />
                    Loading payouts...
                  </td>
                </tr>
              ) : payouts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No payouts found.
                  </td>
                </tr>
              ) : (
                payouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 font-bold text-white">
                      {payout.instructor}
                    </td>
                    <td className="px-6 py-4 font-mono text-emerald-400 font-bold">
                      {fmt(payout.amount)}
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(payout.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {payout.status === 'paid' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 uppercase tracking-wider">
                          <CheckCircle2 className="h-3 w-3" /> Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border bg-amber-500/10 text-amber-400 border-amber-500/20 uppercase tracking-wider">
                          <AlertCircle className="h-3 w-3" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {payout.status === 'pending' && (
                        <button 
                          onClick={() => handleMarkPaid(payout.id)}
                          disabled={processingId === payout.id}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all"
                        >
                          {processingId === payout.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CreditCard className="h-3.5 w-3.5" />}
                          Process Payout
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
