'use client';

import React, { useState } from 'react';
import {
  Printer,
  Upload,
  FileText,
  CreditCard as CardIcon,
  Clock,
  CheckCircle,
  AlertCircle,
  Package,
  Plus,
  ArrowRight,
  X
} from 'lucide-react';

type OrderStatus = 'pending' | 'processing' | 'ready' | 'delivered';
type ServiceType = 'document' | 'photocopy' | 'graphic' | 'id_card';

interface PrintOrder {
  id: string;
  title: string;
  type: ServiceType;
  status: OrderStatus;
  price: string;
  date: string;
  files: number;
}

const serviceCategories: { value: ServiceType; label: string; desc: string; icon: React.ReactNode }[] = [
  {
    value: 'document',
    label: 'Document Printing',
    desc: 'Assignments, Books, Research Papers, Invoices',
    icon: <FileText className="h-5 w-5" />
  },
  {
    value: 'photocopy',
    label: 'Photocopying',
    desc: 'Student Notes, Certificates, IDs',
    icon: <Package className="h-5 w-5" />
  },
  {
    value: 'graphic',
    label: 'Graphic Design',
    desc: 'Flyers, Posters, Banners, Social Media',
    icon: <Printer className="h-5 w-5" />
  },
  {
    value: 'id_card',
    label: 'ID Card Production',
    desc: 'Student, Staff & Organization IDs',
    icon: <CardIcon className="h-5 w-5" />
  }
];

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icon: <Clock className="h-3 w-3" /> },
  processing: { label: 'In Production', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', icon: <Printer className="h-3 w-3" /> },
  ready: { label: 'Ready', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: <CheckCircle className="h-3 w-3" /> },
  delivered: { label: 'Delivered', color: 'text-slate-400 bg-slate-500/10 border-slate-500/20', icon: <CheckCircle className="h-3 w-3" /> },
};

// Demo data — will be replaced by Appwrite queries
const demoOrders: PrintOrder[] = [
  { id: 'PO-001', title: 'Thesis Document', type: 'document', status: 'processing', price: '₦2,500', date: '2026-06-04', files: 3 },
  { id: 'PO-002', title: 'Conference Poster', type: 'graphic', status: 'ready', price: '₦8,000', date: '2026-06-03', files: 1 },
  { id: 'PO-003', title: 'Student ID Batch', type: 'id_card', status: 'pending', price: '₦15,000', date: '2026-06-05', files: 5 },
];

export default function PrintingPage() {
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Printer className="h-5 w-5 text-white" />
            </div>
            Print Orders
          </h1>
          <p className="text-slate-400 text-sm mt-1">Place and track your printing, design, and production orders.</p>
        </div>
        <button
          onClick={() => setShowNewOrder(!showNewOrder)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-500/20 hover:opacity-90 transition-opacity"
        >
          {showNewOrder ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showNewOrder ? 'Cancel' : 'New Order'}
        </button>
      </div>

      {/* New Order Panel */}
      {showNewOrder && (
        <div className="rounded-2xl border border-rose-500/20 bg-slate-900/50 backdrop-blur-sm p-6 space-y-6 animate-in slide-in-from-top-2 duration-300">
          <h2 className="text-lg font-bold text-white">Choose a Service</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {serviceCategories.map((svc) => (
              <button
                key={svc.value}
                onClick={() => setSelectedService(svc.value)}
                className={`text-left rounded-xl border p-4 transition-all duration-200 ${
                  selectedService === svc.value
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-sm shadow-rose-500/10'
                    : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                }`}
              >
                <div className="h-9 w-9 rounded-lg bg-slate-950/60 border border-white/5 flex items-center justify-center mb-3">
                  {svc.icon}
                </div>
                <h3 className="text-sm font-bold text-white">{svc.label}</h3>
                <p className="text-xs text-slate-500 mt-1">{svc.desc}</p>
              </button>
            ))}
          </div>

          {selectedService && (
            <div className="space-y-4 pt-4 border-t border-slate-800/50">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2" htmlFor="order-title">Order Title</label>
                <input
                  id="order-title"
                  type="text"
                  placeholder="e.g. Final Year Project Document"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2" htmlFor="order-notes">Special Instructions</label>
                <textarea
                  id="order-notes"
                  rows={3}
                  placeholder="Color preferences, paper size, binding type, quantity..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 outline-none transition-all resize-none"
                />
              </div>

              {/* File Upload Area */}
              <div className="border-2 border-dashed border-slate-800 hover:border-rose-500/30 rounded-xl p-8 text-center transition-colors cursor-pointer group">
                <Upload className="h-8 w-8 text-slate-600 group-hover:text-rose-400 mx-auto transition-colors" />
                <p className="text-sm text-slate-400 mt-3">
                  <span className="text-rose-400 font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-slate-600 mt-1">PDF, PNG, JPG, DOCX up to 50MB</p>
              </div>

              <div className="flex justify-end">
                <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-500/20 hover:opacity-90 transition-opacity">
                  Submit Order <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Total Orders', value: '3', icon: <FileText className="h-4 w-4" />, color: 'text-rose-400' },
          { label: 'In Progress', value: '1', icon: <Printer className="h-4 w-4" />, color: 'text-blue-400' },
          { label: 'Ready for Pickup', value: '1', icon: <CheckCircle className="h-4 w-4" />, color: 'text-emerald-400' },
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

      {/* Orders Table */}
      <div className="rounded-2xl border border-slate-800/50 bg-slate-900/30 backdrop-blur-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800/50">
          <h2 className="text-lg font-bold text-white">Order History</h2>
        </div>
        <div className="divide-y divide-slate-800/40">
          {demoOrders.map((order) => {
            const status = statusConfig[order.status];
            return (
              <div key={order.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 hover:bg-slate-800/10 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{order.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {order.id} · {serviceCategories.find(s => s.value === order.type)?.label} · {order.files} file{order.files > 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${status.color}`}>
                    {status.icon}
                    {status.label}
                  </span>
                  <span className="text-sm font-bold text-white">{order.price}</span>
                  <span className="text-xs text-slate-500 hidden md:block">{order.date}</span>
                </div>
              </div>
            );
          })}
        </div>
        {demoOrders.length === 0 && (
          <div className="py-16 text-center">
            <AlertCircle className="h-8 w-8 text-slate-700 mx-auto" />
            <p className="text-sm text-slate-500 mt-3">No print orders yet. Click &quot;New Order&quot; to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
