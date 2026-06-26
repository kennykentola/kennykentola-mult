'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createOrder } from '../../../features/printing/printingService';
import { ServiceType, PaperSize, ColorMode, Sides, DeliveryMethod } from '../../../features/printing/types';
import { ArrowLeft, UploadCloud, FileText, Loader2, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function NewPrintOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    serviceType: 'document' as ServiceType,
    quantity: 1,
    paperSize: 'A4' as PaperSize,
    colorMode: 'bw' as ColorMode,
    sides: 'single' as Sides,
    specialInstructions: '',
    deliveryMethod: 'pickup' as DeliveryMethod,
    pageCount: 0
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: (name === 'quantity' || name === 'pageCount') ? parseInt(value) || 0 : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await createOrder({
        ...formData,
        fileUrls: [] // We'll skip file upload for now to simplify
      });
      router.push('/printing');
    } catch (err: any) {
      setError(err.message || 'Failed to submit order.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/printing" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Orders
      </Link>

      <div className="rounded-3xl border border-white/5 bg-slate-950/40 p-8 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">New Print Order</h1>
            <p className="text-sm text-slate-400">Provide details for your printing or design request.</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-semibold text-slate-300">Project Title</label>
            <input
              id="title"
              required
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. FYP Thesis Document, Birthday Flyer"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="serviceType" className="text-sm font-semibold text-slate-300">Service Type</label>
              <select
                id="serviceType"
                title="Service Type"
                name="serviceType"
                value={formData.serviceType}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500 transition-all"
              >
                <option value="document">Document Printing</option>
                <option value="photocopy">Photocopying</option>
                <option value="graphic">Graphic Design</option>
                <option value="id_card">ID Card Production</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="quantity" className="text-sm font-semibold text-slate-300">Quantity / Copies</label>
              <input
                id="quantity"
                title="Quantity"
                placeholder="1"
                required
                type="number"
                min="1"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500 transition-all"
              />
            </div>

            {formData.serviceType === 'document' && (
              <div className="space-y-2">
                <label htmlFor="pageCount" className="text-sm font-semibold text-slate-300">Total Pages per Copy (Optional)</label>
                <input
                  id="pageCount"
                  title="Page Count"
                  placeholder="e.g. 50"
                  type="number"
                  min="0"
                  name="pageCount"
                  value={formData.pageCount || ''}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500 transition-all"
                />
                <p className="text-xs text-slate-500">
                  If left blank or for mixed colors, your order will be submitted for a manual price quote.
                </p>
              </div>
            )}

            {formData.serviceType !== 'graphic' && (
              <>
                <div className="space-y-2">
                  <label htmlFor="paperSize" className="text-sm font-semibold text-slate-300">Paper Size</label>
                  <select
                    id="paperSize"
                    title="Paper Size"
                    name="paperSize"
                    value={formData.paperSize}
                    onChange={handleChange}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500 transition-all"
                  >
                    <option value="A4">A4 (Standard)</option>
                    <option value="A3">A3 (Large Poster)</option>
                    <option value="A5">A5 (Flyer)</option>
                    <option value="Letter">US Letter</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="colorMode" className="text-sm font-semibold text-slate-300">Color Mode</label>
                  <select
                    id="colorMode"
                    title="Color Mode"
                    name="colorMode"
                    value={formData.colorMode}
                    onChange={handleChange}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500 transition-all"
                  >
                    <option value="bw">Black & White</option>
                    <option value="color">Full Color</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="sides" className="text-sm font-semibold text-slate-300">Print Sides</label>
                  <select
                    id="sides"
                    title="Print Sides"
                    name="sides"
                    value={formData.sides}
                    onChange={handleChange}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500 transition-all"
                  >
                    <option value="single">Single-Sided</option>
                    <option value="double">Double-Sided</option>
                  </select>
                </div>
              </>
            )}

            <div className="space-y-2">
              <label htmlFor="deliveryMethod" className="text-sm font-semibold text-slate-300">Delivery Method</label>
              <select
                id="deliveryMethod"
                title="Delivery Method"
                name="deliveryMethod"
                value={formData.deliveryMethod}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500 transition-all"
              >
                <option value="pickup">Pickup at Shop</option>
                <option value="delivery">Dispatch / Courier Delivery</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="specialInstructions" className="text-sm font-semibold text-slate-300">Special Instructions & Details</label>
            <textarea
              id="specialInstructions"
              name="specialInstructions"
              value={formData.specialInstructions}
              onChange={handleChange}
              rows={4}
              placeholder="Any binding requests, paper thickness (e.g. 300gsm), or specific design requirements..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
            />
          </div>

          <div className="border-t border-slate-800 pt-6 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white px-8 py-3 text-sm font-bold transition-all shadow-lg shadow-rose-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
              {loading ? 'Submitting...' : formData.pageCount > 0 ? 'Calculate Price & Submit' : 'Request Manual Quote'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
