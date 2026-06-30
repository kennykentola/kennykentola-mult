'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../features/auth/AuthContext';
import { getTicketDetails, sendTicketMessage } from '../../../../features/tickets/ticketsService';
import { ArrowLeft, Send, Paperclip, AlertCircle, Clock } from 'lucide-react';
import Link from 'next/link';

export default function TicketDetailsPage() {
  const params = useParams() as Record<string, string>;
  const router = useRouter();
  const { user } = useAuth();
  
  const [ticket, setTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [messageContent, setMessageContent] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
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

  if (loading) return <div className="p-12 text-center text-slate-400">Loading ticket details...</div>;
  if (!ticket) return <div className="p-12 text-center text-rose-400">Ticket not found.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <Link href="/dashboard/tickets" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Tickets
      </Link>

      <div className="glass-panel border border-white/5 rounded-3xl p-6 lg:p-8 bg-slate-950/40 relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-full h-1 ${
          ticket.priority === 'high' ? 'bg-gradient-to-r from-rose-500 to-orange-500' :
          ticket.priority === 'low' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
          'bg-gradient-to-r from-amber-500 to-yellow-500'
        }`} />
        
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                ticket.status === 'resolved' ? 'bg-slate-500/10 text-slate-400 border-slate-500/20' :
                'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}>
                {ticket.status}
              </span>
              <span className="text-slate-500 text-xs font-mono font-bold">ID: {ticket.$id.substring(0, 8)}</span>
            </div>
            <h1 className="text-2xl font-black text-white">{ticket.subject}</h1>
            <p className="text-slate-400 mt-2 text-sm">{ticket.description}</p>
          </div>

          <div className="shrink-0 md:text-right bg-slate-900/50 p-4 rounded-xl border border-white/5">
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Priority</div>
            <div className={`font-bold capitalize ${
              ticket.priority === 'high' ? 'text-rose-400' :
              ticket.priority === 'low' ? 'text-blue-400' : 'text-amber-400'
            }`}>
              {ticket.priority}
            </div>
            
            <div className="mt-3 text-xs text-slate-500 flex items-center md:justify-end gap-1">
              <Clock className="h-3.5 w-3.5" />
              {new Date(ticket.$createdAt).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel border border-white/5 rounded-2xl bg-slate-900/30 flex flex-col h-[500px]">
        <div className="p-4 border-b border-white/5 bg-slate-950/50">
          <h3 className="font-bold text-white flex items-center gap-2">
            <MessageSquareIcon className="h-4 w-4 text-indigo-400" />
            Support Chat
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex justify-center">
            <span className="text-xs text-slate-500 bg-slate-950 px-3 py-1 rounded-full border border-white/5">
              Ticket created
            </span>
          </div>
          
          {messages && messages.length > 0 ? messages.map((msg: any) => {
            const isMine = msg.senderId === user?.id;
            return (
              <div key={msg.$id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                <span className="text-[10px] uppercase font-bold text-slate-500 mb-1 px-1">
                  {isMine ? 'You' : 'Support'} • {new Date(msg.$createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
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
          }) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500">
              <AlertCircle className="h-8 w-8 text-slate-700 mb-3" />
              <p>A support agent will reply to your ticket here.</p>
              <p className="text-xs mt-1">You can also add more details to your ticket below.</p>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        
        {ticket.status !== 'resolved' ? (
          <div className="p-4 border-t border-white/5 bg-slate-950/50">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <input
                type="text"
                value={messageContent}
                onChange={e => setMessageContent(e.target.value)}
                placeholder="Type your reply..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
              <button 
                type="submit" 
                title="Send Message"
                disabled={sendingMsg || !messageContent.trim()}
                className="h-12 w-12 flex items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-colors disabled:opacity-50"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        ) : (
          <div className="p-4 border-t border-white/5 bg-slate-950/50 text-center text-sm text-slate-500 font-medium">
            This ticket has been resolved and is closed to new messages.
          </div>
        )}
      </div>
    </div>
  );
}

// Simple internal icon
function MessageSquareIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
}
