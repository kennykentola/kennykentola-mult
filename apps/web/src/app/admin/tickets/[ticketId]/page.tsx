'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../features/auth/AuthContext';
import { getTicketDetails, sendTicketMessage, updateAdminTicketStatus } from '../../../../features/tickets/ticketsService';
import { ArrowLeft, Send, Save, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminTicketDetailsPage() {
  const params = useParams() as Record<string, string>;
  const router = useRouter();
  const { user } = useAuth();
  
  const [ticket, setTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [messageContent, setMessageContent] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [updating, setUpdating] = useState(false);
  
  // Status edit state
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, [params.ticketId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchData = async () => {
    try {
      const data = await getTicketDetails(params.ticketId);
      setTicket(data.ticket);
      setMessages(data.messages || []);
      setStatus(data.ticket.status);
      setPriority(data.ticket.priority);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim()) return;
    setSendingMsg(true);
    try {
      await sendTicketMessage(params.ticketId, messageContent);
      setMessageContent('');
      await fetchData(); 
    } catch (err) {
      console.error(err);
      alert('Failed to send message');
    } finally {
      setSendingMsg(false);
    }
  };

  const handleUpdateTicket = async () => {
    setUpdating(true);
    try {
      await updateAdminTicketStatus(params.ticketId, { status, priority });
      alert('Ticket updated successfully!');
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to update ticket');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-400">Loading ticket...</div>;
  if (!ticket) return <div className="p-12 text-center text-rose-400">Ticket not found.</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <Link href="/admin/tickets" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Inbox
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Chat Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel border border-white/5 rounded-3xl p-6 lg:p-8 bg-slate-950/40 relative overflow-hidden">
            <h1 className="text-2xl font-black text-white">{ticket.subject}</h1>
            <p className="text-slate-400 mt-2 text-sm">{ticket.description}</p>
          </div>

          <div className="glass-panel border border-white/5 rounded-2xl bg-slate-900/30 flex flex-col h-[600px]">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((msg: any) => {
                const isMine = msg.senderId === user?.id;
                return (
                  <div key={msg.$id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                    <span className="text-[10px] uppercase font-bold text-slate-500 mb-1 px-1">
                      {isMine ? 'You (Admin)' : 'Client'} • {new Date(msg.$createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                    <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-5 py-3 text-sm shadow-sm ${
                      isMine 
                        ? 'bg-indigo-600 text-white rounded-tr-sm shadow-indigo-900/20' 
                        : 'bg-slate-800 text-slate-200 border border-white/5 rounded-tl-sm'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>
            
            <div className="p-4 border-t border-white/5 bg-slate-950/50">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <input
                  type="text"
                  value={messageContent}
                  onChange={e => setMessageContent(e.target.value)}
                  placeholder="Type your reply to the client..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
                <button 
                  type="submit" 
                  disabled={sendingMsg || !messageContent.trim()}
                  className="px-6 flex items-center gap-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-colors disabled:opacity-50"
                >
                  <Send className="h-4 w-4" /> Reply
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column: Admin Controls */}
        <div className="space-y-6">
          <div className="glass-panel border border-white/5 rounded-3xl p-6 bg-slate-950/40">
            <h3 className="font-bold text-white mb-6 border-b border-white/5 pb-4">Manage Ticket</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Status</label>
                <select 
                  aria-label="Status"
                  value={status} 
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 appearance-none"
                >
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Priority</label>
                <select 
                  aria-label="Priority"
                  value={priority} 
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 appearance-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="pt-4 mt-4 border-t border-white/5">
                <button
                  onClick={handleUpdateTicket}
                  disabled={updating}
                  className="w-full flex justify-center items-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {updating ? 'Saving...' : 'Update Ticket'}
                </button>
              </div>
            </div>
          </div>

          <div className="glass-panel border border-white/5 rounded-3xl p-6 bg-slate-950/40 text-sm">
            <h3 className="font-bold text-white mb-4">Ticket Metadata</h3>
            <ul className="space-y-3 text-slate-400">
              <li><strong className="text-slate-300">Client ID:</strong><br/><span className="font-mono text-xs break-all">{ticket.userId}</span></li>
              <li><strong className="text-slate-300">Ticket ID:</strong><br/><span className="font-mono text-xs break-all">{ticket.$id}</span></li>
              <li><strong className="text-slate-300">Created:</strong><br/>{new Date(ticket.$createdAt).toLocaleString()}</li>
              {ticket.projectOrContractId && (
                <li><strong className="text-slate-300">Ref ID:</strong><br/><span className="font-mono text-xs break-all">{ticket.projectOrContractId}</span></li>
              )}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
