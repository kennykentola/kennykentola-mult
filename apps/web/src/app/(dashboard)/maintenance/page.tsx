'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { client } from '@/lib/appwrite';
import { Databases, Query } from 'appwrite';
import Link from 'next/link';
import { MaintenanceContract } from '@company/shared';

export default function MaintenanceDashboardPage() {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<MaintenanceContract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchContracts();
    }
  }, [user]);

  const fetchContracts = async () => {
    try {
      const databases = new Databases(client);
      const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'multicompany';

      const res = await databases.listDocuments(dbId, 'maintenance_contracts', [
        Query.equal('clientId', user!.$id),
        Query.orderDesc('$createdAt')
      ]);

      setContracts(res.documents as unknown as MaintenanceContract[]);
    } catch (err) {
      console.error('Failed to fetch maintenance contracts:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = (status: MaintenanceContract['status']) => {
    switch (status) {
      case 'pending': return { label: 'Quote Pending', color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' };
      case 'active': return { label: 'Active', color: 'bg-green-500/20 text-green-500 border-green-500/30' };
      case 'expired': return { label: 'Expired', color: 'bg-red-500/20 text-red-500 border-red-500/30' };
      case 'cancelled': return { label: 'Cancelled', color: 'bg-slate-500/20 text-slate-500 border-slate-500/30' };
      default: return { label: 'Unknown', color: 'bg-white/10 text-muted border-white/20' };
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'TBD';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  if (loading) return <div className="p-8 text-center text-muted">Loading Maintenance Contracts...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary-foreground tracking-tight">Maintenance Contracts</h1>
          <p className="text-muted mt-1 text-sm">Manage your IT, Network, and Hardware support agreements.</p>
        </div>
        <Link 
          href="/dashboard/maintenance/new" 
          className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(var(--primary),0.3)]"
        >
          + Request Contract
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {contracts.length === 0 ? (
          <div className="glass-panel border border-border rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">🛠️</div>
            <h3 className="text-xl font-bold text-primary-foreground mb-2">No maintenance contracts found</h3>
            <p className="text-muted mb-6">Request a new IT support or network management contract to ensure uptime.</p>
            <Link 
              href="/dashboard/maintenance/new" 
              className="text-primary hover:underline font-medium"
            >
              Request a Quote &rarr;
            </Link>
          </div>
        ) : (
          contracts.map(contract => {
            const statusInfo = getStatusDisplay(contract.status);
            return (
              <div key={contract.$id} className="glass-panel border border-border rounded-xl p-6 hover:border-primary/30 transition-colors">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-primary-foreground">{contract.title}</h3>
                    <div className="text-sm text-muted mt-1">
                      {contract.serviceType} • {contract.frequency.charAt(0).toUpperCase() + contract.frequency.slice(1)} Billing
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusInfo.color}`}>
                    {statusInfo.label}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center border-t border-border pt-4 mt-4">
                  <div className="text-sm">
                    <span className="block text-muted text-xs mb-1">Start Date</span>
                    <span className="font-medium text-primary-foreground">
                      {formatDate(contract.startDate)}
                    </span>
                  </div>

                  <div className="text-sm">
                    <span className="block text-muted text-xs mb-1">End / Renewal Date</span>
                    <span className="font-medium text-primary-foreground">
                      {formatDate(contract.endDate)}
                    </span>
                  </div>

                  <div className="text-sm">
                    <span className="block text-muted text-xs mb-1">Contract Amount</span>
                    <span className="font-semibold text-primary-foreground">
                      {contract.amount > 0 ? `$${contract.amount.toFixed(2)}` : 'Pending Quote'}
                    </span>
                  </div>

                  <div className="text-sm flex justify-end">
                    <button className="text-primary hover:underline text-sm font-medium">
                      View Details &rarr;
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
