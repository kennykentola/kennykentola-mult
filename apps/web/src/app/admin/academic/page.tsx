'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { fetchAllAcademicProjects, updateAcademicProject, AcademicProjectDto } from '../../../features/academic/academicService';
import toast from 'react-hot-toast';
import { GraduationCap, Clock, FileText, CheckCircle, RefreshCw, Banknote, User } from 'lucide-react';
import Link from 'next/link';

export default function AdminAcademicDashboard() {
  const [projects, setProjects] = useState<AcademicProjectDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await fetchAllAcademicProjects();
      setProjects(data);
    } catch (error: any) {
      toast.error('Failed to load academic requests');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await updateAcademicProject(id, { status: newStatus });
      toast.success(`Project status updated to ${newStatus}`);
      loadProjects();
    } catch (error: any) {
      toast.error('Failed to update status');
    }
  };

  const handleUpdatePrice = async (id: string, priceStr: string) => {
    const price = parseInt(priceStr, 10);
    if (isNaN(price)) return toast.error('Invalid price');
    try {
      await updateAcademicProject(id, { price });
      toast.success('Price updated');
      loadProjects();
    } catch (error: any) {
      toast.error('Failed to update price');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto text-slate-200">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <GraduationCap className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white">Academic Thesis Engine</h1>
          <p className="text-slate-400 mt-1">Manage CS final year projects, approve thesis requests, and assign developers.</p>
        </div>
      </div>

      <div className="grid gap-6">
        {projects.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
            <GraduationCap className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Requests Yet</h3>
            <p className="text-slate-400">Student thesis requests will appear here.</p>
          </div>
        ) : (
          projects.map(project => (
            <div key={project.$id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-amber-500/30 transition-colors">
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                
                {/* Info Section */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-medium">
                      {project.degree} • {project.level}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20">
                      {project.serviceScope}
                    </span>
                    {project.status === 'pending' && <span className="px-3 py-1 rounded-full bg-slate-500/20 text-slate-300 text-xs font-medium">Pending Review</span>}
                    {project.status === 'approved' && <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">Approved</span>}
                    {project.status === 'in_progress' && <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold">In Progress</span>}
                    {project.status === 'completed' && <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold">Completed</span>}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-2">{project.title}</h3>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">{project.description}</p>
                  
                  <div className="flex items-center gap-6 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" /> Student ID: {project.studentId}
                    </div>
                    <div className="flex items-center gap-2">
                      <Banknote className="w-4 h-4" /> Price: {project.price > 0 ? `NGN ${project.price.toLocaleString()}` : 'Not Set'}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" /> {new Date(project.$createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Action Section */}
                <div className="flex flex-col gap-3 min-w-[200px] border-t lg:border-t-0 lg:border-l border-white/10 pt-4 lg:pt-0 lg:pl-6">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Set Price (NGN)</label>
                    <div className="flex gap-2">
                      <input 
                        type="number" 
                        aria-label="Set Price"
                        defaultValue={project.price} 
                        id={`price-${project.$id}`}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      <button 
                        onClick={() => handleUpdatePrice(project.$id, (document.getElementById(`price-${project.$id}`) as HTMLInputElement).value)}
                        className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1 mt-2">
                    <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Update Status</label>
                    <select
                      title="Update Project Status"
                      aria-label="Update Project Status"
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                      value={project.status}
                      onChange={(e) => handleUpdateStatus(project.$id, e.target.value)}
                    >
                      <option value="pending-proposal">Pending Proposal</option>
                      <option value="proposal-approved">Proposal Approved</option>
                      <option value="in_progress">In Progress</option>
                      <option value="review">Under Review</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  {/* Manage Button */}
                  <div className="flex justify-end pt-2">
                    <Link 
                      href={`/admin/academic/${project.$id}`}
                      className="inline-flex items-center gap-2 bg-white/5 hover:bg-amber-500/20 text-amber-500 hover:text-amber-400 px-4 py-2 rounded-xl transition-colors border border-amber-500/20 font-semibold text-sm"
                    >
                      Manage & Chat
                    </Link>
                  </div>
                </div>

              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
