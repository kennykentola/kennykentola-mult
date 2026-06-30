'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAdminAllTickets, updateAdminTicketStatus } from '../../../features/tickets/ticketsService';
import { Ticket, Search, Clock, MessageSquare, AlertCircle } from 'lucide-react';

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const data = await getAdminAllTickets();
      setTickets(data);
    } catch (err) {
      console.error('Failed to fetch admin tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'open': return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">Open</span>;
      case 'resolved': return <span className="bg-slate-500/10 text-slate-400 border border-slate-500/20 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">Resolved</span>;
      default: return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">{status}</span>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch(priority) {
      case 'high': return <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1"><AlertCircle className="w-3 h-3"/> High</span>;
      case 'medium': return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">Medium</span>;
      case 'low': return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">Low</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
          <Ticket className="h-8 w-8 text-indigo-400" />
          Global Support Inbox
        </h1>
        <p className="text-slate-400 mt-2">Manage all client IT and Solar Maintenance support tickets.</p>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-slate-900/50 rounded-2xl border border-white/5"></div>
          <div className="h-24 bg-slate-900/50 rounded-2xl border border-white/5"></div>
        </div>
      ) : tickets.length > 0 ? (
        <div className="bg-slate-950/40 rounded-3xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-slate-900/50">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Subject & Client</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tickets.map((ticket) => (
                  <tr key={ticket.$id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white text-sm mb-1">{ticket.subject}</div>
                      <div className="text-xs text-slate-500 font-mono">Client ID: {ticket.userId.substring(0, 8)}</div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(ticket.status)}
                    </td>
                    <td className="px-6 py-4">
                      {getPriorityBadge(ticket.priority)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(ticket.$createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/admin/tickets/${ticket.$id}`}
                        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Open Ticket
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-950/30 p-12 text-center">
          <Search className="mx-auto h-12 w-12 text-slate-700 mb-4" />
          <h3 className="text-lg font-bold text-white">No tickets found</h3>
          <p className="mt-2 text-sm text-slate-400">
            There are currently no support tickets in the system.
          </p>
        </div>
      )}
    </div>
  );
}
