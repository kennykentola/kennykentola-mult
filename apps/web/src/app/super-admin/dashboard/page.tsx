'use client';

import React, { useEffect, useState } from 'react';
import { 
  BarChart3, 
  Users, 
  DollarSign, 
  Activity, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../../features/auth/AuthContext';
import { getSessionJwt } from '../../../lib/sessionJwt';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

type SAData = {
  metrics: {
    usersCount: number;
    revenue: number;
    activeSessions: number;
  };
  recentActivity: {
    msg: string;
    time: string;
    type: 'success' | 'info' | 'warning';
  }[];
};

export default function SuperAdminDashboard() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SAData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const res = await fetch(`${API_BASE}/super-admin/overview`, {
          headers: { Authorization: `Bearer ${await getSessionJwt()}` }
        });
        const payload = await res.json();
        if (!res.ok) {
          throw new Error(payload.error || 'Failed to load overview');
        }

        setData(payload);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, []);

  function fmt(n: number) {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n);
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 flex flex-col items-center justify-center text-rose-400">
        <AlertCircle className="h-10 w-10 mb-4" />
        <h2 className="text-xl font-bold">Failed to load overview</h2>
        <p className="text-sm mt-2 opacity-80">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const { metrics, recentActivity } = data;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
          <Activity className="h-3.5 w-3.5" />
          System Health
        </span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white">Super Admin Dashboard</h1>
        <p className="mt-2 text-slate-400 text-sm">
          Welcome back, {profile?.firstName || 'System Administrator'}. All systems operational.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'Total Platform Users', value: metrics.usersCount.toLocaleString(), icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20' },
          { label: 'Total Platform Revenue', value: fmt(metrics.revenue || 0), icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20' },
          { label: 'Active Sessions', value: metrics.activeSessions.toString(), icon: Activity, color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20' },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="rounded-3xl border border-white/5 bg-slate-900/50 p-6 flex flex-col gap-4 relative overflow-hidden group hover:border-white/10 transition-colors">
              <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity ${kpi.color.replace('text-', 'bg-')}`} />
              <div className={`h-12 w-12 rounded-2xl border flex items-center justify-center shrink-0 ${kpi.bg} ${kpi.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <span className="block text-4xl font-black text-white tracking-tight">{kpi.value}</span>
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mt-2">{kpi.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* System Status */}
      <div className="rounded-3xl border border-white/5 bg-slate-900/30 p-8 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-indigo-400" /> Recent System Logs
        </h2>
        <div className="space-y-4">
          {recentActivity.length === 0 ? (
            <p className="text-sm text-slate-500">No recent system activity yet.</p>
          ) : recentActivity.map((log, i) => (
            <div key={i} className="flex items-center gap-4 py-3 border-b border-slate-800 last:border-0">
              <div className={`h-2 w-2 rounded-full ${
                log.type === 'success' ? 'bg-emerald-500' : 
                log.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
              }`} />
              <p className="text-sm font-medium text-slate-300 flex-1">{log.msg}</p>
              <span className="text-xs text-slate-500">{log.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
