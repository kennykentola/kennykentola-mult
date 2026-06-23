'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { AcademicProjectDto, fetchMyAcademicProjects, requestAcademicProject } from './academicService';
import { BookOpen, Loader2, FileText, Send, CheckCircle2, Clock } from 'lucide-react';

export default function AcademicDashboardPage() {
  const { profile } = useAuth();
  const [projects, setProjects] = useState<AcademicProjectDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isRequesting, setIsRequesting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    universityName: '',
    department: '',
    degree: '',
    level: '',
    serviceScope: 'Full Process (Proposal, Write-up, Implementation, Corrections)'
  });

  useEffect(() => {
    let cancelled = false;

    async function loadProjects() {
      setLoading(true);
      setError('');
      try {
        const data = await fetchMyAcademicProjects();
        if (!cancelled) setProjects(data);
      } catch (err: any) {
        if (!cancelled) setError(err.message || 'Failed to load thesis projects.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProjects();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;
    
    setIsRequesting(true);
    setError('');
    
    try {
      const newProject = await requestAcademicProject(formData);
      setProjects((prev) => [newProject, ...prev]);
      setFormData({
        title: '',
        description: '',
        universityName: '',
        department: '',
        degree: '',
        level: '',
        serviceScope: 'Full Process (Proposal, Write-up, Implementation, Corrections)'
      });
    } catch (err: any) {
      setError(err.message || 'Failed to submit thesis request.');
    } finally {
      setIsRequesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-white/5 bg-slate-900/30">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-400" />
          <p className="mt-2 text-sm text-slate-400">Loading your academic projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-900/40 to-slate-900/40 p-8 shadow-xl">
        <h1 className="text-3xl font-extrabold text-white">Academic Projects & Thesis</h1>
        <p className="mt-2 text-sm text-indigo-200/70">
          Request help with your university thesis, source code implementations, or comprehensive project documentation.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-400">
          {error}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Request Form */}
        <section className="rounded-3xl border border-white/5 bg-slate-900/50 p-6 backdrop-blur-sm lg:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-indigo-500/10 p-2.5 text-indigo-400">
              <Send className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-white">New Request</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-400">Project Title</label>
              <input
                type="text"
                required
                className="w-full rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-white transition-colors focus:border-indigo-500/50 focus:outline-none"
                placeholder="e.g. AI-based Medical Diagnosis System"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-400">Service Scope</label>
              <select
                required
                title="Service Scope"
                className="w-full rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-white transition-colors focus:border-indigo-500/50 focus:outline-none"
                value={formData.serviceScope}
                onChange={(e) => setFormData({ ...formData, serviceScope: e.target.value })}
              >
                <option value="Thesis Write-up Only">Thesis Write-up Only</option>
                <option value="Implementation/Code Only">Implementation / Source Code Only</option>
                <option value="Full Process (Proposal, Write-up, Implementation, Corrections)">Full Process (Proposal, Write-up, Code, Corrections)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400">University Name</label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-white transition-colors focus:border-indigo-500/50 focus:outline-none"
                  placeholder="Optional"
                  value={formData.universityName}
                  onChange={(e) => setFormData({ ...formData, universityName: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400">Department</label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-white transition-colors focus:border-indigo-500/50 focus:outline-none"
                  placeholder="e.g. Computer Science"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400">Degree</label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-white transition-colors focus:border-indigo-500/50 focus:outline-none"
                  placeholder="e.g. BSc, MSc"
                  value={formData.degree}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400">Level / Year</label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-white transition-colors focus:border-indigo-500/50 focus:outline-none"
                  placeholder="e.g. 400L, Final Year"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-400">Project Description / Requirements</label>
              <textarea
                required
                rows={5}
                className="w-full rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-white transition-colors focus:border-indigo-500/50 focus:outline-none"
                placeholder="Provide detailed requirements, deadlines, or any guidelines given by your supervisor."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={isRequesting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-4 text-sm font-bold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
            >
              {isRequesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {isRequesting ? 'Submitting Request...' : 'Submit Project Request'}
            </button>
          </form>
        </section>

        {/* Existing Projects Tracker */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="rounded-xl bg-purple-500/10 p-2.5 text-purple-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-white">Your Projects</h2>
          </div>

          {projects.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-800 p-12 text-center text-slate-500">
              <FileText className="mx-auto mb-4 h-10 w-10 opacity-50" />
              <p className="text-sm">You haven't requested any academic projects yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <div key={project.$id} className="rounded-2xl border border-white/5 bg-slate-900/30 p-6 transition-colors hover:border-white/10">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-white">{project.title}</h3>
                      <p className="mt-1 text-xs text-slate-400 line-clamp-2">{project.description}</p>
                    </div>
                    <span className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-300 whitespace-nowrap">
                      {project.status.replace('-', ' ')}
                    </span>
                  </div>
                  
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <span className="inline-flex items-center gap-1 rounded bg-slate-950 px-2 py-1 font-semibold text-indigo-300 border border-indigo-500/20">
                      Scope: {project.serviceScope}
                    </span>
                    {project.price > 0 && (
                      <span className="inline-flex items-center gap-1 rounded bg-slate-950 px-2 py-1 font-semibold text-emerald-400 border border-emerald-500/20">
                        Price: ${project.price.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Deliverables Section */}
                  {(project.proposalUrl || project.documentationUrl || project.sourceCodeUrl) && (
                    <div className="mt-5 space-y-2 rounded-xl bg-slate-950/50 p-4 border border-slate-800/50">
                      <p className="text-xs font-semibold text-slate-500 mb-3">DELIVERABLES</p>
                      {project.proposalUrl && (
                        <a href={project.proposalUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300">
                          <CheckCircle2 className="h-4 w-4" /> Download Proposal
                        </a>
                      )}
                      {project.documentationUrl && (
                        <a href={project.documentationUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300">
                          <CheckCircle2 className="h-4 w-4" /> Download Full Write-up / Thesis
                        </a>
                      )}
                      {project.sourceCodeUrl && (
                        <a href={project.sourceCodeUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300">
                          <CheckCircle2 className="h-4 w-4" /> Download Source Code
                        </a>
                      )}
                    </div>
                  )}
                  
                  {!project.proposalUrl && !project.documentationUrl && !project.sourceCodeUrl && project.status !== 'completed' && (
                     <div className="mt-5 flex items-center gap-2 text-xs text-slate-500">
                       <Clock className="h-3.5 w-3.5" />
                       Awaiting deliverables from the development team.
                     </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
