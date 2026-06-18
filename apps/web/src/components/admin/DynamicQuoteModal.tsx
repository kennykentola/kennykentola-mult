'use client';

import React, { useState } from 'react';
import { client } from '@/lib/appwrite';
import { Databases } from 'appwrite';
import { X, Save } from 'lucide-react';

interface DynamicQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: any;
  collectionId: string;
  onUpdateSuccess: () => void;
}

export function DynamicQuoteModal({ isOpen, onClose, request, collectionId, onUpdateSuccess }: DynamicQuoteModalProps) {
  const [status, setStatus] = useState(request?.status || 'pending');
  // Determine the correct price field (price for student_projects, quotePrice for others)
  const priceField = request?.price !== undefined ? 'price' : 'quotePrice';
  const [price, setPrice] = useState(request?.[priceField] || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !request) return null;

  const handleUpdate = async () => {
    setIsSubmitting(true);
    try {
      const databases = new Databases(client);
      const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'multicompany';

      await databases.updateDocument(dbId, collectionId, request.$id, {
        status,
        [priceField]: parseFloat(price.toString())
      });

      onUpdateSuccess();
      onClose();
    } catch (err: any) {
      alert('Failed to update request: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to render dynamic fields that aren't core
  const renderDynamicFields = () => {
    const excludeKeys = ['$id', '$createdAt', '$updatedAt', '$permissions', '$databaseId', '$collectionId', 'status', 'price', 'quotePrice', 'clientId', 'userId', 'studentId'];
    return Object.entries(request).map(([key, value]) => {
      if (excludeKeys.includes(key)) return null;
      if (!value || (Array.isArray(value) && value.length === 0)) return null;

      let displayValue: any = value;
      if (typeof value === 'object' && !Array.isArray(value)) {
        displayValue = JSON.stringify(value);
      } else if (Array.isArray(value)) {
        // Handle image URLs or simple string arrays
        displayValue = value.map((v, i) => {
          if (typeof v === 'string' && v.startsWith('http')) {
            // eslint-disable-next-line @next/next/no-img-element
            return <img key={i} src={v} alt="Attachment" className="w-16 h-16 object-cover rounded mt-2 border border-border inline-block mr-2" />;
          }
          return <span key={i} className="px-2 py-1 bg-white/10 rounded mr-2 text-xs">{v}</span>;
        });
      }

      return (
        <div key={key} className="mb-4">
          <label className="text-xs font-semibold text-muted uppercase block mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
          <div className="text-sm text-primary-foreground bg-white/5 p-3 rounded-lg border border-border">
            {displayValue}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50">
          <div>
            <h2 className="text-xl font-bold text-white">Review Request</h2>
            <p className="text-xs text-muted mt-1 font-mono">ID: {request.$id}</p>
          </div>
          <button onClick={onClose} aria-label="Close review request" className="p-2 text-muted hover:text-white rounded-lg hover:bg-white/10 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body - Scrollable */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-bold text-white mb-4 border-b border-border pb-2">Client Details</h3>
              {renderDynamicFields()}
            </div>
            
            <div>
              <h3 className="text-sm font-bold text-white mb-4 border-b border-border pb-2">Admin Controls</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted block mb-1">Update Status</label>
                  <select 
                    title="Update Status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-primary outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="pending-quote">Pending Quote</option>
                    <option value="pending-proposal">Pending Proposal</option>
                    <option value="quoted">Quoted</option>
                    <option value="paid">Paid</option>
                    <option value="in-progress">In Progress</option>
                    <option value="printing">Printing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted block mb-1">Set Quote Price ($)</label>
                  <input 
                    type="number"
                    title="Set Quote Price"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-primary outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3 shrink-0">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-slate-700 text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleUpdate}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : (
              <>
                <Save className="h-4 w-4" /> Save Changes
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
