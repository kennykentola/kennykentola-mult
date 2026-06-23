'use client';

import React, { useEffect, useState } from 'react';
import { client } from '@/lib/appwrite';
import { Databases, Query } from 'appwrite';
import { Loader2, Printer, CheckCircle, Clock, DownloadCloud, FileText } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import toast from 'react-hot-toast';

export default function PrintingOperatorDashboard() {
  const { profile } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<string | null>(null);

  const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'multicompany';

  const loadJobs = async () => {
    try {
      setLoading(true);
      const databases = new Databases(client);
      
      const response = await databases.listDocuments(dbId, 'print_orders', [
        Query.equal('status', ['paid', 'in-progress']),
        Query.orderDesc('$createdAt'),
        Query.limit(50)
      ]);

      setJobs(response.documents);
    } catch (err: any) {
      toast.error('Failed to load print orders');
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
      await databases.updateDocument(dbId, 'print_orders', jobId, {
        status: newStatus
      });
      toast.success(`Print order marked as ${newStatus}`);
      setJobs(jobs.map(j => j.$id === jobId ? { ...j, status: newStatus } : j));
    } catch (err: any) {
      toast.error('Failed to update order status');
      console.error(err);
    } finally {
      setActioning(null);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <Printer className="h-8 w-8 text-cyan-400" />
          Print Operator Deck
        </h1>
        <p className="text-slate-400 text-sm mt-1">Download client files, manage print queues, and fulfill paid orders.</p>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
        </div>
      ) : (
        <div className="grid gap-6">
          {jobs.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl bg-slate-950/50">
              <p className="text-slate-500 text-sm">No pending paid print orders at the moment.</p>
            </div>
          ) : (
            jobs.map((job) => (
              <div key={job.$id} className="p-6 rounded-2xl border border-white/5 bg-slate-900/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    job.status === 'paid' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 
                    job.status === 'in-progress' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : ''
                  }`}>
                    {job.status === 'paid' ? 'Ready for Print' : 'Printing in Progress'}
                  </span>
                </div>

                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center mt-2">
                  <div className="flex-1 space-y-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <FileText className="h-5 w-5 text-slate-400" />
                      Order {job.$id.substring(0, 8)}
                    </h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800/50">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-slate-500 block mb-1">Copies</span>
                        <span className="text-sm font-bold text-white">{job.copies || 1}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-slate-500 block mb-1">Color</span>
                        <span className="text-sm font-bold text-white">{job.colorType || 'B/W'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-slate-500 block mb-1">Binding</span>
                        <span className="text-sm font-bold text-white">{job.bindingType || 'None'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-slate-500 block mb-1">Pages</span>
                        <span className="text-sm font-bold text-white">{job.pageCount || '?'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 min-w-[200px] w-full md:w-auto">
                    {job.fileUrl && (
                      <a
                        href={job.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2.5 px-4 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-white transition-colors flex items-center justify-center gap-2 border border-slate-700"
                      >
                        <DownloadCloud className="h-4 w-4" />
                        Download File
                      </a>
                    )}
                    
                    {job.status === 'paid' && (
                      <button
                        onClick={() => updateStatus(job.$id, 'in-progress')}
                        disabled={actioning === job.$id}
                        className="w-full py-2.5 px-4 rounded-xl font-bold text-sm bg-cyan-600 hover:bg-cyan-500 text-white transition-colors flex items-center justify-center gap-2"
                      >
                        {actioning === job.$id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
                        Start Printing
                      </button>
                    )}
                    
                    {job.status === 'in-progress' && (
                      <button
                        onClick={() => updateStatus(job.$id, 'completed')}
                        disabled={actioning === job.$id}
                        className="w-full py-2.5 px-4 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center justify-center gap-2"
                      >
                        {actioning === job.$id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                        Mark as Ready
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
