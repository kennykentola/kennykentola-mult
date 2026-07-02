'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { technicianService } from '../../../features/solar/technicianService';
import { SolarJob } from '@company/shared';
import Link from 'next/link';

export default function TechnicianDashboardPage() {
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
      const data = await technicianService.getAssignedJobs();
      setJobs(data);
    } catch (err) {
      console.error('Failed to fetch assigned jobs:', err);
    } finally {
      setLoading(false);
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

  const getStatusDisplay = (status: SolarJob['status']) => {
    switch (status) {
      case 'paid': return { label: 'Scheduled', color: 'bg-blue-500/20 text-blue-500 border-blue-500/30' };
      case 'in-progress': return { label: 'In Progress', color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' };
      case 'completed': return { label: 'Completed', color: 'bg-green-500/20 text-green-500 border-green-500/30' };
      default: return { label: status.toUpperCase(), color: 'bg-slate-500/20 text-slate-500 border-slate-500/30' };
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading your assignments...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-6 md:p-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Technician Portal</h1>
        <p className="text-slate-400 mt-1">View your assigned solar installations and electrical jobs.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {jobs.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
            <h3 className="text-xl font-bold text-white mb-2">No active assignments</h3>
            <p className="text-slate-400">You currently have no jobs assigned to you.</p>
          </div>
        ) : (
          jobs.map(job => {
            const statusInfo = getStatusDisplay(job.status);
            return (
              <div key={job.$id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-yellow-500/30 transition-colors">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{formatJobType(job.jobType)}</h3>
                    <div className="text-sm text-slate-400 mt-1 flex items-center gap-1">
                      <span className="text-yellow-500">📍</span> {job.address}
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusInfo.color}`}>
                    {statusInfo.label}
                  </div>
                </div>

                <p className="text-sm text-slate-300 mb-4 border-l-2 border-yellow-500/20 pl-3">
                  {job.description}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center border-t border-slate-800 pt-4 mt-4">
                  <div className="text-sm">
                    <span className="block text-slate-500 text-xs mb-1">Scheduled Date</span>
                    <span className="font-medium text-white">
                      {formatDate(job.scheduledDate)}
                    </span>
                  </div>

                  <div className="text-sm">
                    <span className="block text-slate-500 text-xs mb-1">Client ID</span>
                    <span className="font-medium text-white truncate max-w-[120px] inline-block" title={job.clientId}>
                      {job.clientId.substring(0, 8)}...
                    </span>
                  </div>

                  <div className="text-sm">
                    <span className="block text-slate-500 text-xs mb-1">Quote Details</span>
                    <span className="font-medium text-emerald-400">
                      {job.quotePrice > 0 ? `$${job.quotePrice.toLocaleString()}` : 'N/A'}
                    </span>
                  </div>

                  <div className="text-sm flex justify-end">
                    <Link 
                      href={`/technician/dashboard/${job.$id}`}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors text-sm"
                    >
                      View Details &rarr;
                    </Link>
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
