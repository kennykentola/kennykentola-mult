'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../features/auth/AuthContext';
import { getLandingRoute, isRouteAllowed } from '../../lib/routeAccess';
import { getAdminPendingPayments } from '../../features/payments/paymentsService';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  Briefcase, 
  BookOpen,
  Printer,
  ShieldAlert,
  HardHat,
  GraduationCap,
  Hammer,
  Zap,
  Menu,
  X,
  FileCheck, 
  MessageSquare,
  Layout,
  Palette,
  Mail,
  Bot,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { profile, loading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const handleSignOut = async () => {
    await logout();
    router.replace('/login');
  };

  useEffect(() => {
    if (!loading && profile && (profile.role === 'Admin' || profile.role === 'Super Admin')) {
      const fetchPending = async () => {
        try {
          const data = await getAdminPendingPayments();
          setPendingCount(data.length);
        } catch (err) {
          console.error('[AdminLayout] Failed to load pending payments:', err);
        }
      };
      // Load initially
      fetchPending();
      
      // Update count every 20 seconds
      const interval = setInterval(fetchPending, 20000);
      return () => clearInterval(interval);
    }
  }, [profile, loading]);

  useEffect(() => {
    if (!loading && (!profile || !isRouteAllowed(pathname || '', profile))) {
      router.replace(profile ? getLandingRoute(profile) : '/login');
    }
  }, [profile, loading, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm animate-pulse">Loading admin terminal...</p>
        </div>
      </div>
    );
  }

  if (!profile || !isRouteAllowed(pathname || '', profile)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-6">
        <div className="max-w-md text-center space-y-4">
          <ShieldAlert className="mx-auto h-16 w-16 text-rose-500 animate-pulse" />
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-slate-400 text-sm">
            Your account does not have access to the administration terminal.
          </p>
          <button
            onClick={() => router.replace(profile ? getLandingRoute(profile) : '/login')}
            className="rounded-xl bg-slate-900 border border-slate-800 px-6 py-3 text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            Return to your portal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans flex text-slate-200">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-[40%] h-[30%] rounded-full bg-rose-950/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40%] h-[30%] rounded-full bg-indigo-950/10 blur-[100px] pointer-events-none" />

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 h-screen z-30 shrink-0">
        <div className="flex h-16 items-center px-6 border-b border-slate-900 justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-rose-500 to-orange-400 flex items-center justify-center font-bold text-white shadow-md">
              A
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Admin Terminal
            </span>
          </div>
          <button
            onClick={handleSignOut}
            className="rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-[11px] font-semibold text-slate-400 hover:border-rose-500/30 hover:text-rose-400 hover:bg-rose-950/20 transition-all duration-200"
            aria-label="Sign out"
            title="Sign out"
          >
            Sign Out
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-6 overflow-y-auto">
          {/* Main Dash */}
          <div className="space-y-1">
            <Link href="/admin" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${pathname === '/admin' ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </Link>
            <Link href="/admin/analytics" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${pathname === '/admin/analytics' ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              <BarChart3 className="h-4 w-4" />
              Analytics & Traffic
            </Link>
          </div>

          {/* Software Agency Pipeline */}
          <div className="space-y-1">
            <p className="px-3 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Software Agency</p>
            <Link href="/admin/projects" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${pathname === '/admin/projects' ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              <Briefcase className="h-4 w-4" />
              Agency Projects
            </Link>
            <Link href="/admin/agency/portfolio" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${pathname?.includes('/admin/agency/portfolio') ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              <Layout className="h-4 w-4" />
              Project Portfolio
            </Link>
            <Link href="/admin/agency/design-portfolio" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${pathname?.includes('/admin/agency/design-portfolio') ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              <Palette className="h-4 w-4" />
              Design Portfolio
            </Link>
            <Link href="/admin/agency/crm" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${pathname?.includes('/admin/agency/crm') ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              <Layout className="h-4 w-4" />
              CRM Pipeline
            </Link>
          </div>

          {/* Academic Projects Pipeline */}
          <div className="space-y-1">
            <p className="px-3 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Academic & Thesis</p>
            <Link href="/admin/academic" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${pathname?.includes('/admin/academic') && !pathname?.includes('/admin/academy/ideas') && !pathname?.includes('/admin/academy/thesis') ? 'bg-sky-500/10 text-sky-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              <GraduationCap className="h-4 w-4" />
              CS Projects
            </Link>
            <Link href="/admin/academy/thesis" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${pathname?.includes('/admin/academy/thesis') ? 'bg-sky-500/10 text-sky-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              <FileCheck className="h-4 w-4" />
              Thesis Samples
            </Link>
            <Link href="/admin/academy/ideas" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${pathname?.includes('/admin/academy/ideas') ? 'bg-sky-500/10 text-sky-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              <BookOpen className="h-4 w-4" />
              Project Ideas
            </Link>
          </div>

          {/* Printing Pipeline */}
          <div className="space-y-1">
            <p className="px-3 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Printing Press</p>
            <Link href="/admin/printing" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${pathname?.includes('/admin/printing') ? 'bg-fuchsia-500/10 text-fuchsia-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              <Printer className="h-4 w-4" />
              Print Jobs
            </Link>
          </div>

          {/* Maintenance & Solar Pipeline */}
          <div className="space-y-1">
            <p className="px-3 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Maintenance & IT</p>
            <Link href="/admin/maintenance" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${pathname?.includes('/admin/maintenance') ? 'bg-amber-500/10 text-amber-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              <Hammer className="h-4 w-4" />
              IT Contracts
            </Link>
            <Link href="/admin/solar" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${pathname?.includes('/admin/solar') ? 'bg-yellow-500/10 text-yellow-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              <Zap className="h-4 w-4" />
              Solar & Network
            </Link>
          </div>

          {/* Internal Tools */}
          <div className="space-y-1">
            <p className="px-3 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Internal</p>
            <Link href="/admin/prompts" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${pathname?.includes('/admin/prompts') ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              <Bot className="h-4 w-4" />
              AI Prompt Generator
            </Link>
            <Link href="/admin/courses" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
              <BookOpen className="h-4 w-4" />
              Academy Content
            </Link>
            <Link href="/admin/learning-paths" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${pathname?.includes('/admin/learning-paths') ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              <Layout className="h-4 w-4" />
              Learning Paths
            </Link>
            <Link href="/admin/newsletter" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${pathname?.includes('/admin/newsletter') ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              <Mail className="h-4 w-4" />
              Newsletter Broadcast
            </Link>
            <Link href="/admin/blog" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${pathname?.includes('/admin/blog') ? 'bg-orange-500/10 text-orange-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              <FileCheck className="h-4 w-4" />
              Blog Manager
            </Link>
          </div>
        </nav>

        {/* Back to User Dashboard */}
        <div className="p-4 border-t border-slate-900">
          <button
            onClick={() => router.replace(getLandingRoute(profile))}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 py-2.5 text-xs font-semibold text-slate-450 transition-all duration-200"
          >
            Back to Dashboard
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto min-h-screen">
        {/* Mobile Header Bar */}
        <header className="lg:hidden h-16 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-rose-500 to-orange-400 flex items-center justify-center font-bold text-white shadow-md">
              A
            </div>
            <span className="text-lg font-bold text-white">Admin Terminal</span>
          </div>
          <div className="flex items-center gap-2">
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

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
              onClick={() => setSidebarOpen(false)}
            />
            
            {/* Sidebar Drawer */}
            <div className="fixed inset-y-0 right-0 w-64 max-w-sm bg-slate-950 shadow-2xl flex flex-col transform transition-transform border-l border-slate-900 overflow-y-auto">
              <div className="flex h-16 items-center px-6 border-b border-slate-900 justify-between">
                <span className="text-lg font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  Menu
                </span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  title="Close Menu"
                  aria-label="Close Menu"
                  className="p-2 -mr-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <nav className="flex-1 px-4 py-6 space-y-6">
                <div className="space-y-1">
                  <Link onClick={() => setSidebarOpen(false)} href="/admin" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${pathname === '/admin' ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                    <LayoutDashboard className="h-4 w-4" />
                    Overview
                  </Link>
                  <Link onClick={() => setSidebarOpen(false)} href="/admin/analytics" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${pathname === '/admin/analytics' ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                    <BarChart3 className="h-4 w-4" />
                    Analytics & Traffic
                  </Link>
                </div>

                <div className="space-y-1">
                  <p className="px-3 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Software Agency</p>
                  <Link onClick={() => setSidebarOpen(false)} href="/admin/projects" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${pathname === '/admin/projects' ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                    <Briefcase className="h-4 w-4" />
                    Agency Projects
                  </Link>
                  <Link onClick={() => setSidebarOpen(false)} href="/admin/agency/portfolio" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${pathname?.includes('/admin/agency/portfolio') ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                    <Layout className="h-4 w-4" />
                    Project Portfolio
                  </Link>
                  <Link onClick={() => setSidebarOpen(false)} href="/admin/agency/design-portfolio" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${pathname?.includes('/admin/agency/design-portfolio') ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                    <Palette className="h-4 w-4" />
                    Design Portfolio
                  </Link>
                  <Link onClick={() => setSidebarOpen(false)} href="/admin/agency/crm" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${pathname?.includes('/admin/agency/crm') ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                    <Layout className="h-4 w-4" />
                    CRM Pipeline
                  </Link>
                </div>

                <div className="space-y-1">
                  <p className="px-3 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Academic & Thesis</p>
                  <Link onClick={() => setSidebarOpen(false)} href="/admin/academic" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${pathname?.includes('/admin/academic') && !pathname?.includes('/admin/academy/ideas') && !pathname?.includes('/admin/academy/thesis') ? 'bg-sky-500/10 text-sky-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                    <GraduationCap className="h-4 w-4" />
                    CS Projects
                  </Link>
                  <Link onClick={() => setSidebarOpen(false)} href="/admin/academy/thesis" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${pathname?.includes('/admin/academy/thesis') ? 'bg-sky-500/10 text-sky-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                    <FileCheck className="h-4 w-4" />
                    Thesis Samples
                  </Link>
                  <Link onClick={() => setSidebarOpen(false)} href="/admin/academy/ideas" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${pathname?.includes('/admin/academy/ideas') ? 'bg-sky-500/10 text-sky-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                    <BookOpen className="h-4 w-4" />
                    Project Ideas
                  </Link>
                </div>

                <div className="space-y-1">
                  <p className="px-3 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Printing Press</p>
                  <Link onClick={() => setSidebarOpen(false)} href="/admin/printing" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${pathname?.includes('/admin/printing') ? 'bg-fuchsia-500/10 text-fuchsia-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                    <Printer className="h-4 w-4" />
                    Print Jobs
                  </Link>
                </div>

                <div className="space-y-1">
                  <p className="px-3 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Maintenance & IT</p>
                  <Link onClick={() => setSidebarOpen(false)} href="/admin/maintenance" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${pathname?.includes('/admin/maintenance') ? 'bg-amber-500/10 text-amber-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                    <Hammer className="h-4 w-4" />
                    IT Contracts
                  </Link>
                  <Link onClick={() => setSidebarOpen(false)} href="/admin/solar" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${pathname?.includes('/admin/solar') ? 'bg-yellow-500/10 text-yellow-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                    <Zap className="h-4 w-4" />
                    Solar & Network
                  </Link>
                </div>

                <div className="space-y-1">
                  <p className="px-3 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Internal</p>
                  <Link onClick={() => setSidebarOpen(false)} href="/admin/prompts" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${pathname?.includes('/admin/prompts') ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                    <Bot className="h-4 w-4" />
                    AI Prompt Generator
                  </Link>
                  <Link onClick={() => setSidebarOpen(false)} href="/admin/courses" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                    <BookOpen className="h-4 w-4" />
                    Academy Content
                  </Link>
                  <Link onClick={() => setSidebarOpen(false)} href="/admin/learning-paths" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${pathname?.includes('/admin/learning-paths') ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                    <Layout className="h-4 w-4" />
                    Learning Paths
                  </Link>
                  <Link onClick={() => setSidebarOpen(false)} href="/admin/newsletter" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${pathname?.includes('/admin/newsletter') ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                    <Mail className="h-4 w-4" />
                    Newsletter Broadcast
                  </Link>
                  <Link onClick={() => setSidebarOpen(false)} href="/admin/blog" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${pathname?.includes('/admin/blog') ? 'bg-orange-500/10 text-orange-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                    <FileCheck className="h-4 w-4" />
                    Blog Manager
                  </Link>
                </div>
              </nav>

              <div className="p-4 border-t border-slate-900 mt-auto">
                <button
                  onClick={() => router.replace(getLandingRoute(profile))}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 py-2.5 text-xs font-semibold text-slate-450 transition-all duration-200"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Page Workspace */}
        <main className="flex-1 p-6 lg:p-10 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
