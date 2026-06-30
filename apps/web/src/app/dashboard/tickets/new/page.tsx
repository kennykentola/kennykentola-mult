'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createTicket } from '../../../../features/tickets/ticketsService';
import { Ticket, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewTicketPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'medium',
    projectOrContractId: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject || !formData.description) return;
    
    setLoading(true);
    try {
      await createTicket(formData);
      router.push('/dashboard/tickets');
    } catch (err) {
      console.error(err);
      alert('Failed to create ticket.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Link href="/dashboard/tickets" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Support
      </Link>

      <div className="glass-panel border border-white/5 rounded-3xl p-8 lg:p-10 bg-slate-950/50">
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-white/5">
          <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Ticket className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Open a Support Ticket</h1>
            <p className="text-slate-400 text-sm mt-1">Describe the issue so our engineers can assist you.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-300">Subject / Issue Title</label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
              placeholder="e.g. Server is down, Need SLA maintenance"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300">Priority Level</label>
              <select
                aria-label="Priority Level"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none appearance-none transition-all"
              >
                <option value="low">Low - General Question</option>
                <option value="medium">Medium - Standard Support</option>
                <option value="high">High - System Outage / Critical</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300">Related Project ID (Optional)</label>
              <input
                type="text"
                value={formData.projectOrContractId}
                onChange={(e) => setFormData({ ...formData, projectOrContractId: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                placeholder="e.g. PRJ-1234"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-300">Issue Description</label>
            <textarea
              required
              rows={6}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
              placeholder="Please provide as much detail as possible..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Support Ticket'}
          </button>
        </form>
      </div>
    </div>
  );
}
