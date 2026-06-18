'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { client } from '@/lib/appwrite';
import { Databases, Query } from 'appwrite';
import Link from 'next/link';
import { Ticket } from '@company/shared';

export default function AdminTicketsPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchTickets();
  }, [user]);

  const fetchTickets = async () => {
    try {
      const databases = new Databases(client);
      const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'multicompany';
      const res = await databases.listDocuments(dbId, 'tickets', [
        Query.orderDesc('$createdAt')
      ]);
      setTickets(res.documents as unknown as Ticket[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-muted">Loading tickets...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary-foreground tracking-tight">Service Tickets</h1>
        <p className="text-muted mt-1 text-sm">Manage incoming client requests and support queries.</p>
      </div>

      <div className="glass-panel border border-border rounded-xl overflow-hidden">
        {tickets.length === 0 ? (
          <div className="p-8 text-center text-muted">No tickets found.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-white/5">
                <th className="px-6 py-4 text-sm font-semibold text-primary-foreground">Subject</th>
                <th className="px-6 py-4 text-sm font-semibold text-primary-foreground">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-primary-foreground">Priority</th>
                <th className="px-6 py-4 text-sm font-semibold text-primary-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tickets.map(t => (
                <tr key={t.$id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-medium text-primary-foreground">{t.subject}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                      t.status === 'open' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                      t.status === 'in-progress' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                      'bg-green-500/10 text-green-400 border border-green-500/20'
                    }`}>
                      {t.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                      t.priority === 'high' || t.priority === 'urgent' ? 'text-red-400' : 'text-muted'
                    }`}>
                      {t.priority.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/dashboard/admin/tickets/${t.$id}`} className="text-sm font-medium text-primary hover:underline">
                      Review & Assign
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
