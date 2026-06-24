'use client';

import { useAuth } from '../../features/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function AcademicLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !profile) {
      router.push('/login');
    }
  }, [profile, loading, router]);

  if (loading || !profile) {
    return <div className="flex h-screen items-center justify-center bg-slate-950 text-indigo-400">Loading Academic Dashboard...</div>;
  }

  return (
    <div className="flex h-screen bg-slate-950 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white tracking-tight">University Portal</h2>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">CS Projects & Thesis</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          <Link href="/academic" className="block px-4 py-2 rounded-md bg-indigo-500/10 text-indigo-300 font-semibold transition-colors">
            My Projects
          </Link>
          
          <Link href="/chat" className="block px-4 py-2 rounded-md text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
            Messages
          </Link>

          <Link href="/dashboard/profile" className="block px-4 py-2 rounded-md text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
            Settings
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
              {profile.firstName.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{profile.firstName} {profile.lastName}</p>
              <p className="text-xs text-slate-500 truncate">{profile.role}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full px-4 py-2 text-sm text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 rounded-md transition-colors"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-950">
        <div className="p-8 min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
