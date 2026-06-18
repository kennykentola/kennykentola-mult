'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { NotificationProvider } from '@/features/notifications/NotificationProvider';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="flex h-screen items-center justify-center bg-background text-primary">Loading...</div>;
  }

  // Assuming user.prefs contains role, fallback to 'Client'
  const role = (user.prefs as any)?.role || 'Client';

  return (
    <NotificationProvider>
      <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-bold text-primary-foreground tracking-tight">Ecosystem OS</h2>
          <p className="text-xs text-muted mt-1 uppercase tracking-wider">{role} Portal</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          <Link href="/dashboard" className="block px-4 py-2 rounded-md text-muted hover:bg-white/5 hover:text-primary-foreground transition-colors">
            Overview
          </Link>
          
          {(role === 'Super Admin' || role === 'Project Manager' || role === 'Client') && (
            <Link href="/dashboard/projects" className="block px-4 py-2 rounded-md text-muted hover:bg-white/5 hover:text-primary-foreground transition-colors">
              Agency Projects
            </Link>
          )}

          <Link href="/dashboard/academy" className="block px-4 py-2 rounded-md text-muted hover:bg-white/5 hover:text-primary-foreground transition-colors">
            Academy
          </Link>

          <Link href="/dashboard/printing" className="block px-4 py-2 rounded-md text-muted hover:bg-white/5 hover:text-primary-foreground transition-colors">
            Printing Services
          </Link>

          <Link href="/dashboard/academic" className="block px-4 py-2 rounded-md text-muted hover:bg-white/5 hover:text-primary-foreground transition-colors">
            Academic Projects
          </Link>

          <Link href="/dashboard/maintenance" className="block px-4 py-2 rounded-md text-muted hover:bg-white/5 hover:text-primary-foreground transition-colors">
            Maintenance Contracts
          </Link>

          <Link href="/dashboard/solar" className="block px-4 py-2 rounded-md text-muted hover:bg-white/5 hover:text-primary-foreground transition-colors">
            Solar & Electrical
          </Link>

          <Link href="/dashboard/settings" className="block px-4 py-2 rounded-md text-muted hover:bg-white/5 hover:text-primary-foreground transition-colors">
            Settings
          </Link>
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-primary-foreground truncate">{user.name}</p>
              <p className="text-xs text-muted truncate">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full px-4 py-2 text-sm text-red-400 bg-red-400/10 hover:bg-red-400/20 rounded-md transition-colors"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
    </NotificationProvider>
  );
}
