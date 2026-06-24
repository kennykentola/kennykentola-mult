'use client';

import { useAuth } from '../../features/auth/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Hammer, Zap, Settings, MessageSquare, ArrowLeft } from 'lucide-react';

export default function MaintenanceLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !profile) {
      router.push('/login');
    }
  }, [profile, loading, router]);

  if (loading || !profile) {
    return <div className="flex h-screen items-center justify-center bg-slate-950 text-indigo-400">Loading Client Portal...</div>;
  }

  const navItems = [
    { name: 'IT Maintenance Contracts', href: '/maintenance/contracts', icon: Hammer },
    { name: 'Solar & Electrical Jobs', href: '/maintenance/solar', icon: Zap },
    { name: 'Messages', href: '/dashboard/chat', icon: MessageSquare },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-950 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white tracking-tight">Client Portal</h2>
          <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-bold">IT Maintenance & Solar</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all font-semibold ${
                  isActive 
                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-amber-500' : 'text-slate-500'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 font-bold">
              {profile.firstName.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{profile.firstName} {profile.lastName}</p>
              <p className="text-xs text-slate-500 truncate">{profile.role}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full px-4 py-2 text-sm font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 rounded-md transition-colors"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-950">
        <div className="p-6 lg:p-10 min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
