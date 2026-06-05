'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../features/auth/AuthContext';
import { 
  Shield, 
  Users, 
  BookOpen, 
  Layers, 
  Printer,
  FileCheck, 
  Settings, 
  ArrowLeft,
  Menu,
  X,
  ShieldAlert
} from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { profile, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!profile || (profile.role !== 'Admin' && profile.role !== 'Printer Operator'))) {
      router.push('/dashboard');
    }
  }, [profile, loading, router]);

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

  if (!profile || (profile.role !== 'Admin' && profile.role !== 'Printer Operator')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-6">
        <div className="max-w-md text-center space-y-4">
          <ShieldAlert className="mx-auto h-16 w-16 text-rose-500 animate-pulse" />
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-slate-400 text-sm">
            Your account role ({profile?.role || 'Guest'}) does not have sufficient permissions to view the administration terminal.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="rounded-xl bg-slate-900 border border-slate-800 px-6 py-3 text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: 'Admin Overview', href: '/admin', icon: Shield },
    { name: 'Configure Users', href: '/admin/users', icon: Users },
    { name: 'Course Manager', href: '/admin/courses', icon: BookOpen },
    { name: 'Academy Review', href: '/admin/assignments', icon: FileCheck },
    { name: 'Project Board', href: '/admin/projects', icon: Layers },
    { name: 'Print Orders', href: '/admin/printing', icon: Printer },
    { name: 'Verify Payments', href: '/admin/payments', icon: FileCheck },
    { name: 'System Settings', href: '/admin/settings', icon: Settings },
  ];

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
                    ? 'bg-rose-500/10 border border-rose-500/20 text-rose-450 shadow-sm shadow-rose-500/5' 
                    : 'border border-transparent text-slate-400 hover:text-white hover:bg-slate-900/50'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Back to User Dashboard */}
        <div className="p-4 border-t border-slate-900">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 py-2.5 text-xs font-semibold text-slate-450 transition-all duration-200"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Dashboard
          </button>
        </div>
      </aside>

      {/* Sidebar - Mobile Toggle Menu */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative flex flex-col w-64 bg-slate-950 border-r border-slate-900 h-full p-4 z-50 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-900">
              <span className="font-bold text-white">Admin Workspace</span>
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
                        ? 'bg-rose-500/10 border border-rose-500/20 text-rose-450' 
                        : 'border border-transparent text-slate-400 hover:text-white hover:bg-slate-900/50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-slate-900">
              <button
                onClick={() => {
                  setSidebarOpen(false);
                  router.push('/dashboard');
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 border border-slate-800 py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition-all duration-200"
              >
                <ArrowLeft className="h-3 w-3" />
                Back to Dashboard
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
            <div className="h-8 w-8 rounded-lg bg-rose-600 flex items-center justify-center font-bold text-white">
              A
            </div>
            <span className="text-lg font-bold text-white">Admin Terminal</span>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -mr-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900"
            title="Open menu"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </header>

        {/* Dynamic Page Workspace */}
        <main className="flex-1 p-6 lg:p-10 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
