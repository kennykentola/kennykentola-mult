'use client';

import React, { useState, useEffect, useRef } from 'react';
import { getMyOrders, getMessages, sendMessage } from '../../../features/printing/printingService';
import { PrintOrder, PrintMessage } from '../../../features/printing/types';
import { Loader2, Send, MessageSquare } from 'lucide-react';
import { useAuth } from '../../../lib/auth';

export default function PrintingMessagesPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<PrintOrder[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [messages, setMessages] = useState<PrintMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (selectedOrderId) {
      fetchMessages(selectedOrderId);
      const interval = setInterval(() => fetchMessages(selectedOrderId, true), 10000); // Polling every 10s
      return () => clearInterval(interval);
    }
  }, [selectedOrderId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchOrders = async () => {
    try {
      const data = await getMyOrders();
      setOrders(data.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (orderId: string, silent = false) => {
    if (!silent) setLoadingMessages(true);
    try {
      const msgs = await getMessages(orderId);
      setMessages(msgs);
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedOrderId) return;
    
    setIsSending(true);
    try {
      const msg = await sendMessage(selectedOrderId, newMessage);
      setMessages(prev => [...prev, msg]);
      setNewMessage('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 lg:p-10 h-[calc(100vh-80px)] flex flex-col">
      <div className="mx-auto max-w-5xl w-full flex-1 flex flex-col space-y-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Order Messages</h1>
          <p className="mt-2 text-slate-400">Chat with the admin about your printing orders.</p>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 min-h-0">
          {/* Order List */}
          <div className="md:col-span-1 rounded-3xl border border-white/5 bg-slate-900/30 overflow-y-auto flex flex-col">
            <div className="p-4 border-b border-white/5 font-bold text-white sticky top-0 bg-slate-900/90 backdrop-blur-md">
              Your Orders
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {orders.map(order => (
                <button
                  key={order.$id}
                  onClick={() => setSelectedOrderId(order.$id)}
                  className={`w-full text-left p-4 rounded-xl transition-colors ${
                    selectedOrderId === order.$id ? 'bg-rose-500/20 text-white' : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="font-semibold truncate">{order.title}</div>
                  <div className="text-xs text-slate-500 capitalize">{order.status}</div>
                </button>
              ))}
              {orders.length === 0 && (
                <div className="p-4 text-center text-slate-500 text-sm">No orders yet.</div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="md:col-span-2 rounded-3xl border border-white/5 bg-slate-900/50 flex flex-col overflow-hidden">
            {!selectedOrderId ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
                <p>Select an order to view messages</p>
              </div>
            ) : (
              <>
                <div className="p-4 border-b border-white/5 bg-slate-900/80 font-bold text-white flex justify-between items-center">
                  <span>Chat: {orders.find(o => o.$id === selectedOrderId)?.title}</span>
                  <span className="text-xs bg-slate-800 px-2 py-1 rounded-full text-slate-400">
                    {orders.find(o => o.$id === selectedOrderId)?.status}
                  </span>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {loadingMessages ? (
                    <div className="flex justify-center p-4">
                      <Loader2 className="h-6 w-6 animate-spin text-rose-500" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-slate-500 mt-10">No messages yet. Send a message to start!</div>
                  ) : (
                    messages.map(msg => {
                      const isMe = msg.senderId === user?.$id;
                      return (
                        <div key={msg.$id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          <div 
                            className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                              isMe ? 'bg-rose-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none'
                            }`}
                          >
                            <div className="text-xs opacity-50 mb-1 font-semibold">
                              {msg.senderRole === 'admin' ? 'Admin / Support' : 'You'}
                            </div>
                            {msg.message}
                          </div>
                          <span className="text-[10px] text-slate-500 mt-1">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSend} className="p-4 border-t border-white/5 bg-slate-900/80 flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                    disabled={isSending}
                  />
                  <button
                    type="submit"
                    disabled={isSending || !newMessage.trim()}
                    className="bg-rose-600 hover:bg-rose-500 text-white p-2 rounded-xl disabled:opacity-50 transition-colors"
                  >
                    {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
