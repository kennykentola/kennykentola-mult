'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { fetchMyAcademicProjects, AcademicProjectDto } from '../../../features/academic/academicService';
import { 
  GraduationCap, Loader2, Plus, 
  ChevronRight, Clock, Activity, Users,
  FolderOpen
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function StudentAcademicDashboardPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<AcademicProjectDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyAcademicProjects()
      .then(setProjects)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 h-[60vh]">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      
      {/* 1. Dashboard Overview */}
      <section className="bg-slate-900 border border-white/10 rounded-3xl p-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 blur-[100px] pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold text-white mb-2">My Academic Projects</h1>
          <p className="text-slate-400 max-w-2xl">
            Track your final-year project, communicate with your mentor, monitor progress, and upload documents.
          </p>
        </div>
        <Link 
          href="/dashboard/academic/new" 
          className="relative z-10 shrink-0 inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
        >
          <Plus className="w-5 h-5" /> Start New Request
        </Link>
      </section>

      {/* 2. Active Projects List */}
      <section>
        {projects.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-16 text-center">
            <FolderOpen className="w-16 h-16 text-slate-600 mx-auto mb-4 opacity-50" />
            <h3 className="text-2xl font-bold text-white mb-2">No Active Projects</h3>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              You haven't requested any academic assistance yet. Click the button above to request a project topic, mentorship, or software implementation.
            </p>
            <Link href="/dashboard/academic/new" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl font-bold transition-colors">
              <Plus className="w-5 h-5" /> Request Academic Service
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {projects.map(project => (
              <Link 
                href={`/dashboard/academic/${project.$id}`} 
                key={project.$id}
                className="block bg-slate-900 border border-white/10 hover:border-amber-500/50 rounded-3xl p-8 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full group-hover:bg-amber-500/10 transition-colors" />
                
                <div className="flex justify-between items-start mb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-400 uppercase">
                    <GraduationCap className="w-4 h-4" />
                    {project.serviceScope}
                  </div>
                  <div className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 uppercase bg-black/50 px-2 py-1 rounded-md border border-white/5">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(project.$createdAt))} ago
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">{project.title}</h3>
                <p className="text-slate-400 text-sm line-clamp-2 mb-8 h-10">
                  {project.description}
                </p>

                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Status</div>
                    <div className="flex items-center gap-2 text-sm font-bold text-white">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      {project.status.replace('-', ' ')}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Mentor</div>
                    <div className="flex items-center gap-2 text-sm font-bold text-white">
                      <Users className="w-4 h-4 text-slate-400" />
                      {project.assignedDeveloper || 'Pending Assignment'}
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-8 right-8 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-500 transition-all">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
