'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { agencyService, AgencyProject } from '../../features/agency/agencyService';
import Link from 'next/link';

export default function AgencyDashboardPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<AgencyProject[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectType, setProjectType] = useState('Web App');
  const [budget, setBudget] = useState<number | ''>('');
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await agencyService.getMyProjects();
      setProjects(data);
    } catch (err) {
      console.error('Failed to fetch agency projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !projectType) {
      alert('Please fill all required fields');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await agencyService.submitBrief({
        title,
        description,
        projectType,
        budget: budget ? Number(budget) : undefined,
        deadline: deadline || undefined
      });
      alert('Project estimation brief submitted! Our team will review it shortly.');
      setShowForm(false);
      setTitle('');
      setDescription('');
      setBudget('');
      setDeadline('');
      fetchProjects();
    } catch (err: any) {
      alert(err.message || 'Failed to submit brief');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending-quote': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'in-progress': return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'completed': return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading B2B Projects...</div>;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Agency & Enterprise Projects</h1>
          <p className="text-slate-400 mt-1 text-sm">Submit project estimation briefs and track your custom software development.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(79,70,229,0.4)]"
        >
          {showForm ? 'Cancel' : '+ New Estimation Brief'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-panel border border-indigo-500/30 bg-slate-900/80 rounded-xl p-6 lg:p-10 space-y-6 animate-in slide-in-from-top-4">
          <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-2">Project Brief</h2>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Project Title <span className="text-rose-500">*</span></label>
            <input 
              required
              type="text" 
              placeholder="e.g., E-Commerce Mobile App"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full p-3 bg-slate-950/50 border border-slate-800 rounded-lg text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Project Type <span className="text-rose-500">*</span></label>
              <select 
                title="Project Type"
                value={projectType}
                onChange={e => setProjectType(e.target.value)}
                className="w-full p-3 bg-slate-950/50 border border-slate-800 rounded-lg text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
              >
                <option value="Web App">Web Application</option>
                <option value="Mobile App">Mobile Application (iOS/Android)</option>
                <option value="API / Backend">API / Backend System</option>
                <option value="SaaS Platform">SaaS Platform</option>
                <option value="Other">Other Custom Software</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Estimated Budget (Optional)</label>
              <input 
                type="number" 
                placeholder="USD / NGN"
                value={budget}
                onChange={e => setBudget(Number(e.target.value) || '')}
                className="w-full p-3 bg-slate-950/50 border border-slate-800 rounded-lg text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Project Description / Requirements <span className="text-rose-500">*</span></label>
            <textarea 
              required
              rows={5}
              placeholder="Describe the core features, target audience, and any specific technologies required..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full p-4 bg-slate-950/50 border border-slate-800 rounded-lg text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Desired Deadline (Optional)</label>
            <input 
              title="Desired Deadline"
              type="date" 
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              className="w-full p-3 bg-slate-950/50 border border-slate-800 rounded-lg text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all [color-scheme:dark]"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Brief for Review'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {projects.length === 0 && !showForm && (
          <div className="glass-panel border border-slate-800 rounded-xl p-12 text-center bg-slate-900/50">
            <div className="text-5xl mb-4">💻</div>
            <h3 className="text-xl font-bold text-white mb-2">No active software projects</h3>
            <p className="text-slate-400 mb-6">Submit an estimation brief to get started on your custom enterprise application.</p>
            <button 
              onClick={() => setShowForm(true)}
              className="text-indigo-400 hover:underline font-medium"
            >
              Submit Brief &rarr;
            </button>
          </div>
        )}

        {projects.map(project => (
          <div key={project.$id} className="glass-panel border border-slate-800 rounded-xl p-6 hover:border-indigo-500/30 transition-colors bg-slate-900/50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">{project.title}</h3>
                <div className="text-sm text-slate-400 mt-1">
                  {project.projectType} • Submitted on {new Date(project.$createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-semibold border uppercase tracking-wide ${getStatusColor(project.status)}`}>
                {project.status.replace('-', ' ')}
              </div>
            </div>

            <p className="text-slate-300 text-sm mb-6 line-clamp-2">{project.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center border-t border-slate-800 pt-4">
              <div className="text-sm">
                <span className="block text-slate-500 text-xs mb-1">Your Budget</span>
                <span className="font-medium text-slate-300">
                  {project.budget ? `$${project.budget.toLocaleString()}` : 'Not Specified'}
                </span>
              </div>

              <div className="text-sm">
                <span className="block text-slate-500 text-xs mb-1">Official Quote</span>
                <span className="font-bold text-indigo-400">
                  {project.quotePrice ? `$${project.quotePrice.toLocaleString()}` : 'Pending Estimation'}
                </span>
              </div>

              <div className="text-sm">
                <span className="block text-slate-500 text-xs mb-1">Deadline</span>
                <span className="font-medium text-white">
                  {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'Flexible'}
                </span>
              </div>

              <div className="text-sm flex justify-end items-center">
                <span className="text-indigo-400 text-sm font-medium opacity-50 cursor-not-allowed" title="Roadmap view coming soon">
                  Roadmap (Coming Soon)
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
