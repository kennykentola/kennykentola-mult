'use client';

import { useEffect, useState } from 'react';
import { maintenanceService } from '../../features/maintenance/maintenanceService';
import Link from 'next/link';

interface MaintenanceContract {
  $id: string;
  title: string;
  serviceType: string;
  frequency: string;
  status: string;
  startDate: string;
  endDate?: string;
  amount: number;
}

export default function MaintenanceDashboardPage() {
  const [contracts, setContracts] = useState<MaintenanceContract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const data = await maintenanceService.getMyContracts();
      setContracts(data);
    } catch (err) {
      console.error('Failed to fetch maintenance contracts:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'pending': return { label: 'Quote Pending', color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' };
      case 'active': return { label: 'Active', color: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30' };
      case 'expired': return { label: 'Expired', color: 'bg-rose-500/20 text-rose-500 border-rose-500/30' };
      case 'cancelled': return { label: 'Cancelled', color: 'bg-slate-500/20 text-slate-500 border-slate-500/30' };
      default: return { label: 'Unknown', color: 'bg-white/10 text-white border-white/20' };
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'TBD';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading Maintenance Contracts...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">IT Maintenance Contracts</h1>
          <p className="text-slate-400 mt-1 text-sm">Manage your IT infrastructure, Network, and Hardware support agreements.</p>
        </div>
        <Link 
          href="/maintenance/new" 
          className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(217,119,6,0.4)]"
        >
          + Request Contract
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {contracts.length === 0 ? (
          <div className="glass-panel border border-slate-800 rounded-xl p-12 text-center bg-slate-900/50">
            <div className="text-6xl mb-4">🛠️</div>
            <h3 className="text-xl font-bold text-white mb-2">No maintenance contracts found</h3>
            <p className="text-slate-400 mb-6">Request a new IT support or network management contract to ensure maximum uptime.</p>
            <Link 
              href="/maintenance/new" 
              className="text-amber-500 hover:underline font-medium"
            >
              Request a Quote &rarr;
            </Link>
          </div>
        ) : (
          contracts.map(contract => {
            const statusInfo = getStatusDisplay(contract.status);
            return (
              <div key={contract.$id} className="glass-panel border border-slate-800 rounded-xl p-6 hover:border-amber-500/30 transition-colors bg-slate-900/50">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{contract.title}</h3>
                    <div className="text-sm text-slate-400 mt-1">
                      {contract.serviceType} • {contract.frequency.charAt(0).toUpperCase() + contract.frequency.slice(1)} Billing
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusInfo.color}`}>
                    {statusInfo.label}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center border-t border-slate-800 pt-4 mt-4">
                  <div className="text-sm">
                    <span className="block text-slate-500 text-xs mb-1">Start Date</span>
                    <span className="font-medium text-white">
                      {formatDate(contract.startDate)}
                    </span>
                  </div>

                  <div className="text-sm">
                    <span className="block text-slate-500 text-xs mb-1">End / Renewal Date</span>
                    <span className="font-medium text-white">
                      {formatDate(contract.endDate)}
                    </span>
                  </div>

                  <div className="text-sm">
                    <span className="block text-slate-500 text-xs mb-1">Contract Amount</span>
                    <span className="font-semibold text-white">
                      {contract.amount > 0 ? `$${contract.amount.toFixed(2)}` : 'Pending Quote'}
                    </span>
                  </div>

                  <div className="text-sm flex justify-end">
                    <button className="text-amber-500 hover:underline text-sm font-medium">
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
