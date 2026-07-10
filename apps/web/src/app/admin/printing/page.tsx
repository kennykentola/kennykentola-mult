'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
import { PodCatalogModal } from '../../../features/printing/PodCatalogModal';

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
  paymentStatus: string;
}

const statusConfig: Record<OrderStatus, { label: string; color: string; dotColor: string }> = {
  pending:    { label: 'Pending',       color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',   dotColor: 'bg-amber-400' },
  processing: { label: 'In Production', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',     dotColor: 'bg-blue-400' },
  ready:      { label: 'Ready',         color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', dotColor: 'bg-emerald-400' },
  delivered:  { label: 'Delivered',     color: 'text-slate-400 bg-slate-500/10 border-slate-500/20',   dotColor: 'bg-slate-400' },
  cancelled:  { label: 'Cancelled',     color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',     dotColor: 'bg-rose-400' },
};

export default function AdminPrintingPage() {
  const [activeTab, setActiveTab] = useState<'orders' | 'pod' | 'pricing'>('orders');
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<AdminPrintOrder[]>([]);
  
  // POD State
  const [podItems, setPodItems] = useState<any[]>([]);
  const [isPodModalOpen, setIsPodModalOpen] = useState(false);
  const [editingPodItem, setEditingPodItem] = useState<any | undefined>(undefined);
  
  // Pricing State
  const [pricingConfig, setPricingConfig] = useState<any | null>(null);
  
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    let cancelled = false;
    async function loadOrders() {
      try {
        const { getAdminOrders, getAdminPodCatalog, getPricingConfig } = await import('../../../features/printing/printingService');
        const [data, podData, pricingData] = await Promise.all([
          getAdminOrders('all'),
          getAdminPodCatalog(),
          getPricingConfig()
        ]);
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
            files: Array.isArray(o.fileUrls) ? o.fileUrls.length : 0,
            paymentStatus: o.paymentStatus || 'pending'
          })));
          setPodItems(podData);
          if (pricingData?.pricing?.[0]) {
            setPricingConfig(pricingData.pricing[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load admin printing data:', err);
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

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-white/5 pb-4">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
            activeTab === 'orders' 
              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' 
              : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          General Orders
        </button>
        <button
          onClick={() => setActiveTab('pod')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
            activeTab === 'pod' 
              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' 
              : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          Print-on-Demand Catalog
        </button>
        <button
          onClick={() => setActiveTab('pricing')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
            activeTab === 'pricing' 
              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' 
              : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          Pricing Rules
        </button>
      </div>

      {activeTab === 'orders' ? (
        <>
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
                <div className="flex flex-col">
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-semibold whitespace-nowrap mb-1 w-fit ${status.color}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${status.dotColor}`} />
                    {status.label}
                  </span>
                  <span className={`text-[10px] font-medium ${order.paymentStatus === 'awaiting_verification' ? 'text-amber-400' : 'text-slate-500'}`}>
                    Payment: {order.paymentStatus}
                  </span>
                </div>
                <span className="text-sm font-bold text-white">{order.price}</span>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/printing/${order.id}`}
                    className="rounded-lg p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="View order details"
                    aria-label={`View details for ${order.id}`}
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
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
      </>
    ) : activeTab === 'pod' ? (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">Print-on-Demand Catalog</h2>
            <p className="text-slate-400 mt-1">Manage merchandise designs available for customers to order.</p>
          </div>
          <button 
            onClick={() => { setEditingPodItem(undefined); setIsPodModalOpen(true); }}
            className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-lg shadow-rose-500/20"
          >
            + Add New Design
          </button>
        </div>

        {podItems.length === 0 ? (
          <div className="rounded-2xl border border-slate-800/50 bg-slate-900/30 p-12 text-center text-slate-400">
            <Package className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">No Merchandise Designs</h3>
            <p className="max-w-md mx-auto mb-6">You haven't added any print-on-demand items yet. Add your first t-shirt, mug, or other merchandise design.</p>
            <button 
              onClick={() => { setEditingPodItem(undefined); setIsPodModalOpen(true); }}
              className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-lg shadow-rose-500/20"
            >
              + Add New Merchandise Design
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {podItems.map(item => (
              <div key={item.$id} className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden hover:border-slate-700 transition-colors">
                <div className="aspect-square bg-slate-800/50 flex items-center justify-center p-4">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-contain" />
                  ) : (
                    <Package className="h-12 w-12 text-slate-600" />
                  )}
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-white line-clamp-1" title={item.title}>{item.title}</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-lg ${item.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'}`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mb-4 capitalize">{item.category}</p>
                  <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                    <span className="font-bold text-rose-400">₦{item.basePrice.toLocaleString()}</span>
                    <button 
                      onClick={() => { setEditingPodItem(item); setIsPodModalOpen(true); }}
                      className="text-sm text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    ) : activeTab === 'pricing' ? (
      <div className="space-y-6 max-w-2xl">
        <div>
          <h2 className="text-xl font-bold text-white">Pricing Rules</h2>
          <p className="text-slate-400 mt-1">Configure base prices and multipliers for printing services.</p>
        </div>
        {pricingConfig ? (
          <form 
            className="space-y-6 bg-slate-900/30 border border-slate-800/50 p-8 rounded-2xl"
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                const { updatePricingConfig } = await import('../../../features/printing/printingService');
                const updated = await updatePricingConfig(pricingConfig.$id, {
                  pricePerUnit: pricingConfig.pricePerUnit,
                  colorMultiplier: pricingConfig.colorMultiplier,
                  doubleSidedDiscount: pricingConfig.doubleSidedDiscount
                });
                setPricingConfig(updated);
                alert('Pricing config updated successfully!');
              } catch (err: any) {
                alert('Failed to update pricing config: ' + err.message);
              }
            }}
          >
            <div>
              <label htmlFor="pricePerUnit" className="block text-sm font-medium text-slate-300 mb-2">Base Price Per Page (₦)</label>
              <input
                id="pricePerUnit"
                title="Base Price Per Page"
                placeholder="e.g. 50"
                type="number"
                required
                min="0"
                value={pricingConfig.pricePerUnit || 0}
                onChange={e => setPricingConfig({...pricingConfig, pricePerUnit: Number(e.target.value)})}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500"
              />
              <p className="text-xs text-slate-500 mt-2">The default cost for a single B&W A4 page.</p>
            </div>
            
            <div>
              <label htmlFor="colorMultiplier" className="block text-sm font-medium text-slate-300 mb-2">Color Multiplier</label>
              <input
                id="colorMultiplier"
                title="Color Multiplier"
                placeholder="e.g. 2"
                type="number"
                step="0.1"
                min="1"
                required
                value={pricingConfig.colorMultiplier || 1}
                onChange={e => setPricingConfig({...pricingConfig, colorMultiplier: Number(e.target.value)})}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500"
              />
              <p className="text-xs text-slate-500 mt-2">Multiplier for color printing (e.g., 2 = 2x base price).</p>
            </div>

            <div>
              <label htmlFor="doubleSidedDiscount" className="block text-sm font-medium text-slate-300 mb-2">Double Sided Discount</label>
              <input
                id="doubleSidedDiscount"
                title="Double Sided Discount"
                placeholder="e.g. 0.1"
                type="number"
                step="0.05"
                min="0"
                max="1"
                required
                value={pricingConfig.doubleSidedDiscount || 0}
                onChange={e => setPricingConfig({...pricingConfig, doubleSidedDiscount: Number(e.target.value)})}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500"
              />
              <p className="text-xs text-slate-500 mt-2">Discount for double-sided printing (e.g., 0.1 = 10% discount on total pages).</p>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl font-medium bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-500/20"
              >
                Save Pricing Rules
              </button>
            </div>
          </form>
        ) : (
          <div className="rounded-2xl border border-slate-800/50 bg-slate-900/30 p-8 text-center text-slate-400">
            <p>Loading pricing configuration...</p>
          </div>
        )}
      </div>
    ) : null}

      <PodCatalogModal
        isOpen={isPodModalOpen}
        onClose={() => setIsPodModalOpen(false)}
        existingItem={editingPodItem}
        onSuccess={(newItem) => {
          setIsPodModalOpen(false);
          setPodItems(prev => {
            const exists = prev.find(p => p.$id === newItem.$id);
            if (exists) return prev.map(p => p.$id === newItem.$id ? newItem : p);
            return [newItem, ...prev];
          });
        }}
      />
    </div>
  );
}
