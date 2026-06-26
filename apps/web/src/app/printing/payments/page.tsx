'use client';

import React, { useState, useEffect } from 'react';
import { getMyOrders, uploadReceipt } from '../../../features/printing/printingService';
import { PrintOrder } from '../../../features/printing/types';
import { UploadCloud, CheckCircle, Loader2, CreditCard, Clock, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

export default function PrintingPaymentsPage() {
  const [orders, setOrders] = useState<PrintOrder[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selected order for payment
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [receiptUrl, setReceiptUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await getMyOrders();
      // Show orders that need payment (pending, manual quoted, or awaiting verification)
      const unpaidOrders = data.orders.filter(
        o => o.paymentStatus === 'pending' || o.paymentStatus === 'rejected' || o.paymentStatus === 'awaiting_verification'
      );
      setOrders(unpaidOrders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default');

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setReceiptUrl(data.secure_url);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload receipt. Please check your internet connection.');
    } finally {
      setIsUploading(false);
    }
  };

  const submitReceipt = async () => {
    if (!selectedOrderId || !receiptUrl) return;
    setIsSubmitting(true);
    try {
      await uploadReceipt(selectedOrderId, receiptUrl);
      alert('Receipt submitted successfully. We will verify it shortly.');
      setReceiptUrl('');
      setSelectedOrderId(null);
      fetchOrders(); // Refresh list
    } catch (err: any) {
      alert('Failed to submit receipt: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 lg:p-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Payments & Billing</h1>
          <p className="mt-2 text-slate-400">Pay for your print orders via local bank transfer.</p>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-3xl border border-white/5 bg-slate-900/30 p-12 text-center">
            <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">All Caught Up!</h3>
            <p className="text-slate-400">You have no pending payments.</p>
            <Link href="/printing/new" className="inline-block mt-6 px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-500 transition-colors">
              Start New Order
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Orders List */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">Unpaid Orders</h2>
              {orders.map(order => (
                <div 
                  key={order.$id} 
                  onClick={() => setSelectedOrderId(order.$id)}
                  className={`cursor-pointer rounded-2xl border p-5 transition-all ${
                    selectedOrderId === order.$id 
                      ? 'border-rose-500 bg-rose-500/10' 
                      : 'border-white/5 bg-slate-900 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-white">{order.title}</h3>
                    <span className="text-lg font-bold text-rose-400">
                      {order.price > 0 ? `₦${order.price.toLocaleString()}` : 'Pending Quote'}
                    </span>
                  </div>
                  <div className="text-sm text-slate-400 flex items-center gap-2">
                    <span className="capitalize">{order.serviceType}</span> &bull; 
                    <span className={order.paymentStatus === 'awaiting_verification' ? 'text-amber-400' : ''}>
                      {order.paymentStatus === 'awaiting_verification' ? 'Verifying Receipt...' : order.paymentStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Payment Panel */}
            {selectedOrderId && (
              <div className="rounded-3xl border border-white/5 bg-slate-900/50 p-6 space-y-6">
                {orders.find(o => o.$id === selectedOrderId)?.price === 0 ? (
                  <div className="text-center p-6 space-y-4">
                    <Clock className="h-12 w-12 text-amber-500 mx-auto" />
                    <h3 className="text-lg font-bold text-white">Pending Admin Quote</h3>
                    <p className="text-slate-400 text-sm">
                      This order is currently being reviewed by an admin. You will be able to pay once a final price is set.
                    </p>
                  </div>
                ) : (
                  <>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-rose-500" />
                        Bank Transfer Details
                      </h3>
                      <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-3">
                        <div className="flex justify-between border-b border-slate-800 pb-2">
                          <span className="text-slate-400">Bank Name</span>
                          <span className="font-bold text-white">UBA Bank Nigeria</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-800 pb-2">
                          <span className="text-slate-400">Account Name</span>
                          <span className="font-bold text-white">Ademola Peter Kehinde</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Account Number</span>
                          <span className="font-bold text-emerald-400 text-lg">2241496332</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-bold text-white text-sm">Upload Payment Receipt</h4>
                      
                      {!receiptUrl ? (
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:bg-slate-800/50 transition-colors">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {isUploading ? (
                              <Loader2 className="h-8 w-8 text-rose-500 animate-spin mb-2" />
                            ) : (
                              <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                            )}
                            <p className="mb-2 text-sm text-slate-400">
                              <span className="font-semibold text-rose-400">Click to upload</span> or drag and drop
                            </p>
                          </div>
                          <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileUpload} disabled={isUploading} />
                        </label>
                      ) : (
                        <div className="relative rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-center gap-4">
                          <div className="h-10 w-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-emerald-400" />
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium text-emerald-400 truncate">Receipt Uploaded Successfully</p>
                            <a href={receiptUrl} target="_blank" rel="noreferrer" className="text-xs text-slate-400 hover:text-white underline">View Receipt</a>
                          </div>
                          <button onClick={() => setReceiptUrl('')} className="text-xs text-rose-400 hover:underline">Change</button>
                        </div>
                      )}

                      <button
                        onClick={submitReceipt}
                        disabled={!receiptUrl || isSubmitting}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white py-3 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                        Submit for Verification
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
