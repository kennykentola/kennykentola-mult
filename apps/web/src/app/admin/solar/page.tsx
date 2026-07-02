'use client';

import { useEffect, useState } from 'react';
import { solarService } from '../../../features/solar/solarService';

interface SolarJob {
  $id: string;
  clientId: string;
  jobType: string;
  description: string;
  address: string;
  status: string;
  quotePrice: number;
  scheduledDate?: string;
  assignedTechnicians?: string[];
  siteImageUrls?: string[];
}

export default function AdminSolarDashboard() {
  const [jobs, setJobs] = useState<SolarJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [editForm, setEditForm] = useState({ 
    status: '', 
    quotePrice: 0,
    scheduledDate: '',
    technicianInput: ''
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const data = await solarService.getAllJobs();
      setJobs(data);
    } catch (err) {
      console.error('Failed to fetch solar jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const assignedTechnicians = editForm.technicianInput 
        ? editForm.technicianInput.split(',').map(t => t.trim()).filter(Boolean)
        : [];

      await solarService.updateJob(id, {
        status: editForm.status,
        quotePrice: Number(editForm.quotePrice),
        scheduledDate: editForm.scheduledDate || undefined,
        assignedTechnicians
      });
      setEditingId(null);
      fetchJobs();
    } catch (err) {
      console.error('Failed to update solar job:', err);
      alert('Error updating solar job.');
    }
  };

  const startEditing = (job: SolarJob) => {
    setEditingId(job.$id);
    setEditForm({
      status: job.status,
      quotePrice: job.quotePrice,
      scheduledDate: job.scheduledDate ? new Date(job.scheduledDate).toISOString().split('T')[0] : '',
      technicianInput: job.assignedTechnicians ? job.assignedTechnicians.join(', ') : ''
    });
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading Solar Jobs...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-white">Solar & Electrical Pipeline</h1>
          <p className="text-sm text-slate-400 mt-1">Review requests, issue quotes, schedule dates, and assign field technicians.</p>
          <p className="text-xs text-amber-500 mt-2 bg-amber-500/10 inline-block px-2 py-1 rounded">
            💡 Marking a job as "Completed" will automatically provision a live Telemetry Dashboard for the client.
          </p>
        </div>
        <a 
          href="/admin/solar/inventory" 
          className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border border-slate-700"
        >
          <span>📦</span> Manage Inventory
        </a>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/50 text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold w-1/4">Job Details</th>
                <th className="p-4 font-semibold w-1/5">Status & Quote</th>
                <th className="p-4 font-semibold w-1/4">Logistics</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">No solar or electrical requests found.</td>
                </tr>
              ) : (
                jobs.map(job => (
                  <tr key={job.$id} className="hover:bg-slate-800/20 transition-colors">
                    
                    <td className="p-4 align-top">
                      <div className="font-medium text-white mb-1 uppercase text-xs tracking-wider text-amber-500">
                        {job.jobType.replace('-', ' ')}
                      </div>
                      <div className="text-sm text-slate-300 mb-2">{job.description}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1">
                        <span>📍</span> {job.address}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">Client: {job.clientId}</div>
                      
                      {job.siteImageUrls && job.siteImageUrls.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {job.siteImageUrls.map((url, i) => (
                            <a key={i} href={url} target="_blank" rel="noreferrer" className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded hover:bg-slate-700">
                              View Image {i + 1}
                            </a>
                          ))}
                        </div>
                      )}
                    </td>

                    <td className="p-4 align-top">
                      {editingId === job.$id ? (
                        <div className="space-y-3">
                          <div>
                            <label className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Status</label>
                            <select 
                              title="Status"
                              className="w-full rounded bg-slate-950 border border-slate-700 px-2 py-1 text-sm text-white"
                              value={editForm.status}
                              onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                            >
                              <option value="pending-quote">Quote Pending</option>
                              <option value="quoted">Quote Ready</option>
                              <option value="paid">Paid - Scheduling</option>
                              <option value="in-progress">In Progress</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Quote Price ($)</label>
                            <input 
                              title="Quote Price"
                              type="number" 
                              className="w-full rounded bg-slate-950 border border-slate-700 px-2 py-1 text-sm text-white"
                              value={editForm.quotePrice}
                              onChange={(e) => setEditForm({...editForm, quotePrice: Number(e.target.value)})}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <span className={`px-2 py-1 inline-block rounded-full text-xs font-semibold border ${
                            job.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                            job.status === 'paid' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                            job.status === 'quoted' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                            job.status === 'pending-quote' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                            'bg-slate-500/10 text-slate-400 border-slate-500/20'
                          }`}>
                            {job.status.toUpperCase()}
                          </span>
                          <div className="text-sm font-semibold text-emerald-400">
                            {job.quotePrice > 0 ? `$${job.quotePrice.toLocaleString()}` : 'No Quote Yet'}
                          </div>
                        </div>
                      )}
                    </td>

                    <td className="p-4 align-top">
                      {editingId === job.$id ? (
                        <div className="space-y-3">
                          <div>
                            <label className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Schedule Date</label>
                            <input 
                              title="Schedule Date"
                              type="date" 
                              className="w-full rounded bg-slate-950 border border-slate-700 px-2 py-1 text-sm text-white [color-scheme:dark]"
                              value={editForm.scheduledDate}
                              onChange={(e) => setEditForm({...editForm, scheduledDate: e.target.value})}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Assign Technicians</label>
                            <input 
                              title="Technicians (comma separated)"
                              type="text" 
                              placeholder="e.g. John Doe, Mike S"
                              className="w-full rounded bg-slate-950 border border-slate-700 px-2 py-1 text-sm text-white"
                              value={editForm.technicianInput}
                              onChange={(e) => setEditForm({...editForm, technicianInput: e.target.value})}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="text-sm text-slate-300">
                            <span className="text-xs text-slate-500 block">Scheduled For</span>
                            {job.scheduledDate ? new Date(job.scheduledDate).toLocaleDateString() : 'TBD'}
                          </div>
                          <div className="text-sm text-slate-300">
                            <span className="text-xs text-slate-500 block">Technicians</span>
                            {job.assignedTechnicians && job.assignedTechnicians.length > 0 
                              ? job.assignedTechnicians.join(', ') 
                              : 'Unassigned'}
                          </div>
                        </div>
                      )}
                    </td>

                    <td className="p-4 align-top text-right">
                      {editingId === job.$id ? (
                        <div className="flex flex-col gap-2 items-end">
                          <button 
                            onClick={() => handleUpdate(job.$id)}
                            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium rounded transition-colors w-24"
                          >
                            Save Details
                          </button>
                          <button 
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium rounded transition-colors w-24"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => startEditing(job)}
                          className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 border border-indigo-500/30 text-xs font-medium rounded transition-colors"
                        >
                          Manage Job
                        </button>
                      )}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
