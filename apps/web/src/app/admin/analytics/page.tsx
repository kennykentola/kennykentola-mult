'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../features/auth/AuthContext';
import { getSessionJwt } from '../../../lib/sessionJwt';
import { 
  BarChart3, 
  Users, 
  BookOpen, 
  Printer, 
  Layers, 
  DollarSign, 
  TrendingUp,
  Loader2,
  AlertCircle
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

type AnalyticsData = {
  metrics: {
    totalUsers: number;
    totalCourses: number;
    totalEnrollments: number;
    totalPrintOrders: number;
    totalRevenue: number;
    activeProjects: number;
  };
  monthlyData: {
    name: string;
    revenue: number;
    users: number;
    enrollments: number;
  }[];
};

function fmt(n: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n);
}


export default function AdminAnalyticsPage() {
  const { profile } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const res = await fetch(`${API_BASE}/admin/analytics`, {
          headers: { Authorization: `Bearer ${await getSessionJwt()}` }
        });
        const d = await res.json();
        if (!res.ok || d.error) {
          throw new Error(d.error || 'Failed to load analytics');
        }
        setData(d);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

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
        <h2 className="text-xl font-bold">Failed to load analytics</h2>
        <p className="text-sm mt-2 opacity-80">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const { metrics, monthlyData } = data;

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
            <BarChart3 className="h-3.5 w-3.5" />
            Analytics & Reports
          </span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white">Platform Dashboard</h1>
          <p className="mt-2 text-slate-400 text-sm">
            High-level overview of users, courses, projects, and revenue.
          </p>
        </div>
        <button
          onClick={() => {
            if (!monthlyData || monthlyData.length === 0) return;
            const headers = ['Month', 'Revenue', 'New Users', 'Enrollments'];
            const rows = monthlyData.map(m => [m.name, m.revenue, m.users, m.enrollments]);
            const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `analytics_export_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
          }}
          disabled={!monthlyData || monthlyData.length === 0}
          className="self-start sm:self-auto inline-flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-300 transition-colors disabled:opacity-50"
        >
          Export CSV
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: 'Total Users', value: metrics.totalUsers, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20' },
          { label: 'Total Revenue', value: fmt(metrics.totalRevenue), icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20' },
          { label: 'Courses', value: metrics.totalCourses, icon: BookOpen, color: 'text-indigo-400', bg: 'bg-indigo-400/10 border-indigo-400/20' },
          { label: 'Enrollments', value: metrics.totalEnrollments, icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20' },
          { label: 'Active Projects', value: metrics.activeProjects, icon: Layers, color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/20' },
          { label: 'Print Orders', value: metrics.totalPrintOrders, icon: Printer, color: 'text-rose-400', bg: 'bg-rose-400/10 border-rose-400/20' },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="rounded-2xl border border-white/5 bg-slate-900/50 p-5 flex flex-col gap-3 relative overflow-hidden group">
              <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity ${kpi.color.replace('text-', 'bg-')}`} />
              <div className={`h-10 w-10 rounded-xl border flex items-center justify-center shrink-0 ${kpi.bg} ${kpi.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <span className="block text-2xl font-black text-white">{kpi.value}</span>
                <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-1">{kpi.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="rounded-3xl border border-white/5 bg-slate-900/30 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-white">Revenue Growth</h2>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mb-4">Total platform revenue over the last 5 months.</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₦${val / 1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: 8, color: '#f8fafc' }}
                  itemStyle={{ color: '#34d399' }}
                  formatter={(value: any) => [fmt(Number(value) || 0), 'Revenue']}
                />
                <Line type="monotone" dataKey="revenue" stroke="#34d399" strokeWidth={3} dot={{ fill: '#0f172a', stroke: '#34d399', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Registration Chart */}
        <div className="rounded-3xl border border-white/5 bg-slate-900/30 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-white">User Registrations</h2>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mb-4">New user sign-ups per month.</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: 8, color: '#f8fafc' }}
                  itemStyle={{ color: '#60a5fa' }}
                />
                <Bar dataKey="users" name="Users" fill="#60a5fa" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Enrollments Chart */}
        <div className="rounded-3xl border border-white/5 bg-slate-900/30 p-6 shadow-xl lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-white">Course Enrollments</h2>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mb-4">Total enrollments across all published courses.</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: 8, color: '#f8fafc' }}
                  itemStyle={{ color: '#c084fc' }}
                />
                <Bar dataKey="enrollments" name="Enrollments" fill="#c084fc" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
