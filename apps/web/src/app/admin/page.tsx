'use client';

import React, { useState } from 'react';
import { useAuth } from '../../features/auth/AuthContext';
import { 
  Users, 
  Layers, 
  DollarSign, 
  Clock, 
  ChevronRight, 
  ShieldAlert, 
  UserCheck, 
  ArrowRight 
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardHome() {
  const { profile } = useAuth();
  const [metrics, setMetrics] = useState<any>({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    totalPrintOrders: 0,
    totalRevenue: 0,
    activeProjects: 0
  });
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    let cancelled = false;
    async function loadAnalytics() {
      try {
        const { getAdminAnalytics } = await import('../../features/admin/adminService');
        const data = await getAdminAnalytics();
        if (!cancelled) setMetrics(data.metrics);
      } catch (err) {
        console.error('Failed to load admin analytics:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadAnalytics();
    return () => { cancelled = true; };
  }, []);

  if (!profile) return null;

  const kpis = [
    { name: 'Total Platform Users', value: loading ? '-' : metrics.totalUsers.toLocaleString(), icon: Users, change: 'All users', color: 'from-blue-500/10 to-indigo-500/10 border-indigo-500/20 text-indigo-400' },
    { name: 'Active Software Projects', value: loading ? '-' : metrics.activeProjects.toLocaleString(), icon: Layers, change: 'In database', color: 'from-cyan-500/10 to-teal-500/10 border-cyan-500/20 text-cyan-400' },
    { name: 'Settle-Invoiced Income', value: loading ? '-' : `₦${metrics.totalRevenue.toLocaleString()}`, icon: DollarSign, change: 'Verified payments', color: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-400' },
    { name: 'Print Orders', value: loading ? '-' : metrics.totalPrintOrders.toLocaleString(), icon: Clock, change: 'Total requested', color: 'from-rose-500/10 to-orange-500/10 border-rose-500/20 text-rose-400' }
  ];

  const recentActivities = [
    { desc: 'New user registration monitoring active', time: 'Live', badge: 'System' },
    { desc: 'Payment verification queue monitoring active', time: 'Live', badge: 'System' },
    { desc: 'Project request monitoring active', time: 'Live', badge: 'System' },
    { desc: 'Printing queue monitoring active', time: 'Live', badge: 'System' }
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white">CRM & Analytics Terminal</h1>
        <p className="text-slate-400 text-sm mt-1">Cross-company overview of student enrollments, project pipeline stages, and invoicing verification status.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className={`rounded-2xl border bg-gradient-to-br ${kpi.color} p-5 shadow-lg relative overflow-hidden`}>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs text-slate-400 font-semibold block">{kpi.name}</span>
                  <span className="text-3xl font-extrabold text-white mt-2 block">{kpi.value}</span>
                </div>
                <div className="h-10 w-10 rounded-xl bg-slate-950/40 flex items-center justify-center border border-white/5">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <span className="text-[10px] text-slate-500 font-bold mt-4 block">{kpi.change}</span>
            </div>
          );
        })}
      </div>

      {/* Grid: Recent Logs & Action Center */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recent logs */}
        <div className="lg:col-span-2 glass-panel border border-white/5 bg-slate-900/20 rounded-3xl p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">Real-time Platform Logs</h3>
          
          <div className="space-y-4">
            {recentActivities.map((act, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-slate-950/40 text-xs">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    act.badge === 'User' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                    act.badge === 'Request' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                    act.badge === 'Payment' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {act.badge}
                  </span>
                  <span className="text-slate-300 font-medium">{act.desc}</span>
                </div>
                <span className="text-slate-500 shrink-0">{act.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Admin Action Center */}
        <div className="glass-panel border border-white/5 bg-slate-900/20 rounded-3xl p-6 space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Action Required</h3>
          
          <div className="space-y-3">
            <Link href="/admin/payments" className="flex items-center justify-between p-4 rounded-xl border border-rose-500/20 bg-rose-550/5 hover:bg-rose-550/10 text-rose-400 font-semibold text-xs transition-colors">
              <span>Approve Bank Receipts (3 pending)</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
            
            <Link href="/admin/projects" className="flex items-center justify-between p-4 rounded-xl border border-cyan-500/20 bg-cyan-550/5 hover:bg-cyan-550/10 text-cyan-400 font-semibold text-xs transition-colors">
              <span>Review Estimate Briefs (4 pending)</span>
              <ChevronRight className="h-4 w-4" />
            </Link>

            <Link href="/admin/users" className="flex items-center justify-between p-4 rounded-xl border border-indigo-500/20 bg-indigo-550/5 hover:bg-indigo-550/10 text-indigo-400 font-semibold text-xs transition-colors">
              <span>Configure User Roles</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
