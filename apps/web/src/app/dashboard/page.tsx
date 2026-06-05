'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../features/auth/AuthContext';
import {
  BookOpen,
  Briefcase,
  Printer,
  Calendar,
  Clock,
  FileText,
  ChevronRight,
  Video,
  Plus,
  Layers,
  Package
} from 'lucide-react';
import { academyOverview, academyStats, enrolledCourses } from '../../features/academy/content';

export default function DashboardHome() {
  const { profile } = useAuth();

  if (!profile) return null;

  const purpose = profile.purpose || 'learn';
  const name = profile.firstName || 'User';

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-slate-950 p-8 lg:p-12 shadow-2xl">
        <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[140%] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/5 px-3 py-1 text-xs font-semibold text-indigo-300">
            Welcome back, {profile.role}
          </span>
          <h1 className="mt-4 text-3xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Hello,{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
              {name}
            </span>
          </h1>
          <p className="mt-4 text-slate-400 text-sm lg:text-base leading-relaxed">
            {academyOverview.dashboardSummary}
          </p>
        </div>
      </div>

      {purpose === 'learn' && <AcademyOverview />}
      {purpose === 'hire' && <AgencyOverview />}
      {purpose === 'print' && <PrintingOverview />}
      {purpose === 'both' && (
        <div className="space-y-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="border border-white/5 bg-slate-900/20 backdrop-blur-md rounded-3xl p-6 lg:p-8">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-400" />
                Programming Academy
              </h2>
              <AcademyOverview isUnified={true} />
            </div>
            <div className="border border-white/5 bg-slate-900/20 backdrop-blur-md rounded-3xl p-6 lg:p-8">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-cyan-400" />
                Software and Projects
              </h2>
              <AgencyOverview isUnified={true} />
            </div>
          </div>
          <div className="border border-white/5 bg-slate-900/20 backdrop-blur-md rounded-3xl p-6 lg:p-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Printer className="h-5 w-5 text-rose-400" />
              Printing and Design
            </h2>
            <PrintingOverview isUnified={true} />
          </div>
        </div>
      )}
    </div>
  );
}

