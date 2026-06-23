'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../features/auth/AuthContext';
import { getMyProjects } from '../../features/projects/projectsService';
import { Briefcase, Plus, Clock, Code, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

export default function ProjectsDashboardPage() {
  const { profile } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const { projects } = await getMyProjects();
        setProjects(projects);
      } catch (err) {
        console.error('Failed to load projects:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  if (!profile) return null;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-slate-950 p-8 lg:p-12 shadow-2xl">
        <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[140%] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/5 px-3 py-1 text-xs font-semibold text-indigo-300">
            Software Agency Portal
          </span>
          <h1 className="mt-4 text-3xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Manage your{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              Software Projects
            </span>
          </h1>
          <p className="mt-4 text-slate-400 text-sm lg:text-base leading-relaxed">
            Request custom software development, track project milestones, and communicate with your dedicated engineering team.
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-indigo-400" />
          Active Projects
        </h2>
        <Link href="/projects/new" className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20">
          <Plus className="h-4 w-4" />
          Request Project
        </Link>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-slate-900/50 rounded-2xl border border-white/5"></div>
          <div className="h-24 bg-slate-900/50 rounded-2xl border border-white/5"></div>
        </div>
      ) : projects.length > 0 ? (
        <div className="space-y-4">
          {projects.map((project) => (
            <Link href={`/projects/${project.$id}`} key={project.$id} className="block glass-panel border border-white/5 bg-slate-950/40 hover:bg-slate-900/40 rounded-2xl p-5 transition-colors group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/0 group-hover:bg-indigo-500 transition-colors" />
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase border ${
                    project.status === 'completed'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : project.status === 'in-progress'
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {project.status || 'Requested'}
                  </span>
                  <h4 className="text-lg font-bold text-white mt-1.5">{project.title}</h4>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-indigo-400 block mb-1">
                    {project.budget > 0 ? `NGN ${project.budget.toLocaleString()}` : 'Pending Quote'}
                  </span>
                  {project.status === 'quoted' && project.budget > 0 && (
                    <Link href="/projects/payments/new" className="text-xs text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1 rounded-full inline-block">
                      Approve & Pay
                    </Link>
                  )}
                </div>
              </div>
              
              <p className="text-sm text-slate-400 mt-2 line-clamp-2">{project.description}</p>
              
              <div className="flex items-center gap-4 text-xs text-slate-500 mt-4 pt-4 border-t border-white/5">
                <span className="flex items-center gap-1">
                  <LayoutDashboard className="h-3.5 w-3.5" /> Client Portal
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> Requested {new Date(project.$createdAt).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-950/30 p-12 text-center">
          <Code className="mx-auto h-12 w-12 text-slate-700 mb-4" />
          <h3 className="text-lg font-bold text-white">No active projects</h3>
          <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
            You don't have any active software development projects. Request a quote to get started.
          </p>
        </div>
      )}
    </div>
  );
}
