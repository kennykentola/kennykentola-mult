'use client';

import React, { useEffect, useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  Users,
  BookOpen,
  BarChart3,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { getSessionJwt } from '../../../lib/sessionJwt';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

type CourseRevenue = {
  courseId: string;
  title: string;
  price: number;
  enrollments: number;
  gross: number;
  instructorEarning: number;
  isPublished: boolean;
  category: string;
};

type MonthlyPoint = {
  month: string;
  label: string;
  amount: number;
};

type RevenueData = {
  totalRevenue: number;
  instructorShare: number;
  platformFee: number;
  totalStudents: number;
  totalCourses: number;
  courses: CourseRevenue[];
  monthlyRevenue: MonthlyPoint[];
};

function fmt(n: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n);
}

function BarChart({ data }: { data: MonthlyPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-slate-600">
        <BarChart3 className="h-8 w-8 mb-2" />
        <p className="text-sm">No revenue data yet</p>
      </div>
    );
  }
  const max = Math.max(...data.map((d) => d.amount), 1);
  return (
    <div className="flex items-end gap-2 h-44 w-full pt-4">
      {data.map((d) => {
        const pct = Math.round((d.amount / max) * 100);
        const heightClass =
          pct <= 5 ? 'h-[5%]' : pct <= 10 ? 'h-[10%]' : pct <= 20 ? 'h-[20%]' : pct <= 30 ? 'h-[30%]' :
          pct <= 40 ? 'h-[40%]' : pct <= 50 ? 'h-[50%]' : pct <= 60 ? 'h-[60%]' : pct <= 70 ? 'h-[70%]' :
          pct <= 80 ? 'h-[80%]' : pct <= 90 ? 'h-[90%]' : 'h-full';
        return (
          <div key={d.month} className="flex flex-col items-center flex-1 gap-1 h-full justify-end group">
            <div className="relative w-full flex flex-col items-center justify-end h-full">
              <span className="absolute -top-5 text-[10px] font-bold text-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {fmt(d.amount)}
              </span>
              <div
                className={`w-full rounded-t-md bg-gradient-to-t from-indigo-600 to-indigo-400 ${heightClass} transition-all duration-700 min-h-[4px]`}
              />
            </div>
            <span className="text-[10px] text-slate-500 font-medium">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function InstructorRevenuePage() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadRevenue = async () => {
      try {
        const res = await fetch(`${API_BASE}/academy/instructor/revenue`, {
          headers: { Authorization: `Bearer ${await getSessionJwt()}` }
        });
        const d = await res.json();
        if (d.error) throw new Error(d.error);
        setData(d);
      } catch (e: any) {
        setError(e.message || 'Failed to load revenue data.');
      } finally {
        setLoading(false);
      }
    };

    loadRevenue();
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto rounded-3xl border border-white/5 bg-slate-900/30 p-12 text-center">
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-indigo-400" />
        <p className="mt-3 text-sm text-slate-400">Loading revenue data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
          <DollarSign className="h-3.5 w-3.5" />
          Revenue Dashboard
        </span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white">Earnings Overview</h1>
        <p className="mt-2 text-slate-400 text-sm">
          Your course revenue breakdown — 70% instructor share, 30% platform fee.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-300 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {data && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Revenue', value: fmt(data.totalRevenue), icon: DollarSign, color: 'emerald', sub: 'Gross enrollment income' },
              { label: 'Your Share (70%)', value: fmt(data.instructorShare), icon: TrendingUp, color: 'indigo', sub: 'After platform fee' },
              { label: 'Total Students', value: String(data.totalStudents), icon: Users, color: 'cyan', sub: 'Enrolled across all courses' },
              { label: 'Active Courses', value: String(data.totalCourses), icon: BookOpen, color: 'purple', sub: 'Published & draft courses' },
            ].map((kpi) => {
              const Icon = kpi.icon;
              const colourMap: Record<string, string> = {
                emerald: 'bg-emerald-600/10 border-emerald-500/20 text-emerald-400',
                indigo: 'bg-indigo-600/10 border-indigo-500/20 text-indigo-400',
                cyan: 'bg-cyan-600/10 border-cyan-500/20 text-cyan-400',
                purple: 'bg-purple-600/10 border-purple-500/20 text-purple-400',
              };
              return (
                <div key={kpi.label} className="rounded-2xl border border-white/5 bg-slate-900/40 p-5 flex items-start gap-4">
                  <div className={`h-11 w-11 rounded-xl border flex items-center justify-center shrink-0 ${colourMap[kpi.color]}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">{kpi.label}</span>
                    <span className="block text-2xl font-black text-white truncate">{kpi.value}</span>
                    <span className="block text-[11px] text-slate-600 mt-0.5">{kpi.sub}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Monthly Revenue Chart */}
          <div className="rounded-3xl border border-white/5 bg-slate-900/20 p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-1">Monthly Revenue Trend</h2>
            <p className="text-xs text-slate-500 mb-6">Your instructor share (₦) — last 12 months</p>
            <BarChart data={data.monthlyRevenue} />
          </div>

          {/* Per-course breakdown */}
          <div className="rounded-3xl border border-white/5 bg-slate-900/10 overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-900 flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white">Course Earnings Breakdown</h2>
            </div>
            {data.courses.length === 0 ? (
              <div className="p-12 text-center">
                <BookOpen className="mx-auto h-10 w-10 text-slate-700" />
                <p className="mt-3 text-sm text-slate-500">No courses yet. Create your first course to start earning.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-900 bg-slate-900/40 text-xs font-bold uppercase tracking-wider text-slate-400">
                      <th className="py-4 px-6">Course</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6">Price</th>
                      <th className="py-4 px-6">Students</th>
                      <th className="py-4 px-6">Gross Revenue</th>
                      <th className="py-4 px-6">Your Earning</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/40">
                    {data.courses.map((c) => (
                      <tr key={c.courseId} className="hover:bg-slate-900/10 transition-colors">
                        <td className="py-4 px-6">
                          <div>
                            <span className="block font-bold text-white">{c.title}</span>
                            <span className="block text-xs text-slate-500">{c.category}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {c.isPublished ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                              <CheckCircle2 className="h-3 w-3" /> Published
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-300">
                              <Clock className="h-3 w-3" /> Draft
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 font-semibold text-slate-300">{fmt(c.price)}</td>
                        <td className="py-4 px-6 font-semibold text-slate-300">{c.enrollments}</td>
                        <td className="py-4 px-6 font-semibold text-slate-300">{fmt(c.gross)}</td>
                        <td className="py-4 px-6">
                          <span className="font-black text-emerald-400">{fmt(c.instructorEarning)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-slate-800 bg-slate-900/40 font-bold text-sm">
                      <td className="py-4 px-6 text-slate-300" colSpan={4}>Totals</td>
                      <td className="py-4 px-6 text-white">{fmt(data.totalRevenue)}</td>
                      <td className="py-4 px-6 text-emerald-400">{fmt(data.instructorShare)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Payout Info */}
          <div className="rounded-2xl border border-indigo-500/10 bg-indigo-500/5 p-5 flex items-start gap-4">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Payout Information</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Instructor payouts are processed monthly. Your earnings ({fmt(data.instructorShare)}) will be
                transferred to your registered bank account within 5–7 business days of month-end.
                Contact admin to update your bank details or request an early payout.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
