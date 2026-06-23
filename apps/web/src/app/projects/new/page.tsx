'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProjectRequest } from '../../../features/projects/projectsService';
import { ArrowLeft, Loader2, CheckCircle, Code } from 'lucide-react';
import Link from 'next/link';

export default function NewProjectRequestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await createProjectRequest({
        title: formData.title,
        description: formData.description,
        budget: formData.budget ? Number(formData.budget) : undefined
      });
      router.push('/projects');
    } catch (err: any) {
      setError(err.message || 'Failed to submit request.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Projects
      </Link>

      <div className="rounded-3xl border border-white/5 bg-slate-950/40 p-8 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Code className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Request a Software Project</h1>
            <p className="text-sm text-slate-400">Provide details about the app, website, or system you want us to build.</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300">Project Title</label>
            <input
              required
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. E-Commerce Mobile App, Corporate Website"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300">Project Description</label>
            <textarea
              required
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={6}
              placeholder="Describe what you want to build, the key features, target audience, and any reference apps..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300">Estimated Budget (NGN) - Optional</label>
            <input
              type="number"
              min="0"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              placeholder="e.g. 500000"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
            <p className="text-xs text-slate-500">We will provide a formal quote after reviewing your request.</p>
          </div>

          <div className="border-t border-slate-800 pt-6 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 text-sm font-bold transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
