'use client';

import React, { useState } from 'react';
import {
  Printer,
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  ArrowUpDown,
  Package,
  FileText,
  CreditCard
} from 'lucide-react';

type OrderStatus = 'pending' | 'processing' | 'ready' | 'delivered' | 'cancelled';

interface AdminPrintOrder {
  id: string;
  customer: string;
  title: string;
  type: string;
  status: OrderStatus;
  price: string;
  date: string;
  files: number;
}

const statusConfig: Record<OrderStatus, { label: string; color: string; dotColor: string }> = {
  pending:    { label: 'Pending',       color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',   dotColor: 'bg-amber-400' },
  processing: { label: 'In Production', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',     dotColor: 'bg-blue-400' },
  ready:      { label: 'Ready',         color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', dotColor: 'bg-emerald-400' },
  delivered:  { label: 'Delivered',     color: 'text-slate-400 bg-slate-500/10 border-slate-500/20',   dotColor: 'bg-slate-400' },
  cancelled:  { label: 'Cancelled',     color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',     dotColor: 'bg-rose-400' },
};

export default function AdminPrintingPage() {
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<AdminPrintOrder[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    let cancelled = false;
    async function loadOrders() {
      try {
        const { getAdminOrders } = await import('../../../features/printing/printingService');
        const data = await getAdminOrders('all');
        if (!cancelled) {
          // map to AdminPrintOrder format expected by the UI
          setOrders(data.orders.map((o: any) => ({
            id: o.$id,
            customer: o.userId || 'Unknown',
            title: o.title,
            type: o.serviceType,
            status: o.status as OrderStatus,
            price: o.price > 0 ? `₦${o.price.toLocaleString()}` : 'Pending Quote',
            date: new Date(o.$createdAt).toLocaleDateString(),
            files: Array.isArray(o.fileUrls) ? o.fileUrls.length : 0
          })));
        }
      } catch (err) {
        console.error('Failed to load admin printing orders:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadOrders();
    return () => { cancelled = true; };
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const { updateOrderStatus } = await import('../../../features/printing/printingService');
      await updateOrderStatus(orderId, { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const filtered = orders.filter((order) => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch = order.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    ready: orders.filter(o => o.status === 'ready').length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
            <Printer className="h-5 w-5 text-white" />
          </div>
          Print Order Management
        </h1>
        <p className="text-slate-400 text-sm mt-1">Review, process, and manage all customer print orders.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Orders',     value: stats.total,      icon: <FileText className="h-4 w-4" />,    color: 'text-rose-400' },
          { label: 'Pending Review',   value: stats.pending,    icon: <Clock className="h-4 w-4" />,       color: 'text-amber-400' },
          { label: 'In Production',    value: stats.processing, icon: <Printer className="h-4 w-4" />,     color: 'text-blue-400' },
          { label: 'Ready for Pickup', value: stats.ready,      icon: <CheckCircle className="h-4 w-4" />, color: 'text-emerald-400' },
        ].map((stat, i) => (
          <div key={i} className="rounded-xl border border-slate-800/50 bg-slate-900/30 backdrop-blur-sm p-5">
            <div className={`flex items-center gap-2 text-xs font-semibold ${stat.color} mb-2`}>
              {stat.icon}
              {stat.label}
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by order ID, customer, or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950/60 pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          {(['all', 'pending', 'processing', 'ready', 'delivered'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 border ${
                filterStatus === s
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              {s === 'all' ? 'All' : statusConfig[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl border border-slate-800/50 bg-slate-900/30 backdrop-blur-sm overflow-hidden">
        {/* Table Head */}
        <div className="hidden md:grid grid-cols-[1fr_1fr_1fr_auto_auto_auto_auto] gap-4 px-6 py-3 border-b border-slate-800/50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <span className="flex items-center gap-1">Order <ArrowUpDown className="h-3 w-3" /></span>
          <span>Customer</span>
          <span>Service Type</span>
          <span>Files</span>
          <span>Status</span>
          <span>Price</span>
          <span>Actions</span>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-slate-800/40">
          {filtered.map((order) => {
            const status = statusConfig[order.status];
            return (
              <div key={order.id} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto_auto_auto_auto] gap-3 md:gap-4 px-6 py-4 items-center hover:bg-slate-800/10 transition-colors">
                <div>
                  <p className="text-sm font-bold text-white">{order.title}</p>
                  <p className="text-xs text-slate-500">{order.id} · {order.date}</p>
                </div>
                <p className="text-sm text-slate-300">{order.customer}</p>
                <p className="text-xs text-slate-400">{order.type}</p>
                <p className="text-xs text-slate-400 text-center">{order.files}</p>
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold whitespace-nowrap ${status.color}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${status.dotColor}`} />
                  {status.label}
                </span>
                <span className="text-sm font-bold text-white">{order.price}</span>
                <div className="flex items-center gap-2">
                  <button
                    className="rounded-lg p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="View order details"
                    aria-label={`View details for ${order.id}`}
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  {order.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'processing')}
                        className="rounded-lg p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/20 transition-colors"
                        title="Accept order"
                        aria-label={`Accept order ${order.id}`}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                        className="rounded-lg p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-900/20 transition-colors"
                        title="Reject order"
                        aria-label={`Reject order ${order.id}`}
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  {order.status === 'processing' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'ready')}
                      className="rounded-lg p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/20 transition-colors"
                      title="Mark as ready"
                      aria-label={`Mark ${order.id} as ready`}
                    >
                      <Package className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <Search className="h-8 w-8 text-slate-700 mx-auto" />
              <p className="text-sm text-slate-500 mt-3">No orders match your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
