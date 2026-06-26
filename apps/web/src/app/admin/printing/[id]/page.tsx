'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getOrder, updateOrderStatus, verifyPayment, getMessages, sendMessage } from '../../../../features/printing/printingService';
import { PrintOrder, PrintMessage } from '../../../../features/printing/types';
import { Loader2, ArrowLeft, FileText, CheckCircle, XCircle, CreditCard, Send, ExternalLink, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../../../lib/auth';

export default function AdminPrintOrderDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { user } = useAuth();
  
  const [order, setOrder] = useState<PrintOrder | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [messages, setMessages] = useState<PrintMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  const [manualPrice, setManualPrice] = useState('');
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    loadOrder();
    loadMessages();
    const interval = setInterval(loadMessages, 10000);
    return () => clearInterval(interval);
  }, [id]);

  const loadOrder = async () => {
    try {
      const data = await getOrder(id);
      setOrder(data);
    } catch (err) {
      console.error(err);
      alert('Failed to load order');
      router.push('/admin/printing');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      const msgs = await getMessages(id);
      setMessages(msgs);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdatePrice = async () => {
    if (!manualPrice) return;
    setIsUpdatingPrice(true);
    try {
      const updated = await updateOrderStatus(id, { price: Number(manualPrice) });
      setOrder(updated);
      alert('Price updated successfully');
    } catch (err: any) {
      alert('Failed to update price: ' + err.message);
    } finally {
      setIsUpdatingPrice(false);
    }
  };

  const handleVerifyPayment = async (status: 'paid' | 'rejected') => {
    setIsVerifying(true);
    try {
      const updated = await verifyPayment(id, status);
      setOrder(updated);
    } catch (err: any) {
      alert('Verification failed: ' + err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    try {
      const updated = await updateOrderStatus(id, { status });
      setOrder(updated);
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setIsSending(true);
    try {
      const msg = await sendMessage(id, newMessage);
      setMessages(prev => [...prev, msg]);
      setNewMessage('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  if (loading || !order) {
    return <div className="flex h-[50vh] justify-center items-center"><Loader2 className="animate-spin text-rose-500 h-8 w-8" /></div>;
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/admin/printing" className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Order {order.$id.slice(-6).toUpperCase()}</h1>
          <p className="text-sm text-slate-400">{order.title}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="rounded-2xl border border-white/5 bg-slate-900 p-6 space-y-6">
            <h2 className="text-lg font-bold text-white border-b border-white/5 pb-4">Order Specifications</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-xs text-slate-500 block">Service</span>
                <span className="font-semibold text-slate-200 capitalize">{order.serviceType}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Paper Size</span>
                <span className="font-semibold text-slate-200 uppercase">{order.paperSize}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Color Mode</span>
                <span className="font-semibold text-slate-200 uppercase">{order.colorMode}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Sides</span>
                <span className="font-semibold text-slate-200 capitalize">{order.sides}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Quantity</span>
                <span className="font-semibold text-slate-200">{order.quantity}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Page Count</span>
                <span className="font-semibold text-slate-200">{order.pageCount || 'Unknown'}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Delivery</span>
                <span className="font-semibold text-slate-200 capitalize">{order.deliveryMethod}</span>
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-500 block mb-1">Special Instructions</span>
              <p className="text-sm text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800">
                {order.specialInstructions || 'None'}
              </p>
            </div>

            <div>
              <span className="text-xs text-slate-500 block mb-2">Customer Files</span>
              {order.fileUrls && order.fileUrls.length > 0 ? (
                <div className="space-y-2">
                  {order.fileUrls.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 rounded-lg bg-slate-800 border border-slate-700 hover:border-rose-500 transition-colors">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-rose-400" />
                        <span className="text-sm text-white font-medium">Document {i + 1}</span>
                      </div>
                      <ExternalLink className="h-4 w-4 text-slate-400" />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No files uploaded.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-slate-900 flex flex-col h-[500px]">
            <div className="p-4 border-b border-white/5 font-bold text-white flex items-center justify-between">
              <span>Customer Chat</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/50">
              {messages.length === 0 ? (
                <div className="text-center text-slate-500 mt-4">No messages yet.</div>
              ) : (
                messages.map(msg => {
                  const isAdmin = msg.senderRole === 'admin';
                  return (
                    <div key={msg.$id} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[80%] px-4 py-2 rounded-2xl ${isAdmin ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none'}`}>
                        <div className="text-[10px] opacity-50 mb-1 font-bold uppercase">{isAdmin ? 'Admin' : 'Customer'}</div>
                        {msg.message}
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                    </div>
                  );
                })
              )}
            </div>
            <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 bg-slate-900 flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Message customer..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
              <button disabled={isSending || !newMessage.trim()} type="submit" title="Send Message" aria-label="Send Message" className="bg-indigo-600 text-white p-2 rounded-xl disabled:opacity-50">
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>

        </div>

        {/* Right Column - Actions */}
        <div className="space-y-6">
          
          {/* Status & Pricing */}
          <div className="rounded-2xl border border-white/5 bg-slate-900 p-6 space-y-4">
            <h2 className="text-lg font-bold text-white border-b border-white/5 pb-4">Status & Pricing</h2>
            
            <div className="space-y-2">
              <label className="text-xs text-slate-500">Order Status</label>
              <select 
                value={order.status}
                title="Order Status"
                onChange={(e) => handleUpdateStatus(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
              >
                <option value="pending">Pending</option>
                <option value="processing">In Production</option>
                <option value="ready">Ready for Pickup</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-800">
              <label className="text-xs text-slate-500">Total Price (₦)</label>
              {order.price > 0 ? (
                <div className="text-2xl font-bold text-emerald-400">₦{order.price.toLocaleString()}</div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      placeholder="Enter price..."
                      value={manualPrice}
                      onChange={(e) => setManualPrice(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white"
                    />
                    <button 
                      onClick={handleUpdatePrice}
                      disabled={isUpdatingPrice || !manualPrice}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-lg text-sm font-bold disabled:opacity-50"
                    >
                      Set Price
                    </button>
                  </div>
                  <p className="text-xs text-amber-500">Needs manual pricing before customer can pay.</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Verification */}
          <div className="rounded-2xl border border-white/5 bg-slate-900 p-6 space-y-4">
            <h2 className="text-lg font-bold text-white border-b border-white/5 pb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-indigo-400" /> Payment
            </h2>
            
            <div className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-sm text-slate-400">Status</span>
              <span className={`text-sm font-bold uppercase ${
                order.paymentStatus === 'paid' ? 'text-emerald-400' :
                order.paymentStatus === 'awaiting_verification' ? 'text-amber-400' :
                order.paymentStatus === 'rejected' ? 'text-rose-400' : 'text-slate-500'
              }`}>
                {order.paymentStatus.replace('_', ' ')}
              </span>
            </div>

            {order.paymentStatus === 'awaiting_verification' && order.receiptUrl && (
              <div className="space-y-4 pt-2">
                <a href={order.receiptUrl} target="_blank" rel="noreferrer" className="block relative aspect-[4/3] rounded-lg overflow-hidden border border-slate-700 hover:border-indigo-500 group">
                  <img src={order.receiptUrl} alt="Receipt" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-white font-bold text-sm">View Full Screen</span>
                  </div>
                </a>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleVerifyPayment('paid')}
                    disabled={isVerifying}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg text-sm font-bold flex justify-center items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" /> Approve
                  </button>
                  <button 
                    onClick={() => handleVerifyPayment('rejected')}
                    disabled={isVerifying}
                    className="flex-1 bg-rose-600 hover:bg-rose-500 text-white py-2 rounded-lg text-sm font-bold flex justify-center items-center gap-2"
                  >
                    <XCircle className="h-4 w-4" /> Reject
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
