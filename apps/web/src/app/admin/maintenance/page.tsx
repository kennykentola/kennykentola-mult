'use client';

import { useEffect, useState } from 'react';
import { maintenanceService } from '../../../features/maintenance/maintenanceService';

interface MaintenanceContract {
  $id: string;
  clientId: string;
  title: string;
  serviceType: string;
  frequency: string;
  status: string;
  startDate: string;
  endDate?: string;
  amount: number;
}

export default function AdminMaintenanceDashboard() {
  const [contracts, setContracts] = useState<MaintenanceContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ status: '', amount: 0 });

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const data = await maintenanceService.getAllContracts();
      setContracts(data);
    } catch (err) {
      console.error('Failed to fetch contracts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      await maintenanceService.updateContract(id, {
        status: editForm.status,
        amount: Number(editForm.amount),
      });
      setEditingId(null);
      fetchContracts();
    } catch (err) {
      console.error('Failed to update contract:', err);
      alert('Error updating contract.');
    }
  };

  const startEditing = (contract: MaintenanceContract) => {
    setEditingId(contract.$id);
    setEditForm({
      status: contract.status,
      amount: contract.amount,
    });
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading Maintenance Contracts...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">IT Maintenance Pipeline</h1>
        <p className="text-sm text-slate-400 mt-1">Manage IT support requests, finalize quotes, and track contract statuses.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/50 text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Contract Info</th>
                <th className="p-4 font-semibold">Service Type</th>
                <th className="p-4 font-semibold">Start Date</th>
                <th className="p-4 font-semibold">Quote / Amount</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {contracts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">No maintenance requests found.</td>
                </tr>
              ) : (
                contracts.map(contract => (
                  <tr key={contract.$id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-white">{contract.title}</div>
                      <div className="text-xs text-slate-500">Client: {contract.clientId}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-slate-300">{contract.serviceType}</div>
                      <div className="text-xs text-slate-500">{contract.frequency} billing</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-slate-300">
                        {new Date(contract.startDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4">
                      {editingId === contract.$id ? (
                        <div className="flex items-center gap-1">
                          <span className="text-slate-400">$</span>
                          <input 
                            title="Quote Amount"
                            type="number" 
                            className="w-24 rounded bg-slate-950 border border-slate-700 px-2 py-1 text-sm text-white focus:outline-none focus:border-amber-500"
                            value={editForm.amount}
                            onChange={(e) => setEditForm({...editForm, amount: Number(e.target.value)})}
                          />
                        </div>
                      ) : (
                        <div className="text-sm font-semibold text-emerald-400">
                          {contract.amount > 0 ? `$${contract.amount.toLocaleString()}` : 'Not Quoted'}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      {editingId === contract.$id ? (
                        <select 
                          title="Status"
                          className="w-full rounded bg-slate-950 border border-slate-700 px-2 py-1 text-sm text-white"
                          value={editForm.status}
                          onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                        >
                          <option value="pending">Quote Pending</option>
                          <option value="active">Active</option>
                          <option value="expired">Expired</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                          contract.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                          contract.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                          contract.status === 'expired' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                          'bg-slate-500/10 text-slate-400 border-slate-500/20'
                        }`}>
                          {contract.status.toUpperCase()}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {editingId === contract.$id ? (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleUpdate(contract.$id)}
                            className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium rounded transition-colors"
                          >
                            Save
                          </button>
                          <button 
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium rounded transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => startEditing(contract)}
                          className="px-3 py-1 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 border border-indigo-500/30 text-xs font-medium rounded transition-colors"
                        >
                          Edit Quote
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
