'use client';

import React, { useState } from 'react';
import { Send, Loader2, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminNewsletterPage() {
  const [formData, setFormData] = useState({
    subject: '',
    html: '',
    segment: 'all'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/newsletter/broadcast`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Failed to send broadcast');
      
      toast.success(data.message || 'Broadcast sent successfully!');
      setFormData({ subject: '', html: '', segment: 'all' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to send broadcast. Check your permissions.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-blue-500/10 rounded-xl">
          <Send className="w-6 h-6 text-blue-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Newsletter Broadcast</h1>
          <p className="text-slate-400">Send updates to your subscribers, filter by segment.</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label htmlFor="segment" className="block text-sm font-medium text-slate-300 mb-2">Target Audience (Segment)</label>
            <div className="relative">
              <select
                id="segment"
                value={formData.segment}
                onChange={(e) => setFormData({ ...formData, segment: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 appearance-none transition-colors"
              >
                <option value="all">All Subscribers</option>
                <option value="general">General Updates</option>
                <option value="students">Students</option>
                <option value="printing">Printing Clients</option>
                <option value="solar">Solar Clients</option>
                <option value="thesis">CS Thesis / Academic</option>
              </select>
              <Users className="w-5 h-5 text-slate-500 absolute left-3 top-3.5" />
            </div>
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-slate-300 mb-2">Email Subject</label>
            <input
              id="subject"
              type="text"
              required
              placeholder="e.g. New Blog Post: The Future of React"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="html" className="block text-sm font-medium text-slate-300 mb-2">Email Content (HTML Supported)</label>
            <textarea
              id="html"
              required
              rows={12}
              placeholder="<h1>Hello!</h1><p>Check out our latest update...</p>"
              value={formData.html}
              onChange={(e) => setFormData({ ...formData, html: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors font-mono text-sm"
            />
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              Send Broadcast Now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