function AcademyOverview({ isUnified = false }: { isUnified?: boolean }) {
  return (
    <div className="space-y-6">
      <div className={`grid gap-4 ${isUnified ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-4'}`}>
        <div className="glass-card rounded-2xl border border-white/5 bg-slate-900/40 p-5">
          <span className="text-xs text-slate-400 font-medium block">Enrolled Courses</span>
          <span className="text-2xl font-extrabold text-white mt-1.5 block">
            {academyStats.enrolledCourses}
          </span>
        </div>
        <div className="glass-card rounded-2xl border border-white/5 bg-slate-900/40 p-5">
          <span className="text-xs text-slate-400 font-medium block">Study Hours</span>
          <span className="text-2xl font-extrabold text-indigo-400 mt-1.5 block">
            {academyStats.studyHours}
          </span>
        </div>
        {!isUnified && (
          <>
            <div className="glass-card rounded-2xl border border-white/5 bg-slate-900/40 p-5">
              <span className="text-xs text-slate-400 font-medium block">Completed Lessons</span>
              <span className="text-2xl font-extrabold text-emerald-400 mt-1.5 block">
                {academyStats.completedLessons} / 56
              </span>
            </div>
            <div className="glass-card rounded-2xl border border-white/5 bg-slate-900/40 p-5">
              <span className="text-xs text-slate-400 font-medium block">Certificates</span>
              <span className="text-2xl font-extrabold text-yellow-400 mt-1.5 block">
                {academyStats.certificates}
              </span>
            </div>
          </>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Current Progress</h3>
          <Link href="/dashboard/courses" className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1">
            All Courses <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="space-y-3">
          {enrolledCourses.map((course) => (
            <div key={course.id} className="glass-panel border border-white/5 bg-slate-950/40 hover:bg-slate-900/40 rounded-2xl p-5 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-semibold tracking-wide uppercase">
                    {course.category}
                  </span>
                  <h4 className="text-sm font-bold text-white mt-1.5">{course.title}</h4>
                </div>
                <span className="text-xs font-bold text-indigo-400">{course.progress || 0}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${course.progress || 0}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> Next: {course.activeLesson}
                </span>
                <span>{course.lessons} lessons total</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/dashboard/courses" className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 font-semibold text-xs transition-colors">
          <span className="flex items-center gap-2">
            <Video className="h-4 w-4" /> Start Next Lesson
          </span>
          <ChevronRight className="h-4 w-4" />
        </Link>
        <Link href="/dashboard/messages" className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-slate-900/50 hover:bg-slate-900 text-slate-300 font-semibold text-xs transition-colors">
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Ask Instructor or Mentor
          </span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function AgencyOverview({ isUnified = false }: { isUnified?: boolean }) {
  const projects = [
    {
      name: 'Multi-Tenant CRM Web Portal',
      status: 'In Development',
      progress: 45,
      nextMilestone: 'Milestone 2: Database Migration',
      price: '$2,500'
    }
  ];

  return (
    <div className="space-y-6">
      <div className={`grid gap-4 ${isUnified ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-4'}`}>
        <div className="glass-card rounded-2xl border border-white/5 bg-slate-900/40 p-5">
          <span className="text-xs text-slate-400 font-medium block">Active Projects</span>
          <span className="text-2xl font-extrabold text-white mt-1.5 block">1</span>
        </div>
        <div className="glass-card rounded-2xl border border-white/5 bg-slate-900/40 p-5">
          <span className="text-xs text-slate-400 font-medium block">Pending Invoices</span>
          <span className="text-2xl font-extrabold text-amber-400 mt-1.5 block">1</span>
        </div>
        {!isUnified && (
          <>
            <div className="glass-card rounded-2xl border border-white/5 bg-slate-900/40 p-5">
              <span className="text-xs text-slate-400 font-medium block">Payments Settled</span>
              <span className="text-2xl font-extrabold text-emerald-400 mt-1.5 block">$1,250</span>
            </div>
            <div className="glass-card rounded-2xl border border-white/5 bg-slate-900/40 p-5">
              <span className="text-xs text-slate-400 font-medium block">Agreements Signed</span>
              <span className="text-2xl font-extrabold text-indigo-400 mt-1.5 block">1</span>
            </div>
          </>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Project Workspace</h3>
          <Link href="/dashboard/projects" className="text-xs font-semibold text-cyan-400 hover:underline flex items-center gap-1">
            Track Milestones <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="space-y-3">
          {projects.map((project, idx) => (
            <div key={idx} className="glass-panel border border-white/5 bg-slate-950/40 hover:bg-slate-900/40 rounded-2xl p-5 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-semibold tracking-wide uppercase">
                    {project.status}
                  </span>
                  <h4 className="text-sm font-bold text-white mt-1.5">{project.name}</h4>
                </div>
                <span className="text-xs font-bold text-cyan-400">{project.price}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Layers className="h-3.5 w-3.5" /> {project.nextMilestone}
                </span>
                <span>{project.progress}% completed</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/dashboard/projects" className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-300 font-semibold text-xs transition-colors">
          <span className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Request New Service
          </span>
          <ChevronRight className="h-4 w-4" />
        </Link>
        <Link href="/dashboard/payments" className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-slate-900/50 hover:bg-slate-900 text-slate-300 font-semibold text-xs transition-colors">
          <span className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> View Pending Invoices
          </span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function PrintingOverview({ isUnified = false }: { isUnified?: boolean }) {
  const recentOrders = [
    { title: 'Thesis Document', status: 'In Production', type: 'Document Printing', price: 'NGN 2,500', date: '2 days ago' },
    { title: 'Conference Poster', status: 'Ready', type: 'Graphic Design', price: 'NGN 8,000', date: '3 days ago' }
  ];

  return (
    <div className="space-y-6">
      <div className={`grid gap-4 ${isUnified ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-4'}`}>
        <div className="glass-card rounded-2xl border border-white/5 bg-slate-900/40 p-5">
          <span className="text-xs text-slate-400 font-medium block">Total Orders</span>
          <span className="text-2xl font-extrabold text-white mt-1.5 block">3</span>
        </div>
        <div className="glass-card rounded-2xl border border-white/5 bg-slate-900/40 p-5">
          <span className="text-xs text-slate-400 font-medium block">In Production</span>
          <span className="text-2xl font-extrabold text-blue-400 mt-1.5 block">1</span>
        </div>
        {!isUnified && (
          <>
            <div className="glass-card rounded-2xl border border-white/5 bg-slate-900/40 p-5">
              <span className="text-xs text-slate-400 font-medium block">Ready for Pickup</span>
              <span className="text-2xl font-extrabold text-emerald-400 mt-1.5 block">1</span>
            </div>
            <div className="glass-card rounded-2xl border border-white/5 bg-slate-900/40 p-5">
              <span className="text-xs text-slate-400 font-medium block">Total Spent</span>
              <span className="text-2xl font-extrabold text-rose-400 mt-1.5 block">NGN 25,500</span>
            </div>
          </>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Recent Orders</h3>
          <Link href="/dashboard/printing" className="text-xs font-semibold text-rose-400 hover:underline flex items-center gap-1">
            All Orders <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="space-y-3">
          {recentOrders.map((order, idx) => (
            <div key={idx} className="glass-panel border border-white/5 bg-slate-950/40 hover:bg-slate-900/40 rounded-2xl p-5 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase border ${
                    order.status === 'Ready'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  }`}>
                    {order.status}
                  </span>
                  <h4 className="text-sm font-bold text-white mt-1.5">{order.title}</h4>
                </div>
                <span className="text-xs font-bold text-rose-400">{order.price}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Package className="h-3.5 w-3.5" /> {order.type}
                </span>
                <span>{order.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/dashboard/printing" className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-rose-600/10 hover:bg-rose-600/20 text-rose-300 font-semibold text-xs transition-colors">
          <span className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Place New Order
          </span>
          <ChevronRight className="h-4 w-4" />
        </Link>
        <Link href="/dashboard/payments" className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-slate-900/50 hover:bg-slate-900 text-slate-300 font-semibold text-xs transition-colors">
          <span className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> View Payment History
          </span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
