'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { maintenanceService } from '../../../features/maintenance/maintenanceService';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewMaintenanceContractPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [serviceType, setServiceType] = useState('IT Support');
  const [frequency, setFrequency] = useState('monthly');
  const [startDate, setStartDate] = useState('');
  const [extraDetails, setExtraDetails] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startDate || !user) {
      alert('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      await maintenanceService.requestContract({
        title: extraDetails ? `${title} (Notes: ${extraDetails})` : title,
        serviceType,
        frequency,
        startDate: new Date(startDate).toISOString(),
      });

      alert('Contract request submitted! Our team will review and provide a pricing quote shortly.');
      router.push('/maintenance');

    } catch (err: any) {
      console.error('Failed to submit contract request:', err);
      alert('Error submitting request: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <Link href="/maintenance" className="text-sm text-slate-400 hover:text-amber-500 transition-colors flex items-center space-x-1 mb-4">
        <span>&larr;</span> <span>Back to Contracts</span>
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Request Maintenance Contract</h1>
        <p className="text-slate-400 mt-1 text-sm">Secure your IT infrastructure with our professional support agreements.</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel border border-slate-800 bg-slate-900/50 rounded-xl p-6 lg:p-10 space-y-8">
        
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-2">Contract Details</h2>
          
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium text-slate-400">Contract Title / Business Name <span className="text-rose-500">*</span></label>
            <input 
              id="title"
              required
              type="text" 
              placeholder="e.g., Main Office Network Support"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full p-3 bg-slate-950/50 border border-slate-800 rounded-lg text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="serviceType" className="text-sm font-medium text-slate-400">Service Type <span className="text-rose-500">*</span></label>
              <select 
                id="serviceType"
                title="Service Type"
                value={serviceType}
                onChange={e => setServiceType(e.target.value)}
                className="w-full p-3 bg-slate-950/50 border border-slate-800 rounded-lg text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
              >
                <option value="IT Support">IT Support</option>
                <option value="Network Management">Network Management</option>
                <option value="Software Maintenance">Software Maintenance</option>
                <option value="Hardware Servicing">Hardware Servicing</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="frequency" className="text-sm font-medium text-slate-400">Billing Frequency <span className="text-rose-500">*</span></label>
              <select 
                id="frequency"
                title="Billing Frequency"
                value={frequency}
                onChange={e => setFrequency(e.target.value)}
                className="w-full p-3 bg-slate-950/50 border border-slate-800 rounded-lg text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annual">Annually</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="startDate" className="text-sm font-medium text-slate-400">Desired Start Date <span className="text-rose-500">*</span></label>
            <input 
              id="startDate"
              title="Start Date"
              required
              type="date" 
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full p-3 bg-slate-950/50 border border-slate-800 rounded-lg text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all [color-scheme:dark]"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="extraDetails" className="text-sm font-medium text-slate-400">Additional Details (Optional)</label>
            <textarea 
              id="extraDetails"
              rows={4}
              placeholder="List specific hardware, number of endpoints, or special SLA requirements..."
              value={extraDetails}
              onChange={e => setExtraDetails(e.target.value)}
              className="w-full p-4 bg-slate-950/50 border border-slate-800 rounded-lg text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all resize-none"
            />
          </div>
        </section>

        <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
          <p className="text-sm text-amber-500/80 max-w-sm">
            Note: All new requests are submitted for quotation. Our team will contact you to finalize the contract amount.
          </p>
          <button 
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(217,119,6,0.3)] disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Request Quote'}
          </button>
        </div>

      </form>
    </div>
  );
}
