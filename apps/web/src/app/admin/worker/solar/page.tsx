'use client';

import React, { useEffect, useState } from 'react';
import { client } from '@/lib/appwrite';
import { Databases, Query } from 'appwrite';
import { Loader2, Zap, MapPin, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import toast from 'react-hot-toast';

export default function SolarElectricianDashboard() {
  const { profile } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<string | null>(null);

  const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'multicompany';

  const loadJobs = async () => {
    try {
      setLoading(true);
      const databases = new Databases(client);
      
      const response = await databases.listDocuments(dbId, 'solar_jobs', [
        Query.equal('status', ['paid', 'in-progress']),
        Query.orderDesc('$createdAt'),
        Query.limit(50)
      ]);

      setJobs(response.documents);
    } catch (err: any) {
      toast.error('Failed to load solar jobs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile) loadJobs();
  }, [profile]);

  const updateStatus = async (jobId: string, newStatus: string) => {
    try {
      setActioning(jobId);
      const databases = new Databases(client);
      await databases.updateDocument(dbId, 'solar_jobs', jobId, {
        status: newStatus
      });
      toast.success(`Job marked as ${newStatus}`);
      setJobs(jobs.map(j => j.$id === jobId ? { ...j, status: newStatus } : j));
    } catch (err: any) {
      toast.error('Failed to update job status');
      console.error(err);
    } finally {
      setActioning(null);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <Zap className="h-8 w-8 text-amber-500" />
          Electrician Field Dashboard
        </h1>
        <p className="text-slate-400 text-sm mt-1">Manage paid solar installation jobs and track completion status.</p>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        </div>
      ) : (
        <div className="grid gap-6">
          {jobs.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl bg-slate-950/50">
              <p className="text-slate-500 text-sm">No pending paid jobs at the moment.</p>
            </div>
          ) : (
            jobs.map((job) => (
              <div key={job.$id} className="p-6 rounded-2xl border border-white/5 bg-slate-900/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    job.status === 'paid' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 
                    job.status === 'in-progress' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : ''
                  }`}>
                    {job.status === 'paid' ? 'Ready for Deployment' : 'In Progress'}
                  </span>
                </div>

                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                  <div className="flex-1 space-y-3">
                    <h3 className="text-xl font-bold text-white">{job.propertyType} - {job.systemSize}</h3>
                    <div className="flex flex-col gap-2 text-sm text-slate-400">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-slate-500" />
                        <span>{job.address || 'Address pending'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-500" />
                        <span>Requested Installation Date: {job.requestedDate ? new Date(job.requestedDate).toLocaleDateString() : 'ASAP'}</span>
                      </div>
                    </div>
                    
                    <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/50 mt-4">
                      <p className="text-sm font-semibold text-slate-300 mb-1">Client Notes:</p>
                      <p className="text-xs text-slate-400">{job.notes || 'No additional notes provided.'}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 min-w-[200px]">
                    {job.status === 'paid' && (
                      <button
                        onClick={() => updateStatus(job.$id, 'in-progress')}
                        disabled={actioning === job.$id}
                        className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-amber-600 hover:bg-amber-500 text-white transition-colors flex items-center justify-center gap-2"
                      >
                        {actioning === job.$id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                        Start Deployment
                      </button>
                    )}
                    
                    {job.status === 'in-progress' && (
                      <button
                        onClick={() => updateStatus(job.$id, 'completed')}
                        disabled={actioning === job.$id}
                        className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center justify-center gap-2"
                      >
                        {actioning === job.$id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                        Mark Completed
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
