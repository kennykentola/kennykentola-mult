import React, { useState } from 'react';
import { X, Plus, Trash2, FileText, Loader2, Link as LinkIcon, Copy } from 'lucide-react';
import { generateInvoice } from '../../features/payments/paymentsService';

interface InvoiceGeneratorModalProps {
  onClose: () => void;
}

export default function InvoiceGeneratorModal({ onClose }: InvoiceGeneratorModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState([{ description: '', amount: 0 }]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState<{ url: string; invoiceNumber: string } | null>(null);

  const handleAddItem = () => {
    setItems([...items, { description: '', amount: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: 'description' | 'amount', value: string) => {
    const newItems = [...items];
    if (field === 'description') {
      newItems[index].description = value;
    } else {
      newItems[index].amount = parseFloat(value) || 0;
    }
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.amount || 0), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerEmail || items.some(i => !i.description || i.amount <= 0)) {
      setError('Please fill all required fields correctly.');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      const res = await generateInvoice({
        customerName,
        customerEmail,
        items,
        dueDate: dueDate || undefined
      });
      setSuccessData({ url: res.invoiceUrl, invoiceNumber: res.invoiceNumber });
    } catch (err: any) {
      setError(err.message || 'Failed to generate invoice.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (successData?.url) {
      navigator.clipboard.writeText(successData.url);
      alert('Invoice URL copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Generate Invoice</h2>
              <p className="text-sm text-slate-400 mt-0.5">Create a PDF invoice and share the link</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            aria-label="Close modal"
            title="Close modal"
            className="rounded-full p-2 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {successData ? (
            <div className="text-center py-8 space-y-6">
              <div className="h-20 w-20 mx-auto bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400">
                <FileText className="h-10 w-10" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Invoice Generated!</h3>
                <p className="text-slate-400 mt-2">Invoice {successData.invoiceNumber} is ready to be shared.</p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a 
                  href={successData.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-2 transition-colors w-full sm:w-auto justify-center"
                >
                  <LinkIcon className="h-4 w-4" /> Open PDF
                </a>
                <button
                  onClick={copyToClipboard}
                  className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold flex items-center gap-2 transition-colors w-full sm:w-auto justify-center border border-slate-700"
                >
                  <Copy className="h-4 w-4" /> Copy Link
                </button>
              </div>
              <button 
                onClick={() => {
                  setSuccessData(null);
                  setCustomerName('');
                  setCustomerEmail('');
                  setItems([{ description: '', amount: 0 }]);
                }}
                className="text-sm text-slate-400 hover:text-white mt-4 inline-block"
              >
                Create Another Invoice
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-300">Customer Name *</label>
                  <input
                    required
                    type="text"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50"
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-300">Customer Email *</label>
                  <input
                    required
                    type="email"
                    value={customerEmail}
                    onChange={e => setCustomerEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-300">Due Date (Optional)</label>
                <input
                  type="date"
                  title="Due Date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full md:w-1/2 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-300">Invoice Items *</label>
                  <button 
                    type="button" 
                    onClick={handleAddItem}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-indigo-500/10 px-2 py-1 rounded-md"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Item
                  </button>
                </div>
                
                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-3">
                      <input
                        required
                        type="text"
                        value={item.description}
                        onChange={e => handleItemChange(idx, 'description', e.target.value)}
                        placeholder="Description (e.g. Web Development)"
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500/50"
                      />
                      <div className="flex gap-2">
                        <div className="relative w-full sm:w-32">
                          <span className="absolute left-3 top-3.5 text-slate-500 text-sm">₦</span>
                          <input
                            required
                            type="number"
                            min="0"
                            value={item.amount || ''}
                            onChange={e => handleItemChange(idx, 'amount', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-7 pr-3 py-3 text-white text-sm focus:outline-none focus:border-indigo-500/50"
                            placeholder="0.00"
                          />
                        </div>
                        {items.length > 1 && (
                          <button
                            type="button"
                            aria-label="Remove Item"
                            title="Remove Item"
                            onClick={() => handleRemoveItem(idx)}
                            className="w-11 h-11 flex-shrink-0 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl flex items-center justify-center transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-right text-lg font-bold text-white pt-2 border-t border-slate-800">
                  Total: <span className="text-emerald-400">₦ {calculateTotal().toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                  Generate Invoice
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
