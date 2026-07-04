'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '../../components/Navbar';
import { solarService } from '../../features/solar/solarService';
import toast from 'react-hot-toast';
import { Sun, Battery, Activity, ShieldCheck, MapPin, Calendar, FileText, ChevronRight, Loader2 } from 'lucide-react';

export default function SolarLandingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    jobType: 'installation',
    address: '',
    description: '',
    scheduledDate: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await solarService.requestJob(formData);
      toast.success('Request submitted successfully. Our engineering team will contact you shortly.');
      setFormData({ jobType: 'installation', address: '', description: '', scheduledDate: '' });
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 lg:px-12 pt-20 pb-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column - Pitch */}
          <div className="flex flex-col">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider w-max mb-6">
              <Sun className="w-4 h-4" />
              Infinite Power Infrastructure
            </div>
            <h1 className="text-5xl lg:text-7xl font-black tracking-tight text-white leading-[1.1] mb-6">
              Relentless Energy. <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
                Zero Downtime.
              </span>
            </h1>
            <p className="text-xl text-slate-400 mb-8 max-w-xl">
              We engineer, deploy, and maintain high-yield solar arrays and industrial-grade electrical infrastructure to keep your physical operations completely off the grid.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <Battery className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">High-Yield Storage</h3>
                  <p className="text-sm text-slate-400">Military-grade lithium battery arrays for 24/7 power.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                  <Activity className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">Smart Telemetry</h3>
                  <p className="text-sm text-slate-400">Real-time monitoring of your energy consumption.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Request Form */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent rounded-[2rem] blur-2xl pointer-events-none" />
            <div className="relative bg-[#0A0A0A] border border-white/10 rounded-[2rem] p-8 md:p-10 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-2">Deploy Infrastructure</h2>
              <p className="text-slate-400 text-sm mb-8">Request a technical consultation or maintenance SLA.</p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Service Type</label>
                  <select 
                    aria-label="Service Type"
                    required
                    value={formData.jobType}
                    onChange={e => setFormData({...formData, jobType: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none"
                  >
                    <option value="installation">New Solar Installation</option>
                    <option value="maintenance">SLA App / Infrastructure Maintenance</option>
                    <option value="wiring">Industrial Electrical Wiring</option>
                    <option value="bulk_request">Bulk Material Request</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Site Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input 
                      required
                      type="text"
                      placeholder="123 Tech Park, Lagos"
                      value={formData.address}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Desired Assessment Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input 
                      aria-label="Desired Assessment Date"
                      type="date"
                      value={formData.scheduledDate}
                      onChange={e => setFormData({...formData, scheduledDate: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 [color-scheme:dark]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Technical Requirements</label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-4 w-5 h-5 text-slate-500" />
                    <textarea 
                      required
                      rows={4}
                      placeholder="Describe your power requirements or maintenance needs..."
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-12 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      Initialize Request
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
