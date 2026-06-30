'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { fetchMentorAcademicProjects, updateMentorProject, AcademicProjectDto } from '../../../features/academic/academicService';
import toast from 'react-hot-toast';
import { GraduationCap, Clock, FileText, CheckCircle, RefreshCw, Banknote, User } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function MentorAcademicDashboard() {
  const [projects, setProjects] = useState<AcademicProjectDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await fetchMentorAcademicProjects();
      setProjects(data);
    } catch (error: any) {
      toast.error('Failed to load assigned projects');
    } finally {
      setLoading(false);
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
          <h1 className="text-3xl font-black text-white">Mentor Dashboard</h1>
          <p className="text-slate-400 mt-1">Manage academic projects assigned to you, upload deliverables, and communicate with students.</p>
        </div>
      </div>

      <div className="grid gap-6">
        {projects.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
            <GraduationCap className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Projects Assigned</h3>
            <p className="text-slate-400">Projects assigned to you will appear here.</p>
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
                    <span className="px-3 py-1 rounded-full bg-slate-500/20 text-slate-300 text-xs font-medium uppercase">{project.status}</span>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-2">{project.title}</h3>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">{project.description}</p>
                  
                  <div className="flex items-center gap-6 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {project.universityName} - {project.department}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Requested on {format(new Date(project.$createdAt), 'MMM do, yyyy')}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col justify-end gap-3 min-w-[200px]">
                  <Link 
                    href={`/mentor/academic/${project.$id}`}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-center transition-colors"
                  >
                    Open Workspace
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
