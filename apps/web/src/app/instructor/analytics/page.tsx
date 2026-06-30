'use client';

import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Users,
  BookOpen,
  BarChart3,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { getSessionJwt } from '../../../lib/sessionJwt';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

type CoursePerformance = {
  courseId: string;
  title: string;
  enrollments: number;
  completionRate: number;
  revenue: number;
};

type MonthlyPoint = {
  month: string;
  label: string;
  enrollments: number;
};

type AnalyticsData = {
  totalStudents: number;
  totalCourses: number;
  averageCompletionRate: number;
  monthlyEnrollments: MonthlyPoint[];
  coursePerformance: CoursePerformance[];
};

export default function InstructorAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch(`${API_BASE}/academy/instructor/analytics`, {
          headers: { Authorization: `Bearer ${await getSessionJwt()}` }
        });
        const d = await res.json();
        if (d.error) throw new Error(d.error);
        setData(d);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-rose-500/10 p-6 text-rose-400 border border-rose-500/20 max-w-2xl mt-8 mx-auto">
        <AlertCircle className="h-6 w-6" />
        <p>{error}</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8 max-w-6xl mx-auto p-4">
      <div className="flex items-center gap-4 border-b border-white/5 pb-6">
        <div className="h-12 w-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
          <BarChart3 className="h-6 w-6 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Analytics Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">
            Track student enrollment and course completion.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Students */}
        <div className="rounded-3xl border border-white/5 bg-slate-900/40 p-6 flex flex-col justify-center overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all pointer-events-none" />
          <div className="flex items-center gap-3 text-slate-400 font-semibold mb-4">
            <Users className="h-5 w-5 text-indigo-400" />
            Total Students
          </div>
          <span className="text-5xl font-black text-white tracking-tighter">
            {data.totalStudents}
          </span>
        </div>

        {/* Total Courses */}
        <div className="rounded-3xl border border-white/5 bg-slate-900/40 p-6 flex flex-col justify-center overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all pointer-events-none" />
          <div className="flex items-center gap-3 text-slate-400 font-semibold mb-4">
            <BookOpen className="h-5 w-5 text-purple-400" />
            Active Courses
          </div>
          <span className="text-5xl font-black text-white tracking-tighter">
            {data.totalCourses}
          </span>
        </div>

        {/* Avg Completion Rate */}
        <div className="rounded-3xl border border-white/5 bg-slate-900/40 p-6 flex flex-col justify-center overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />
          <div className="flex items-center gap-3 text-slate-400 font-semibold mb-4">
            <TrendingUp className="h-5 w-5 text-emerald-400" />
            Avg Completion
          </div>
          <span className="text-5xl font-black text-white tracking-tighter">
            {data.averageCompletionRate}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Enrollments Chart */}
        <div className="rounded-3xl border border-white/5 bg-slate-900/40 p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-xl font-bold text-white mb-6">Monthly Enrollments (Last 12 Months)</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlyEnrollments} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: '#312e81', opacity: 0.4 }}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                />
                <Bar dataKey="enrollments" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Course Performance Table */}
        <div className="rounded-3xl border border-white/5 bg-slate-900/40 p-6 shadow-xl overflow-hidden flex flex-col">
          <h2 className="text-xl font-bold text-white mb-6">Course Performance</h2>
          <div className="flex-1 overflow-auto pr-2 custom-scrollbar">
            {data.coursePerformance.length === 0 ? (
              <p className="text-slate-400 text-sm">No courses found.</p>
            ) : (
              <div className="space-y-4">
                {data.coursePerformance.map((c) => (
                  <div key={c.courseId} className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 hover:border-indigo-500/30 transition-colors">
                    <h3 className="font-bold text-white mb-3 truncate">{c.title}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-500 font-semibold mb-1">ENROLLMENTS</p>
                        <p className="font-mono text-lg text-indigo-300">{c.enrollments}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-semibold mb-1">COMPLETION RATE</p>
                        <div className="flex items-center gap-2">
                          <div className="h-2 flex-1 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: `${c.completionRate}%` }} />
                          </div>
                          <span className="font-mono text-sm text-emerald-400">{c.completionRate}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
