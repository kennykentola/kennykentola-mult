'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../features/auth/AuthContext';
import { getLandingRoute, isRouteAllowed } from '../../lib/routeAccess';
import { 
  Shield, 
  Users, 
  DollarSign, 
  Settings, 
  ArrowLeft,
  Menu,
  X,
  ShieldAlert,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { profile, loading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleSignOut = async () => {
    await logout();
    router.replace('/login');
  };

  useEffect(() => {
    if (!loading && (!profile || !isRouteAllowed(pathname || '', profile))) {
      router.replace(profile ? getLandingRoute(profile) : '/login');
    }
  }, [profile, loading, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm animate-pulse">Authenticating System Console...</p>
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
            You do not have access to the system console.
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

  const navItems = [
    { name: 'System Overview', href: '/super-admin/dashboard', icon: BarChart3 },
    { name: 'User Management', href: '/super-admin/users', icon: Users },
    { name: 'Instructor Payouts', href: '/super-admin/payouts', icon: DollarSign },
    { name: 'Global Settings', href: '/super-admin/settings', icon: Settings },
    { name: 'Admin Terminal', href: '/admin', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-slate-950 font-sans flex text-slate-200">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-[40%] h-[30%] rounded-full bg-indigo-950/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40%] h-[30%] rounded-full bg-purple-950/10 blur-[100px] pointer-events-none" />

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 h-screen z-30 shrink-0">
        <div className="flex h-16 items-center px-6 border-b border-slate-900 justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-400 flex items-center justify-center font-bold text-white shadow-md">
              SA
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              System Console
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

        <nav className="flex-1 py-6 px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active 
                    ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shadow-sm shadow-indigo-500/5' 
                    : 'border border-transparent text-slate-400 hover:text-white hover:bg-slate-900/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Back to User Dashboard */}
        <div className="p-4 border-t border-slate-900">
          <button
            onClick={() => router.replace(getLandingRoute(profile))}
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
              <span className="font-bold text-white">System Console</span>
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
                    className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      active 
                        ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400' 
                        : 'border border-transparent text-slate-400 hover:text-white hover:bg-slate-900/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </div>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-slate-900">
              <button
                onClick={() => {
                  setSidebarOpen(false);
                  router.replace(getLandingRoute(profile));
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
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white">
              SA
            </div>
            <span className="text-lg font-bold text-white">System Console</span>
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

        {/* Dynamic Page Workspace */}
        <main className="flex-1 p-6 lg:p-10 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
