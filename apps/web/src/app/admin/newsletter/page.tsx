'use client';

import React, { useState, useEffect } from 'react';
import { sendBroadcast, fetchSubscribers } from '../../../features/newsletter/newsletterService';
import { Mail, Send, Users, Sparkles, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { AIAssistantModal } from '../../../components/ai/AIAssistantModal';

export default function AdminNewsletterPage() {
  const [subject, setSubject] = useState('');
  const [html, setHtml] = useState('');
  const [segment, setSegment] = useState('all');
  const [sending, setSending] = useState(false);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loadingSubscribers, setLoadingSubscribers] = useState(true);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  useEffect(() => {
    async function loadSubscribers() {
      try {
        const res = await fetchSubscribers();
        if (res.success && res.subscribers) {
          setSubscribers(res.subscribers);
        }
      } catch (error) {
        console.error('Failed to load subscribers', error);
      } finally {
        setLoadingSubscribers(false);
      }
    }
    loadSubscribers();

    // Check for drafts (e.g. from Blog Manager broadcast)
    const draftSubject = localStorage.getItem('newsletter_draft_subject');
    const draftHtml = localStorage.getItem('newsletter_draft_html');
    if (draftSubject && draftHtml) {
      setSubject(draftSubject);
      setHtml(draftHtml);
      localStorage.removeItem('newsletter_draft_subject');
      localStorage.removeItem('newsletter_draft_html');
      toast.success('Loaded broadcast draft from Blog Manager');
    }
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !html.trim()) {
      toast.error('Subject and content are required');
      return;
    }
    
    // Check if the user really wants to send this
    if (!window.confirm(`Are you sure you want to send this broadcast to segment: ${segment}?`)) {
      return;
    }

    setSending(true);
    try {
      const res = await sendBroadcast(subject, html, segment);
      if (res.success) {
        toast.success(res.message || 'Broadcast sent successfully!');
        setSubject('');
        setHtml('');
        setSegment('all');
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to send broadcast');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 p-4 md:p-8">
      <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Mail className="w-8 h-8 text-indigo-400" />
            Newsletter Broadcast
          </h1>
          <p className="text-slate-400 mt-2">Compose and send emails to your subscribers.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Compose Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSend} className="glass-panel border border-white/5 rounded-3xl p-6 lg:p-8 bg-slate-950/40 space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Target Segment</label>
              <select
                title="Target Segment"
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:border-indigo-500 outline-none"
              >
                <option value="all">All Subscribers</option>
                <option value="general">General</option>
                <option value="leads">Agency Leads</option>
                <option value="students">Academy Students</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Subject Line</label>
              <input
                title="Subject"
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Exciting updates from KennyKentola Agency!"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:border-indigo-500 outline-none"
              />
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-slate-300">HTML Content</label>
                <button
                  type="button"
                  onClick={() => setIsAIModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-sm font-semibold rounded-lg transition-colors border border-indigo-500/20"
                >
                  <Sparkles className="w-4 h-4" />
                  Write with AI
                </button>
              </div>
              <textarea
                title="HTML Content"
                required
                rows={15}
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                placeholder="<h1>Hello!</h1><p>Write your email in HTML format...</p>"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:border-indigo-500 outline-none font-mono text-sm resize-y"
              />
              <p className="text-xs text-slate-500 mt-2">
                Note: Standard HTML is supported. Inline CSS is recommended for email clients.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={sending}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all disabled:opacity-50"
              >
                {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                {sending ? 'Sending...' : 'Send Broadcast'}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="glass-panel border border-white/5 rounded-3xl p-6 bg-slate-900/30">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              Audience Info
            </h3>
            <p className="text-sm text-slate-400 mb-4">
              Emails will be sent individually via BCC to protect subscriber privacy. Depending on list size, this might take a few moments.
            </p>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
              <div className="text-2xl font-black text-white">Live</div>
              <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Sending Engine</div>
            </div>
          </div>

          <div className="glass-panel border border-indigo-500/20 rounded-3xl p-6 bg-indigo-950/20">
            <h3 className="text-lg font-bold text-indigo-400 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Pro Tips
            </h3>
            <ul className="text-sm text-slate-400 space-y-3 list-disc list-inside">
              <li>Always include a clear call-to-action (CTA).</li>
              <li>Test your HTML in a tool like Mailtrap before broadcasting.</li>
              <li>Keep the subject line under 50 characters for better open rates.</li>
            </ul>
          </div>
        </div>

      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Users className="w-6 h-6 text-indigo-400" />
          Subscribers List ({subscribers.length})
        </h2>
        
        {loadingSubscribers ? (
          <div className="flex items-center gap-2 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading subscribers...
          </div>
        ) : subscribers.length === 0 ? (
          <div className="text-slate-400">No subscribers found.</div>
        ) : (
          <div className="glass-panel border border-white/5 rounded-3xl overflow-hidden bg-slate-900/30">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/50 text-slate-400 border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 font-bold">Email</th>
                  <th className="px-6 py-4 font-bold">Segment</th>
                  <th className="px-6 py-4 font-bold">Subscribed At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {subscribers.map((sub: any) => (
                  <tr key={sub.$id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">{sub.email}</td>
                    <td className="px-6 py-4 capitalize">{sub.segment || 'General'}</td>
                    <td className="px-6 py-4">
                      {new Date(sub.subscribedAt || sub.$createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <AIAssistantModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        type="newsletter"
        onInsert={(content: string) => setHtml(prev => prev ? prev + '\n<br>\n' + content : content)}
      />
    </div>
  );
}
