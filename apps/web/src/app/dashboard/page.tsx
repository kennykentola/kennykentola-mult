'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../features/auth/AuthContext';

const getProgressWidthClass = (progress: number) => {
  const rounded = Math.round((progress || 0) / 5) * 5;
  switch (rounded) {
    case 5: return 'w-[5%]';
    case 10: return 'w-[10%]';
    case 15: return 'w-[15%]';
    case 20: return 'w-[20%]';
    case 25: return 'w-[25%]';
    case 30: return 'w-[30%]';
    case 35: return 'w-[35%]';
    case 40: return 'w-[40%]';
    case 45: return 'w-[45%]';
    case 50: return 'w-[50%]';
    case 55: return 'w-[55%]';
    case 60: return 'w-[60%]';
    case 65: return 'w-[65%]';
    case 70: return 'w-[70%]';
    case 75: return 'w-[75%]';
    case 80: return 'w-[80%]';
    case 85: return 'w-[85%]';
    case 90: return 'w-[90%]';
    case 95: return 'w-[95%]';
    case 100: return 'w-full';
    default: return 'w-0';
  }
};
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
import { academyOverview, academyStats, enrolledCourses as fallbackEnrolledCourses } from '../../features/academy/content';
import { AcademyProgressResponse, fetchAcademyProgress } from '../../features/academy/api';

type ProgressCard = {
  id: string;
  title: string;
  description: string;
  instructor: string;
  category: string;
  progress: number;
  lessons: number;
  completedLessons: number;
  activeLesson?: string;
  coverColor: string;
};

