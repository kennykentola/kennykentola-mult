'use client';

import React, { useEffect, useState } from 'react';
import { client } from '@/lib/appwrite';
import { Databases, Query } from 'appwrite';
import { Loader2, CheckCircle, BookOpen, Link as LinkIcon, FileText } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import toast from 'react-hot-toast';

export default function AcademicWriterDashboard() {
  const { profile } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<string | null>(null);
  const [deliveryUrls, setDeliveryUrls] = useState<Record<string, string>>({});

  const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'multicompany';

  const loadJobs = async () => {
    try {
      setLoading(true);
      const databases = new Databases(client);
      
      const response = await databases.listDocuments(dbId, 'student_projects', [
        Query.equal('status', ['paid', 'in-progress']),
        Query.orderDesc('$createdAt'),
        Query.limit(50)
      ]);

      setJobs(response.documents);
    } catch (err: any) {
      toast.error('Failed to load academic projects');
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
      
      const payload: any = { status: newStatus };
      if (newStatus === 'completed' && deliveryUrls[jobId]) {
        payload.deliverableUrl = deliveryUrls[jobId];
      }

      await databases.updateDocument(dbId, 'student_projects', jobId, payload);
      
      toast.success(`Project marked as ${newStatus}`);
      setJobs(jobs.map(j => j.$id === jobId ? { ...j, status: newStatus, deliverableUrl: payload.deliverableUrl || j.deliverableUrl } : j));
    } catch (err: any) {
      toast.error('Failed to update project status');
      console.error(err);
    } finally {
      setActioning(null);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-rose-500" />
          Academic Writers Desk
        </h1>
        <p className="text-slate-400 text-sm mt-1">Execute academic research projects, write-ups, and submit final documents.</p>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
        </div>
      ) : (
        <div className="grid gap-6">
          {jobs.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl bg-slate-950/50">
              <p className="text-slate-500 text-sm">No pending paid academic projects at the moment.</p>
            </div>
          ) : (
            jobs.map((job) => (
              <div key={job.$id} className="p-6 rounded-2xl border border-white/5 bg-slate-900/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    job.status === 'paid' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 
                    job.status === 'in-progress' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : ''
                  }`}>
                    {job.status === 'paid' ? 'Ready for Writing' : 'Research In Progress'}
                  </span>
                </div>

                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center mt-2">
                  <div className="flex-1 space-y-4">
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-slate-800 text-slate-400 mb-2 inline-block">
                        {job.serviceType || 'Academic Research'}
                      </span>
                      <h3 className="text-xl font-bold text-white">{job.topic || 'Untitled Academic Topic'}</h3>
                      <p className="text-sm text-slate-400 mt-1 line-clamp-2">{job.description}</p>
                    </div>
                    
                    <div className="flex gap-4 text-xs font-semibold text-slate-500">
                      <span>Level: {job.academicLevel || 'N/A'}</span>
                      <span>Format: {job.formattingStyle || 'APA'}</span>
                      <span>Pages: {job.pageCount || '?'}</span>
                    </div>
                    
                    {job.status === 'in-progress' && (
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
                        <LinkIcon className="h-4 w-4 text-slate-500" />
                        <input 
                          type="url" 
                          placeholder="Paste Google Docs link or PDF download URL..."
                          className="bg-transparent border-none w-full text-sm text-white focus:outline-none"
                          value={deliveryUrls[job.$id] || ''}
                          onChange={(e) => setDeliveryUrls({ ...deliveryUrls, [job.$id]: e.target.value })}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 min-w-[200px] w-full md:w-auto">
                    {job.status === 'paid' && (
                      <button
                        onClick={() => updateStatus(job.$id, 'in-progress')}
                        disabled={actioning === job.$id}
                        className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-rose-600 hover:bg-rose-500 text-white transition-colors flex items-center justify-center gap-2"
                      >
                        {actioning === job.$id ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                        Start Research
                      </button>
                    )}
                    
                    {job.status === 'in-progress' && (
                      <button
                        onClick={() => updateStatus(job.$id, 'completed')}
                        disabled={actioning === job.$id || !deliveryUrls[job.$id]}
                        className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        title={!deliveryUrls[job.$id] ? "Please provide a document link first" : "Submit Write-up"}
                      >
                        {actioning === job.$id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                        Submit Write-up
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
