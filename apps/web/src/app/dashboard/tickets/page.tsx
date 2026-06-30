'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getMyTickets } from '../../../features/tickets/ticketsService';
import { Ticket, Plus, Clock, Search, MessageSquare } from 'lucide-react';

export default function ClientTicketsDashboard() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const data = await getMyTickets();
      setTickets(data);
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'open': return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">Open</span>;
      case 'resolved': return <span className="bg-slate-500/10 text-slate-400 border border-slate-500/20 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">Resolved</span>;
      default: return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">{status}</span>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch(priority) {
      case 'high': return <span className="text-rose-400 text-xs font-bold uppercase">High Priority</span>;
      case 'medium': return <span className="text-amber-400 text-xs font-bold uppercase">Medium Priority</span>;
      case 'low': return <span className="text-blue-400 text-xs font-bold uppercase">Low Priority</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-slate-950 p-8 lg:p-12 shadow-2xl">
        <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[140%] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/5 px-3 py-1 text-xs font-semibold text-indigo-300">
            Support Center
          </span>
          <h1 className="mt-4 text-3xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            IT & Maintenance{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              Ticketing
            </span>
          </h1>
          <p className="mt-4 text-slate-400 text-sm lg:text-base leading-relaxed">
            Report IT issues or request maintenance for your solar and electrical infrastructure.
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Ticket className="h-5 w-5 text-indigo-400" />
          My Support Tickets
        </h2>
        <Link href="/dashboard/tickets/new" className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20">
          <Plus className="h-4 w-4" />
          New Ticket
        </Link>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-slate-900/50 rounded-2xl border border-white/5"></div>
          <div className="h-24 bg-slate-900/50 rounded-2xl border border-white/5"></div>
        </div>
      ) : tickets.length > 0 ? (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <Link href={`/dashboard/tickets/${ticket.$id}`} key={ticket.$id} className="block glass-panel border border-white/5 bg-slate-950/40 hover:bg-slate-900/40 rounded-2xl p-5 transition-colors group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/0 group-hover:bg-indigo-500 transition-colors" />
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusBadge(ticket.status)}
                    {getPriorityBadge(ticket.priority)}
                  </div>
                  <h4 className="text-lg font-bold text-white">{ticket.subject}</h4>
                  <p className="text-sm text-slate-400 mt-1 line-clamp-2">{ticket.description}</p>
                </div>
                
                <div className="flex flex-col justify-end items-end shrink-0">
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mb-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                    <Clock className="h-3.5 w-3.5" />
                    {new Date(ticket.$createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-indigo-400 font-bold flex items-center gap-1 group-hover:underline">
                    View Thread <MessageSquare className="h-3 w-3" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-950/30 p-12 text-center">
          <Search className="mx-auto h-12 w-12 text-slate-700 mb-4" />
          <h3 className="text-lg font-bold text-white">No active tickets</h3>
          <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
            You don't have any support tickets. If you're experiencing an issue, create a new ticket to get help from our engineers.
          </p>
        </div>
      )}
    </div>
  );
}