export default function DashboardHome() {
  const pathname = usePathname();
  const { profile } = useAuth();
  const [academyProgress, setAcademyProgress] = useState<AcademyProgressResponse | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadAcademyProgress() {
      if (!profile || (profile.purpose !== 'learn' && profile.purpose !== 'both')) {
        setAcademyProgress(null);
        return;
      }

      try {
        const data = await fetchAcademyProgress();
        if (!cancelled) {
          setAcademyProgress(data);
        }
      } catch {
        if (!cancelled) {
          setAcademyProgress(null);
        }
      }
    }

    loadAcademyProgress();

    return () => {
      cancelled = true;
    };
  }, [profile?.purpose, profile?.userId]);

  if (!profile) return null;

  const purpose = profile.purpose || 'learn';
  const name = profile.firstName || 'User';
  const portalBasePath = pathname?.startsWith('/student') ? '/student' : '/dashboard';
  const portalLinks = purpose === 'learn'
    ? [
        {
          title: 'Printing Portal',
          desc: 'Print documents, IDs, flyers, and other support files.',
          href: '/printing',
          icon: Printer,
          accent: 'from-rose-500/10 to-pink-500/10 border-rose-500/20 text-rose-300'
        },
        {
          title: 'Project / App Build Portal',
          desc: 'Send a brief for project write-up, code support, or app development.',
          href: '/projects',
          icon: Briefcase,
          accent: 'from-cyan-500/10 to-blue-500/10 border-cyan-500/20 text-cyan-300'
        }
      ]
    : purpose === 'print'
      ? [
        {
          title: 'Academy Portal',
          desc: 'Jump back into lessons, assignments, and course progress.',
          href: `${portalBasePath}/courses`,
          icon: BookOpen,
          accent: 'from-indigo-500/10 to-purple-500/10 border-indigo-500/20 text-indigo-300'
        },
        {
          title: 'Project / App Build Portal',
          desc: 'Request help with a thesis project, codebase, or software build.',
          href: '/projects',
          icon: Briefcase,
          accent: 'from-cyan-500/10 to-blue-500/10 border-cyan-500/20 text-cyan-300'
        }
        ]
      : purpose === 'hire'
        ? [
            {
              title: 'Academy Portal',
              desc: 'Access the learning workspace for classes and assignments.',
              href: `${portalBasePath}/courses`,
              icon: BookOpen,
              accent: 'from-indigo-500/10 to-purple-500/10 border-indigo-500/20 text-indigo-300'
            },
            {
              title: 'Printing Portal',
              desc: 'Place document and design print requests whenever needed.',
              href: '/printing',
              icon: Printer,
              accent: 'from-rose-500/10 to-pink-500/10 border-rose-500/20 text-rose-300'
            }
          ]
        : [
            {
              title: 'Academy Portal',
              desc: 'Continue learning with your courses and live class schedule.',
              href: `${portalBasePath}/courses`,
              icon: BookOpen,
              accent: 'from-indigo-500/10 to-purple-500/10 border-indigo-500/20 text-indigo-300'
            },
            {
              title: 'Printing Portal',
              desc: 'Send print jobs for documents, flyers, and booklets.',
              href: '/printing',
              icon: Printer,
              accent: 'from-rose-500/10 to-pink-500/10 border-rose-500/20 text-rose-300'
            },
            {
              title: 'Project / App Build Portal',
              desc: 'Open a separate request for project writing or app development.',
              href: '/projects',
              icon: Briefcase,
              accent: 'from-cyan-500/10 to-blue-500/10 border-cyan-500/20 text-cyan-300'
            }
          ];

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

      {purpose === 'both' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Need a different portal?</h2>
            <span className="text-[11px] font-semibold text-slate-500">Your access is split by purpose</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {portalLinks.map((portal) => {
              const Icon = portal.icon;

              return (
                <Link
                  key={portal.title}
                  href={portal.href}
                  className={`group rounded-2xl border bg-gradient-to-br p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${portal.accent}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="h-10 w-10 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-center">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-4 text-base font-bold text-white">{portal.title}</h3>
                      <p className="mt-2 text-sm text-slate-300 leading-6">{portal.desc}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {purpose === 'learn' && <AcademyOverview snapshot={academyProgress} portalBasePath={portalBasePath} />}
      {purpose === 'hire' && <AgencyOverview portalBasePath={portalBasePath} />}
      {purpose === 'print' && <PrintingOverview portalBasePath={portalBasePath} />}
      {purpose === 'both' && (
        <div className="space-y-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="border border-white/5 bg-slate-900/20 backdrop-blur-md rounded-3xl p-6 lg:p-8">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-400" />
                Programming Academy
              </h2>
              <AcademyOverview snapshot={academyProgress} portalBasePath={portalBasePath} isUnified={true} />
            </div>
            <div className="border border-white/5 bg-slate-900/20 backdrop-blur-md rounded-3xl p-6 lg:p-8">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-cyan-400" />
                Software and Projects
              </h2>
              <AgencyOverview portalBasePath={portalBasePath} isUnified={true} />
            </div>
          </div>
          <div className="border border-white/5 bg-slate-900/20 backdrop-blur-md rounded-3xl p-6 lg:p-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Printer className="h-5 w-5 text-rose-400" />
              Printing and Design
            </h2>
            <PrintingOverview portalBasePath={portalBasePath} isUnified={true} />
          </div>
        </div>
      )}
    </div>
  );
}

function AcademyOverview({
  snapshot,
  portalBasePath,
  isUnified = false
}: {
  snapshot: AcademyProgressResponse | null;
  portalBasePath: string;
  isUnified?: boolean;
}) {
  const summary = snapshot?.summary ?? academyStats;
  const progressCards: ProgressCard[] = snapshot
    ? snapshot.enrollments.map((enrollment) => ({
        id: enrollment.id,
        title: enrollment.course.title,
        description: enrollment.course.description,
        instructor: enrollment.course.instructorName,
        category: enrollment.course.category || 'Academy',
        progress: enrollment.progress || 0,
        lessons: enrollment.course.lessonCount || 0,
        completedLessons: enrollment.completedLessons || 0,
        activeLesson: enrollment.nextLesson ? `Lesson ${enrollment.nextLesson.order}: ${enrollment.nextLesson.title}` : 'Next lesson unavailable',
        coverColor: 'from-indigo-600 to-purple-600'
      }))
    : fallbackEnrolledCourses.map((course) => ({
        id: course.id,
        title: course.title,
        description: course.description,
        instructor: course.instructor,
        category: course.category,
        progress: course.progress || 0,
        lessons: course.lessons,
        completedLessons: course.completedLessons || 0,
        activeLesson: course.activeLesson,
        coverColor: course.coverColor
      }));

  return (
    <div className="space-y-6">
      <div className={`grid gap-4 ${isUnified ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-4'}`}>
        <div className="glass-card rounded-2xl border border-white/5 bg-slate-900/40 p-5">
          <span className="text-xs text-slate-400 font-medium block">Enrolled Courses</span>
          <span className="text-2xl font-extrabold text-white mt-1.5 block">
            {summary.enrolledCourses}
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
                {summary.completedLessons}
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
          <Link href={`${portalBasePath}/courses`} className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1">
            All Courses <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="space-y-3">
          {progressCards.length > 0 ? (
            progressCards.map((course) => (
              <div key={course.id} className="glass-panel border border-white/5 bg-slate-950/40 hover:bg-slate-900/40 rounded-2xl p-5 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-semibold tracking-wide uppercase">
                      {course.category}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1.5">{course.title}</h4>
                  </div>
                  <span className="text-xs font-bold text-indigo-400">{course.progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500 ${getProgressWidthClass(course.progress)}`}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> Next: {course.activeLesson}
                  </span>
                  <span>{course.lessons} lessons total</span>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/30 p-6 text-center">
              <BookOpen className="mx-auto h-10 w-10 text-slate-700" />
              <p className="mt-3 text-sm text-slate-400">No academy enrollments yet. Browse the course catalog to start learning.</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link href={`${portalBasePath}/courses`} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 font-semibold text-xs transition-colors">
          <span className="flex items-center gap-2">
            <Video className="h-4 w-4" /> Start Next Lesson
          </span>
          <ChevronRight className="h-4 w-4" />
        </Link>
        <Link href={`${portalBasePath}/messages`} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-slate-900/50 hover:bg-slate-900 text-slate-300 font-semibold text-xs transition-colors">
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Ask Instructor or Mentor
          </span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function AgencyOverview({ portalBasePath, isUnified = false }: { portalBasePath: string; isUnified?: boolean }) {
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
          <Link href={`${portalBasePath}/projects`} className="text-xs font-semibold text-cyan-400 hover:underline flex items-center gap-1">
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
                  className={`h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all duration-500 ${getProgressWidthClass(project.progress)}`}
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
        <Link href="/projects" className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-300 font-semibold text-xs transition-colors">
          <span className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Request New Service
          </span>
          <ChevronRight className="h-4 w-4" />
        </Link>
        <Link href={`${portalBasePath}/payments`} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-slate-900/50 hover:bg-slate-900 text-slate-300 font-semibold text-xs transition-colors">
          <span className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> View Pending Invoices
          </span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function PrintingOverview({ portalBasePath, isUnified = false }: { portalBasePath: string; isUnified?: boolean }) {
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
          <Link href="/printing" className="text-xs font-semibold text-rose-400 hover:underline flex items-center gap-1">
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
        <Link href="/printing" className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-rose-600/10 hover:bg-rose-600/20 text-rose-300 font-semibold text-xs transition-colors">
          <span className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Place New Order
          </span>
          <ChevronRight className="h-4 w-4" />
        </Link>
        <Link href={`${portalBasePath}/payments`} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-slate-900/50 hover:bg-slate-900 text-slate-300 font-semibold text-xs transition-colors">
          <span className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> View Payment History
          </span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
