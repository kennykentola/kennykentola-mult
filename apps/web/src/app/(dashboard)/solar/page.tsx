'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { client } from '@/lib/appwrite';
import { Databases, Query } from 'appwrite';
import Link from 'next/link';
import { SolarJob } from '@company/shared';

export default function SolarDashboardPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<SolarJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchJobs();
    }
  }, [user]);

  const fetchJobs = async () => {
    try {
      const databases = new Databases(client);
      const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'multicompany';

      const res = await databases.listDocuments(dbId, 'solar_jobs', [
        Query.equal('clientId', user!.$id),
        Query.orderDesc('$createdAt')
      ]);

      setJobs(res.documents as unknown as SolarJob[]);
    } catch (err) {
      console.error('Failed to fetch solar jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = (status: SolarJob['status']) => {
    switch (status) {
      case 'pending-quote': return { label: 'Quote Pending', color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' };
      case 'quoted': return { label: 'Quote Ready', color: 'bg-blue-500/20 text-blue-500 border-blue-500/30' };
      case 'paid': return { label: 'Paid - Scheduling', color: 'bg-purple-500/20 text-purple-500 border-purple-500/30' };
      case 'in-progress': return { label: 'Installation In Progress', color: 'bg-indigo-500/20 text-indigo-500 border-indigo-500/30' };
      case 'completed': return { label: 'Completed', color: 'bg-green-500/20 text-green-500 border-green-500/30' };
      case 'cancelled': return { label: 'Cancelled', color: 'bg-slate-500/20 text-slate-500 border-slate-500/30' };
      default: return { label: 'Unknown', color: 'bg-white/10 text-muted border-white/20' };
    }
  };

  const formatJobType = (type: string) => {
    return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'TBD';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  if (loading) return <div className="p-8 text-center text-muted">Loading Solar & Electrical Jobs...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary-foreground tracking-tight">Solar & Electrical</h1>
          <p className="text-muted mt-1 text-sm">Track your inverter setups, solar installations, and electrical repairs.</p>
        </div>
        <Link 
          href="/dashboard/solar/new" 
          className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(234,179,8,0.3)]"
        >
          + Request Installation
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {jobs.length === 0 ? (
          <div className="glass-panel border border-border rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">☀️</div>
            <h3 className="text-xl font-bold text-primary-foreground mb-2">No active solar or electrical jobs</h3>
            <p className="text-muted mb-6">Looking to go green or need an electrical repair? Request a quote from our expert engineers.</p>
            <Link 
              href="/dashboard/solar/new" 
              className="text-yellow-500 hover:underline font-medium"
            >
              Get a Quote &rarr;
            </Link>
          </div>
        ) : (
          jobs.map(job => {
            const statusInfo = getStatusDisplay(job.status);
            return (
              <div key={job.$id} className="glass-panel border border-border rounded-xl p-6 hover:border-yellow-500/30 transition-colors">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-primary-foreground">{formatJobType(job.jobType)}</h3>
                    <div className="text-sm text-muted mt-1 flex items-center gap-1">
                      <span className="text-yellow-500">📍</span> {job.address}
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusInfo.color}`}>
                    {statusInfo.label}
                  </div>
                </div>

                <p className="text-sm text-muted mb-4 border-l-2 border-yellow-500/20 pl-3">
                  {job.description}
                </p>

                {job.siteImageUrls && job.siteImageUrls.length > 0 && (
                  <div className="flex gap-2 mb-4">
                    {job.siteImageUrls.map((url, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-md overflow-hidden border border-white/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="Site attachment" className="object-cover w-full h-full" />
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center border-t border-border pt-4 mt-4">
                  <div className="text-sm">
                    <span className="block text-muted text-xs mb-1">Scheduled Date</span>
                    <span className="font-medium text-primary-foreground">
                      {formatDate(job.scheduledDate)}
                    </span>
                  </div>

                  <div className="text-sm">
                    <span className="block text-muted text-xs mb-1">Assigned Techs</span>
                    <span className="font-medium text-primary-foreground">
                      {job.assignedTechnicians && job.assignedTechnicians.length > 0 
                        ? job.assignedTechnicians.length 
                        : 'Unassigned'}
                    </span>
                  </div>

                  <div className="text-sm">
                    <span className="block text-muted text-xs mb-1">Quote Price</span>
                    <span className="font-semibold text-primary-foreground">
                      {job.quotePrice > 0 ? `$${job.quotePrice.toFixed(2)}` : 'Pending'}
                    </span>
                  </div>

                  <div className="text-sm flex justify-end">
                    {job.status === 'quoted' && (
                      <button className="px-4 py-1.5 bg-green-500 hover:bg-green-400 text-black font-semibold rounded-md transition-colors text-sm">
                        Pay & Book
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
