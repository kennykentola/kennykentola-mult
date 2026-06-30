'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../features/auth/AuthContext';
import { getMyOrders } from '../../features/printing/printingService';
import { PrintOrder, ORDER_STATUS_LABELS, SERVICE_TYPE_LABELS } from '../../features/printing/types';
import { Package, Clock, Printer, Plus, Download } from 'lucide-react';
import Link from 'next/link';

export default function PrintingDashboardPage() {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<PrintOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const { orders } = await getMyOrders();
        setOrders(orders);
      } catch (err) {
        console.error('Failed to load printing orders:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  if (!profile) return null;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-rose-500/10 via-pink-500/5 to-slate-950 p-8 lg:p-12 shadow-2xl">
        <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[140%] rounded-full bg-rose-500/10 blur-[100px] pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/5 px-3 py-1 text-xs font-semibold text-rose-300">
            Printing & Design Portal
          </span>
          <h1 className="mt-4 text-3xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Manage your{' '}
            <span className="bg-gradient-to-r from-rose-400 via-pink-300 to-orange-400 bg-clip-text text-transparent">
              Print Orders
            </span>
          </h1>
          <p className="mt-4 text-slate-400 text-sm lg:text-base leading-relaxed">
            Request document printing, graphic design, flyers, and ID cards. Once quoted, upload your payment receipt to begin production.
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Printer className="h-5 w-5 text-rose-400" />
          Recent Orders
        </h2>
        <Link href="/printing/new" className="flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 text-sm font-semibold transition-all shadow-lg shadow-rose-500/20">
          <Plus className="h-4 w-4" />
          New Order
        </Link>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-slate-900/50 rounded-2xl border border-white/5"></div>
          <div className="h-24 bg-slate-900/50 rounded-2xl border border-white/5"></div>
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusLabel = ORDER_STATUS_LABELS[order.status] || order.status;
            const serviceLabel = SERVICE_TYPE_LABELS[order.serviceType] || order.serviceType;
            
            return (
              <div key={order.$id} className="glass-panel border border-white/5 bg-slate-950/40 hover:bg-slate-900/40 rounded-2xl p-5 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                  <div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase border ${
                      order.status === 'ready'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : order.status === 'pending'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}>
                      {statusLabel}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1.5">{order.title}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-rose-400 block mb-1">
                      {order.price > 0 ? `NGN ${order.price.toLocaleString()}` : 'Pending Quote'}
                    </span>
                    {order.status === 'pending' && order.price > 0 && (
                      <Link href="/printing/payments/new" className="text-xs text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1 rounded-full inline-block">
                        Pay Now
                      </Link>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs mt-4 mb-2">
                  {order.paperSize && (
                    <div>
                      <span className="text-slate-500 block">Paper Size</span>
                      <span className="font-semibold text-slate-300 uppercase">{order.paperSize}</span>
                    </div>
                  )}
                  {order.colorMode && (
                    <div>
                      <span className="text-slate-500 block">Color Mode</span>
                      <span className="font-semibold text-slate-300 capitalize">{order.colorMode}</span>
                    </div>
                  )}
                  {order.sides && (
                    <div>
                      <span className="text-slate-500 block">Sides</span>
                      <span className="font-semibold text-slate-300 capitalize">{order.sides}</span>
                    </div>
                  )}
                  {order.deliveryMethod && (
                    <div>
                      <span className="text-slate-500 block">Delivery</span>
                      <span className="font-semibold text-slate-300 capitalize">{order.deliveryMethod}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 mt-4 pt-4 border-t border-white/5">
                  <span className="flex items-center gap-1">
                    <Package className="h-3.5 w-3.5" /> {serviceLabel} (x{order.quantity})
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {new Date(order.$createdAt).toLocaleDateString()}
                  </span>
                  {order.deliverableUrl && (
                    <a 
                      href={order.deliverableUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="ml-auto flex items-center gap-1 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 px-3 py-1 rounded-full font-bold transition-colors"
                    >
                      <Download className="h-3.5 w-3.5" /> Download Softcopy
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-950/30 p-12 text-center">
          <Printer className="mx-auto h-12 w-12 text-slate-700 mb-4" />
          <h3 className="text-lg font-bold text-white">No print orders yet</h3>
          <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
            Get started by creating a new order. We support document printing, graphic design, ID cards, and more.
          </p>
        </div>
      )}
    </div>
  );
}
