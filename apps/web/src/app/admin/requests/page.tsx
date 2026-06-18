'use client';

import React, { useEffect, useState } from 'react';
import { client } from '@/lib/appwrite';
import { Databases, Query } from 'appwrite';
import { Layers, Printer, Briefcase, Zap, Settings, RefreshCw, Inbox } from 'lucide-react';
import { DynamicQuoteModal } from '@/components/admin/DynamicQuoteModal';

// Map logical module names to their Appwrite Collection IDs
const MODULES = [
  { id: 'solar_jobs', name: 'Solar & Electrical', icon: Zap, color: 'text-yellow-500' },
  { id: 'print_orders', name: 'Printing Orders', icon: Printer, color: 'text-purple-500' },
  { id: 'maintenance_contracts', name: 'IT Maintenance', icon: Settings, color: 'text-slate-400' },
  { id: 'student_projects', name: 'Academic Projects', icon: Briefcase, color: 'text-emerald-500' },
  { id: 'agency_projects', name: 'Software Projects', icon: Layers, color: 'text-blue-500' },
];

export default function AdminRequestsHub() {
  const [activeModule, setActiveModule] = useState(MODULES[0]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const databases = new Databases(client);
      const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'multicompany';

      const res = await databases.listDocuments(dbId, activeModule.id, [
        Query.orderDesc('$createdAt'),
        Query.limit(50)
      ]);
      setDocuments(res.documents);
    } catch (err) {
      console.error(`Failed to fetch from ${activeModule.id}:`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [activeModule]);

  const getStatusColor = (status: string) => {
    if (status.includes('pending')) return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    if (status.includes('quote')) return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    if (status.includes('paid')) return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    if (status.includes('progress') || status.includes('printing')) return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    if (status.includes('complet')) return 'bg-green-500/10 text-green-500 border-green-500/20';
    return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  };

  // Helper to dynamically extract the most relevant "title" or "identifier" from a document
  const getDocTitle = (doc: any) => {
    if (doc.title) return doc.title;
    if (doc.jobType) return doc.jobType.replace('-', ' ');
    if (doc.printingType) return doc.printingType.replace('-', ' ');
    if (doc.serviceType) return doc.serviceType;
    return `Request #${doc.$id.slice(0, 6)}`;
  };

  // Helper to dynamically extract the price
  const getDocPrice = (doc: any) => {
    const price = doc.quotePrice ?? doc.price;
    if (price === undefined || price === 0) return <span className="text-muted italic">Pending Quote</span>;
    return <span className="font-bold text-emerald-400">${price.toFixed(2)}</span>;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <Inbox className="h-8 w-8 text-primary" />
            Service Requests Hub
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Dynamically view, quote, and manage client requests across all company verticals.
          </p>
        </div>
        <button 
          onClick={fetchDocuments}
          className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          title="Refresh Data"
        >
          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin text-primary' : ''}`} />
        </button>
      </div>

      {/* Module Selector Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-4">
        {MODULES.map(mod => {
          const Icon = mod.icon;
          const isActive = activeModule.id === mod.id;
          return (
            <button
              key={mod.id}
              onClick={() => setActiveModule(mod)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive 
                  ? 'bg-slate-900 border border-slate-700 text-white shadow-lg' 
                  : 'bg-transparent border border-transparent text-slate-500 hover:bg-white/5 hover:text-slate-300'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? mod.color : 'text-slate-500'}`} />
              {mod.name}
            </button>
          );
        })}
      </div>

      {/* Data Grid */}
      <div className="glass-panel border border-border rounded-2xl overflow-hidden bg-slate-900/40">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            Loading {activeModule.name} records...
          </div>
        ) : documents.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-4 opacity-50">📭</div>
            <h3 className="text-lg font-bold text-white mb-2">No Requests Found</h3>
            <p className="text-slate-400 text-sm">There are no requests in the {activeModule.name} queue right now.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/80 border-b border-slate-800 text-xs uppercase tracking-wider font-bold text-slate-500">
                  <th className="p-4 pl-6">Request details</th>
                  <th className="p-4 hidden md:table-cell">Client ID</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right pr-6">Quote Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {documents.map(doc => (
                  <tr 
                    key={doc.$id} 
                    onClick={() => setSelectedRequest(doc)}
                    className="hover:bg-white/5 transition-colors cursor-pointer group"
                  >
                    <td className="p-4 pl-6">
                      <div className="text-white font-semibold group-hover:text-primary transition-colors capitalize">
                        {getDocTitle(doc)}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Submitted: {new Date(doc.$createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <code className="text-xs text-slate-400 bg-slate-950 px-2 py-1 rounded">
                        {doc.clientId || doc.userId || doc.studentId || 'Unknown'}
                      </code>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border uppercase tracking-wider ${getStatusColor(doc.status)}`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="p-4 text-right pr-6">
                      {getDocPrice(doc)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <DynamicQuoteModal 
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        request={selectedRequest}
        collectionId={activeModule.id}
        onUpdateSuccess={() => {
          fetchDocuments(); // Refresh the grid
        }}
      />
    </div>
  );
}
