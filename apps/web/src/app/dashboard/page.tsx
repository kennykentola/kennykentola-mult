'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../features/auth/AuthContext';
import { getLandingRoute } from '../../lib/routeAccess';

export default function DashboardRedirectPage() {
  const router = useRouter();
  const { profile, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    router.replace(profile ? getLandingRoute(profile) : '/login');
  }, [loading, profile, router]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-400">
      Redirecting to your portal...
    </div>
  );
}
