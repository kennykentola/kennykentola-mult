'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { technicianService } from '../../../../features/solar/technicianService';
import { SolarJob } from '@company/shared';
import { ArrowLeft, CheckCircle2, Clock, Wrench } from 'lucide-react';
import Link from 'next/link';

export default function TechnicianJobDetailsPage() {
  const params = useParams();
  const jobId = params?.jobId as string;
  const router = useRouter();
  
  const [job, setJob] = useState<SolarJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      const data = await technicianService.getAssignedJobs();
      const found = data.find(j => j.$id === jobId);
      if (found) setJob(found);
    } catch (err) {
      console.error('Failed to fetch job:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: SolarJob['status']) => {
    if (!job || !job.$id) return;
    setUpdating(true);
    try {
      await technicianService.updateJobStatus(job.$id, newStatus);
      setJob({ ...job, status: newStatus });
      alert('Status updated successfully');
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Error updating status.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading job details...</div>;
  if (!job) return <div className="p-8 text-center text-red-400">Job not found or access denied.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6 md:p-8">
      <div className="flex items-center gap-4">
        <Link href="/technician/dashboard" className="p-2 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Job Execution</h1>
          <p className="text-slate-400 mt-1 text-sm uppercase tracking-wider">{job.$id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Job Requirements</h2>
            <div className="space-y-4">
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wide font-bold">Type</span>
                <p className="text-white font-medium mt-1">{job.jobType.replace('-', ' ')}</p>
              </div>
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wide font-bold">Description</span>
                <p className="text-slate-300 mt-1 leading-relaxed bg-slate-950 p-4 rounded-lg border border-slate-800">
                  {job.description}
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wide font-bold">Location</span>
                <div className="flex items-center gap-2 text-white mt-1">
                  <span className="text-yellow-500">📍</span> {job.address}
                </div>
              </div>
            </div>
          </div>

          {job.siteImageUrls && job.siteImageUrls.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Site Attachments</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {job.siteImageUrls.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noreferrer" className="block relative aspect-square rounded-lg overflow-hidden border border-slate-700 hover:border-yellow-500 transition-colors">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Site image ${i+1}`} className="object-cover w-full h-full" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Execution Status</h2>
            
            <div className="space-y-4">
              <div className={`p-4 rounded-lg border ${job.status === 'paid' ? 'bg-blue-500/10 border-blue-500/30' : 'bg-slate-950 border-slate-800'}`}>
                <div className="flex items-center gap-3">
                  <Clock className={`w-5 h-5 ${job.status === 'paid' ? 'text-blue-500' : 'text-slate-500'}`} />
                  <div>
                    <h4 className={`font-semibold ${job.status === 'paid' ? 'text-blue-400' : 'text-slate-400'}`}>Scheduled</h4>
                    {job.status === 'paid' && <p className="text-xs text-blue-500/70 mt-1">Ready to start</p>}
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-lg border ${job.status === 'in-progress' ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-slate-950 border-slate-800'}`}>
                <div className="flex items-center gap-3">
                  <Wrench className={`w-5 h-5 ${job.status === 'in-progress' ? 'text-yellow-500' : 'text-slate-500'}`} />
                  <div>
                    <h4 className={`font-semibold ${job.status === 'in-progress' ? 'text-yellow-400' : 'text-slate-400'}`}>In Progress</h4>
                    {job.status === 'in-progress' && <p className="text-xs text-yellow-500/70 mt-1">Currently working</p>}
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-lg border ${job.status === 'completed' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-950 border-slate-800'}`}>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className={`w-5 h-5 ${job.status === 'completed' ? 'text-emerald-500' : 'text-slate-500'}`} />
                  <div>
                    <h4 className={`font-semibold ${job.status === 'completed' ? 'text-emerald-400' : 'text-slate-400'}`}>Completed</h4>
                    {job.status === 'completed' && <p className="text-xs text-emerald-500/70 mt-1">Job finished</p>}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-800 space-y-3">
              {job.status === 'paid' && (
                <button 
                  disabled={updating}
                  onClick={() => updateStatus('in-progress')}
                  className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Wrench className="w-4 h-4" /> Start Work
                </button>
              )}
              {job.status === 'in-progress' && (
                <button 
                  disabled={updating}
                  onClick={() => updateStatus('completed')}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> Mark Completed
                </button>
              )}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">Financials</h2>
            <div className="flex justify-between items-center py-2 border-b border-slate-800">
              <span className="text-slate-300 text-sm">Quote Price</span>
              <span className="text-white font-medium">${job.quotePrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-300 text-sm">Payment Status</span>
              <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/20 text-emerald-400 font-medium">Paid</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
