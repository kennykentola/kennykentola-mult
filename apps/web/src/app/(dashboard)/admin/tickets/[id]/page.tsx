'use client';

import { useEffect, useState, use } from 'react';
import { useAuth } from '@/lib/auth';
import { client } from '@/lib/appwrite';
import { Databases } from 'appwrite';
import Link from 'next/link';
import { Ticket } from '@company/shared';

export default function TicketDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { user } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  // Form State
  const [status, setStatus] = useState<string>('open');
  const [assignedTo, setAssignedTo] = useState<string>('');

  useEffect(() => {
    if (user && resolvedParams.id) fetchTicket();
  }, [user, resolvedParams.id]);

  const fetchTicket = async () => {
    try {
      const databases = new Databases(client);
      const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'multicompany';
      const res = await databases.getDocument(dbId, 'tickets', resolvedParams.id);
      
      const fetchedTicket = res as unknown as Ticket;
      setTicket(fetchedTicket);
      setStatus(fetchedTicket.status);
      setAssignedTo(fetchedTicket.assignedTo || '');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      const databases = new Databases(client);
      const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'multicompany';
      
      await databases.updateDocument(dbId, 'tickets', resolvedParams.id, {
        status,
        assignedTo: assignedTo || null
      });
      
      alert('Ticket updated successfully!');
      fetchTicket();
    } catch (err: any) {
      alert(err.message || 'Failed to update ticket.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-muted">Loading ticket...</div>;
  if (!ticket) return <div className="p-8 text-center text-red-400 bg-red-400/10 rounded-xl">Ticket not found</div>;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/admin/tickets" className="text-sm text-muted hover:text-primary transition-colors flex items-center space-x-1 mb-4">
          <span>&larr;</span> <span>Back to Tickets</span>
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-primary-foreground tracking-tight">{ticket.subject}</h1>
            <p className="text-muted mt-2 text-sm">Submitted by: {ticket.userId}</p>
          </div>
          <span className={`px-3 py-1 text-xs rounded-full font-medium ${
            ticket.priority === 'urgent' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-white/5 text-muted'
          }`}>
            Priority: {ticket.priority.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="glass-panel border border-border rounded-xl p-6">
            <h2 className="text-lg font-bold text-primary-foreground mb-4">Description</h2>
            <div className="p-4 bg-background border border-border rounded-lg">
              <p className="text-primary-foreground whitespace-pre-wrap">{ticket.description}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-panel border border-border rounded-xl p-6 space-y-6">
            <h2 className="text-lg font-bold text-primary-foreground">Admin Actions</h2>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted">Status</label>
              <select 
                title="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 bg-card border border-border rounded-md text-primary-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted">Assign To (User ID)</label>
              <input 
                type="text" 
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="Enter technician ID..."
                className="w-full px-3 py-2 bg-card border border-border rounded-md text-primary-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted">Paste the User ID of the Developer/Technician.</p>
            </div>

            <button 
              onClick={handleUpdate}
              disabled={updating}
              className="w-full py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-medium transition-colors disabled:opacity-50"
            >
              {updating ? 'Saving...' : 'Update Ticket'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
