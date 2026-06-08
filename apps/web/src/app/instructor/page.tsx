'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../features/auth/AuthContext';
import { 
  Users, 
  BookOpen, 
  FileCheck, 
  Clock, 
  ChevronRight, 
  RefreshCw 
} from 'lucide-react';
import Link from 'next/link';

export default function InstructorDashboardHome() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);

  // Mock statistics since database queries are filtered client-side for now
  const kpis = [
    { name: 'Enrolled Students', value: '48', icon: Users, change: 'Across all courses', color: 'from-indigo-500/10 to-purple-500/10 border-indigo-500/20 text-indigo-400' },
    { name: 'Active Courses', value: '3', icon: BookOpen, change: '1 draft pending', color: 'from-cyan-500/10 to-teal-500/10 border-cyan-500/20 text-cyan-400' },
    { name: 'Awaiting Grading', value: '3', icon: FileCheck, change: 'Action required', color: 'from-amber-500/10 to-orange-500/10 border-amber-500/20 text-amber-400' }
  ];

  const recentGradings = [
    { student: 'John Doe', course: 'React and Next.js 15', assignment: 'Build a Student Dashboard', time: '10 mins ago' },
    { student: 'Jane Smith', course: 'Python and Django Backend', assignment: 'Design a Secure API Auth Flow', time: '2 hrs ago' }
  ];

  if (!profile) return null;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Instructor Control Desk</h1>
          <p className="text-slate-400 text-sm mt-1">Manage course lessons, create assignments, and grade student submissions.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 sm:grid-cols-3">
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

      {/* Grid: Actions & Submissions */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recent Submissions */}
        <div className="lg:col-span-2 glass-panel border border-white/5 bg-slate-900/20 rounded-3xl p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">Pending Student Submissions</h3>
          
          <div className="space-y-4">
            {recentGradings.map((sub, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-slate-950/40 text-xs">
                <div>
                  <div className="font-semibold text-white">{sub.student}</div>
                  <div className="text-slate-450 mt-0.5">{sub.course} — {sub.assignment}</div>
                </div>
                <span className="text-slate-500 text-[10px] shrink-0">{sub.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-panel border border-white/5 bg-slate-900/20 rounded-3xl p-6 space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Quick Actions</h3>
          
          <div className="space-y-3">
            <Link href="/instructor/courses" className="flex items-center justify-between p-4 rounded-xl border border-indigo-500/20 bg-indigo-550/5 hover:bg-indigo-550/10 text-indigo-400 font-semibold text-xs transition-colors">
              <span>Go to Course Builder</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
            
            <Link href="/instructor/assignments" className="flex items-center justify-between p-4 rounded-xl border border-purple-500/20 bg-purple-550/5 hover:bg-purple-550/10 text-purple-400 font-semibold text-xs transition-colors">
              <span>Grade Submissions Workspace</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
