'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { client } from '@/lib/appwrite';
import { Databases, Query } from 'appwrite';
import Link from 'next/link';
import { PrintOrder } from '@company/shared';

export default function PrintingDashboardPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<PrintOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const databases = new Databases(client);
      const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'multicompany';

      const res = await databases.listDocuments(dbId, 'print_orders', [
        Query.equal('userId', user!.$id),
        Query.orderDesc('$createdAt')
      ]);

      setOrders(res.documents as unknown as PrintOrder[]);
    } catch (err) {
      console.error('Failed to fetch print orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: PrintOrder['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'quoting': return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'paid': return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30';
      case 'printing': return 'bg-purple-500/20 text-purple-500 border-purple-500/30';
      case 'completed': return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'delivered': return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
      default: return 'bg-white/10 text-muted';
    }
  };

  if (loading) return <div className="p-8 text-center text-muted">Loading Orders...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary-foreground tracking-tight">Printing Services</h1>
          <p className="text-muted mt-1 text-sm">Manage your print jobs, request quotes, and track delivery.</p>
        </div>
        <Link 
          href="/dashboard/printing/new" 
          className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(var(--primary),0.3)]"
        >
          + New Print Order
        </Link>
      </div>

      <div className="glass-panel border border-border rounded-xl overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">🖨️</div>
            <h3 className="text-xl font-bold text-primary-foreground mb-2">No print orders yet</h3>
            <p className="text-muted mb-6">Upload your first document to get a quote for high-quality printing.</p>
            <Link 
              href="/dashboard/printing/new" 
              className="text-primary hover:underline font-medium"
            >
              Start an Order &rarr;
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-border text-sm font-medium text-muted">
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Specs</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map(order => (
                  <tr key={order.$id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="text-primary-foreground font-medium">#{order.$id?.slice(0,8).toUpperCase()}</div>
                      <div className="text-xs text-muted mt-1">{(order as any).$createdAt ? new Date((order as any).$createdAt).toLocaleDateString() : 'N/A'}</div>
                    </td>
                    <td className="p-4 capitalize text-primary-foreground">
                      {order.printingType.replace('-', ' ')}
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-primary-foreground">{order.paperSize} • {order.colorMode}</div>
                      <div className="text-xs text-muted mt-1">{order.quantity} copies {order.doubleSided ? '• Double Sided' : ''}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)} capitalize`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-right font-medium text-primary-foreground">
                      {order.quotePrice > 0 ? (
                        <div className="flex flex-col items-end gap-2">
                          <span>${order.quotePrice.toFixed(2)}</span>
                          {order.status === 'quoted' && (
                            <Link 
                              href={`/checkout/print_orders/${order.$id}`}
                              className="px-3 py-1 bg-green-500 hover:bg-green-400 text-black text-xs font-bold rounded shadow-sm transition-colors"
                            >
                              Pay Now
                            </Link>
                          )}
                        </div>
                      ) : (
                        'Pending Quote'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
