'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../features/auth/AuthContext';
import { getLandingRoute, isRouteAllowed } from '../../lib/routeAccess';
import { 
  LayoutDashboard, 
  GraduationCap, 
  Briefcase, 
  Printer,
  MessageSquare, 
  CreditCard, 
  User, 
  LogOut,
  Menu,
  X,
  Shield,
  FileText,
  FileCheck,
  Settings
} from 'lucide-react';
import Link from 'next/link';
import { NotificationBell } from '../../components/NotificationBell';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { profile, loading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isStudentPortal = pathname?.startsWith('/student');
  const isPrintingPortal = pathname?.startsWith('/printing');
  const isProjectsPortal = pathname?.startsWith('/projects');
  
  const portalBasePath = isStudentPortal 
    ? '/student' 
    : isPrintingPortal 
      ? '/printing' 
      : isProjectsPortal 
        ? '/projects' 
        : '/dashboard';

  useEffect(() => {
    if (!loading) {
      if (!profile) {
        router.replace('/login');
        return;
      }

      const currentPath = pathname || '';
      if (!isRouteAllowed(currentPath, profile)) {
        router.replace(getLandingRoute(profile));
      }
    }
  }, [profile, loading, pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm animate-pulse">Loading secure workspace...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const userPurpose = profile.purpose || 'learn';
  const userRole = profile.role || 'Student';
  const portalLabel = userPurpose === 'learn'
    ? (isStudentPortal ? 'Student Portal' : 'Academy Portal')
    : userPurpose === 'hire'
      ? 'Project / App Build Portal'
      : userPurpose === 'print'
        ? 'Printing Portal'
        : 'Unified Portal';

  // Base navigation constructed dynamically based on the current active route prefix
  const navItems = [];
  if (isStudentPortal) {
    navItems.push(
      { name: 'Overview', href: '/student/dashboard', icon: LayoutDashboard },
      { name: 'My Courses', href: '/student/courses', icon: GraduationCap },
      { name: 'Assignments', href: '/student/assignments', icon: FileCheck },
      { name: 'Community Feed', href: '/student/community', icon: MessageSquare },
      { name: 'Certificates', href: '/student/certificates', icon: FileText },
      { name: 'Messages', href: '/student/messages', icon: MessageSquare },
      { name: 'Payments', href: '/student/payments', icon: CreditCard },
      { name: 'Profile', href: '/student/profile', icon: User },
      { name: 'Settings', href: '/student/settings', icon: Settings }
    );
  } else if (isPrintingPortal) {
    navItems.push(
      { name: 'Print Orders', href: '/printing', icon: Printer },
      { name: 'Messages', href: '/printing/messages', icon: MessageSquare },
      { name: 'Payments', href: '/printing/payments', icon: CreditCard },
      { name: 'Profile', href: '/printing/profile', icon: User }
    );
  } else if (isProjectsPortal) {
    navItems.push(
      { name: 'Projects', href: '/projects', icon: Briefcase },
      { name: 'Messages', href: '/projects/messages', icon: MessageSquare },
      { name: 'Payments', href: '/projects/payments', icon: CreditCard },
      { name: 'Profile', href: '/projects/profile', icon: User }
    );
  } else {
    navItems.push(
      { name: 'Overview', href: getLandingRoute(profile), icon: LayoutDashboard }
    );
  }

  const isAdmin = userRole === 'Admin' || userRole === 'Printer Operator' || userRole === 'Instructor';

  const handleSignOut = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans flex text-slate-200">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-[40%] h-[30%] rounded-full bg-indigo-900/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40%] h-[30%] rounded-full bg-cyan-900/10 blur-[100px] pointer-events-none" />

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 h-screen z-30 shrink-0">
        <div className="flex h-16 items-center px-6 border-b border-slate-900 gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center font-bold text-white shadow-md">
            K
          </div>
          <div className="min-w-0">
            <span className="block text-lg font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              KennyKentola
            </span>
            <span className="block text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              {portalLabel}
            </span>
          </div>
          <button
            onClick={handleSignOut}
            className="ml-auto rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-[11px] font-semibold text-slate-400 hover:border-rose-500/30 hover:text-rose-400 hover:bg-rose-950/20 transition-all duration-200"
            aria-label="Sign out"
            title="Sign out"
          >
            Sign Out
          </button>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active 
                    ? 'bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 shadow-sm shadow-indigo-500/5' 
                    : 'border border-transparent text-slate-400 hover:text-white hover:bg-slate-900/50'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}

          {isAdmin && (
            <div className="pt-6 border-t border-slate-900 mt-6 space-y-1">
              <span className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Administration
              </span>
              <Link
                href="/admin"
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  pathname?.startsWith('/admin')
                    ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                    : 'border border-transparent text-slate-400 hover:text-white hover:bg-slate-900/50'
                }`}
              >
                <Shield className="h-4 w-4" />
                Admin Panel
              </Link>
            </div>
          )}
        </nav>

        {/* User Card */}
        <div className="p-4 border-t border-slate-900 bg-slate-900/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 flex justify-end">
              <NotificationBell />
            </div>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-indigo-400 uppercase">
              {profile.firstName[0]}
              {profile.lastName[0]}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{profile.firstName} {profile.lastName}</p>
              <p className="text-[10px] text-slate-500 truncate capitalize">{profile.role}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900/80 hover:bg-rose-950/20 border border-slate-800 hover:border-rose-500/30 py-2 text-xs font-semibold text-slate-400 hover:text-rose-400 transition-all duration-200"
          >
            <LogOut className="h-3 w-3" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Sidebar - Mobile Toggle Menu */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative flex flex-col w-64 bg-slate-950 border-r border-slate-900 h-full p-4 z-50 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-900">
              <span className="font-bold text-white">Workspace Menu</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-slate-400 hover:text-white"
                title="Close menu"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 py-6 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      active 
                        ? 'bg-indigo-600/10 border border-indigo-500/20 text-indigo-400' 
                        : 'border border-transparent text-slate-400 hover:text-white hover:bg-slate-900/50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}

              {isAdmin && (
                <div className="pt-6 border-t border-slate-900 mt-6 space-y-1">
                  <span className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                    Administration
                  </span>
                  <Link
                    href="/admin"
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      pathname?.startsWith('/admin')
                        ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                        : 'border border-transparent text-slate-400 hover:text-white hover:bg-slate-900/50'
                    }`}
                  >
                    <Shield className="h-4 w-4" />
                    Admin Panel
                  </Link>
                </div>
              )}
            </nav>

            <div className="pt-4 border-t border-slate-900">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-rose-950/20 border border-slate-800 hover:border-rose-500/30 py-2.5 text-xs font-semibold text-slate-400 hover:text-rose-400 transition-all duration-200"
              >
                <LogOut className="h-3 w-3" />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto min-h-screen">
        {/* Mobile Header Bar */}
        <header className="lg:hidden h-16 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white">
              K
            </div>
            <div>
              <span className="block text-lg font-bold text-white">KennyKentola</span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                {portalLabel}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <button
              onClick={handleSignOut}
              className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-slate-400 hover:border-rose-500/30 hover:text-rose-400 transition-all duration-200"
              title="Sign out"
              aria-label="Sign out"
            >
              Sign Out
            </button>
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -mr-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900"
              title="Open menu"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </header>

        {/* Dynamic Page Workspace */}
        <main className="flex-1 p-6 lg:p-10 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
