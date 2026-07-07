'use client';

import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, UploadCloud, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { solarService } from '../../features/solar/solarService';

export function MultiStepForm() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '', companyName: '', email: '', phone: '',
    propertyType: 'commercial', serviceRequired: 'installation',
    monthlyEnergy: '', currentPowerSource: [] as string[],
    address: '', scheduledDate: '',
    budgetRange: '', timeline: '',
    additionalRequirements: ''
  });

  const update = (field: string, value: string) => setFormData(p => ({ ...p, [field]: value }));
  const next = () => setStep(s => Math.min(4, s + 1));
  const prev = () => setStep(s => Math.max(1, s - 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 4) {
      next();
      return;
    }

    try {
      setLoading(true);
      // We stringify the extended payload into description for backward compatibility in the DB if needed,
      // or the backend can capture the full JSON.
      await solarService.requestJob({
        jobType: formData.serviceRequired,
        address: formData.address,
        scheduledDate: formData.scheduledDate,
        description: `Company: ${formData.companyName}
Name: ${formData.fullName}
Email: ${formData.email}
Phone: ${formData.phone}
Property Type: ${formData.propertyType}
Monthly Energy: ${formData.monthlyEnergy}
Current Power: ${formData.currentPowerSource.join(', ')}
Budget: ${formData.budgetRange}
Timeline: ${formData.timeline}
Notes: ${formData.additionalRequirements}`
      });
      toast.success('Consultation request submitted! Our engineers will contact you shortly.');
      setStep(1);
      setFormData({
        fullName: '', companyName: '', email: '', phone: '',
        propertyType: 'commercial', serviceRequired: 'installation',
        monthlyEnergy: '', currentPowerSource: [],
        address: '', scheduledDate: '', budgetRange: '', timeline: '', additionalRequirements: ''
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="consultation" className="py-24 bg-slate-950 border-t border-slate-900 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] bg-gradient-to-b from-emerald-950/20 to-transparent pointer-events-none" />
      
      <div className="max-w-3xl mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">Request Technical Consultation</h2>
          <p className="text-slate-400">Complete this technical brief to help our engineers prepare a precise deployment strategy.</p>
        </div>

        <div className="bg-[#0A0A0A] border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {/* Progress Bar */}
          <div className="flex gap-2 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-emerald-500' : 'bg-slate-800'}`} />
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-xl font-bold text-white mb-6">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fullName" className="text-xs text-slate-400 block mb-1">Full Name *</label>
                    <input id="fullName" required type="text" value={formData.fullName} onChange={e => update('fullName', e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50" />
                  </div>
                  <div>
                    <label htmlFor="companyName" className="text-xs text-slate-400 block mb-1">Company Name</label>
                    <input id="companyName" type="text" value={formData.companyName} onChange={e => update('companyName', e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="text-xs text-slate-400 block mb-1">Email Address *</label>
                    <input id="email" required type="email" value={formData.email} onChange={e => update('email', e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50" />
                  </div>
                  <div>
                    <label htmlFor="phone" className="text-xs text-slate-400 block mb-1">Phone Number *</label>
                    <input id="phone" required type="tel" value={formData.phone} onChange={e => update('phone', e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50" />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-xl font-bold text-white mb-6">Property Details</h3>
                <div>
                  <label htmlFor="propertyType" className="text-xs text-slate-400 block mb-1">Property Type</label>
                  <select id="propertyType" value={formData.propertyType} onChange={e => update('propertyType', e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50">
                    <option value="commercial">Commercial Office</option>
                    <option value="industrial">Industrial / Manufacturing</option>
                    <option value="residential">Residential Estate</option>
                    <option value="government">Government Facility</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="serviceRequired" className="text-xs text-slate-400 block mb-1">Service Required</label>
                  <select id="serviceRequired" value={formData.serviceRequired} onChange={e => update('serviceRequired', e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50">
                    <option value="installation">New Solar Installation</option>
                    <option value="maintenance">SLA Maintenance</option>
                    <option value="wiring">Industrial Electrical Wiring</option>
                    <option value="hybrid">Hybrid Generator Integration</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="address" className="text-xs text-slate-400 block mb-1">Site Address *</label>
                  <input id="address" required type="text" value={formData.address} onChange={e => update('address', e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50" />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-xl font-bold text-white mb-6">Energy Requirements</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="monthlyEnergy" className="text-xs text-slate-400 block mb-1">Est. Monthly Energy Usage</label>
                    <input id="monthlyEnergy" type="text" placeholder="e.g. 5000 kWh or ₦500k/mo" value={formData.monthlyEnergy} onChange={e => update('monthlyEnergy', e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-2">Current Primary Power Source (Select all that apply)</label>
                    <div className="space-y-2">
                      {[
                        { label: 'National grid', value: 'grid' },
                        { label: 'Diesel Generators', value: 'diesel' },
                        { label: 'Grid + Generator', value: 'grid-generator' },
                        { label: 'Existing solar energy', value: 'solar' }
                      ].map(opt => (
                        <label key={opt.value} className="flex items-center gap-2 text-white cursor-pointer hover:text-emerald-400 transition-colors">
                          <input 
                            type="checkbox"
                            checked={formData.currentPowerSource.includes(opt.value)}
                            onChange={(e) => {
                              const curr = formData.currentPowerSource;
                              const updated = e.target.checked 
                                ? [...curr, opt.value] 
                                : curr.filter(v => v !== opt.value);
                              update('currentPowerSource', updated as any);
                            }}
                            className="w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500/50 bg-slate-900"
                          />
                          <span className="text-sm">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="budgetRange" className="text-xs text-slate-400 block mb-1">Budget Range</label>
                    <input id="budgetRange" type="text" placeholder="e.g. ₦10M - ₦20M" value={formData.budgetRange} onChange={e => update('budgetRange', e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50" />
                  </div>
                  <div>
                    <label htmlFor="timeline" className="text-xs text-slate-400 block mb-1">Project Timeline</label>
                    <select id="timeline" value={formData.timeline} onChange={e => update('timeline', e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50">
                      <option value="immediate">Immediate (ASAP)</option>
                      <option value="1-3-months">1-3 Months</option>
                      <option value="3-6-months">3-6 Months</option>
                      <option value="planning">Planning Phase</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-xl font-bold text-white mb-6">Final Details</h3>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Upload Site Photos / Electrical Drawings (Optional)</label>
                  <div className="w-full border-2 border-dashed border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-900 transition-colors cursor-pointer">
                    <UploadCloud className="w-8 h-8 mb-2" />
                    <span className="text-sm">Click to upload files</span>
                  </div>
                </div>
                <div>
                  <label htmlFor="scheduledDate" className="text-xs text-slate-400 block mb-1">Preferred Site Assessment Date</label>
                  <input id="scheduledDate" type="date" value={formData.scheduledDate} onChange={e => update('scheduledDate', e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 [color-scheme:dark]" />
                </div>
                <div>
                  <label htmlFor="additionalRequirements" className="text-xs text-slate-400 block mb-1">Additional Requirements</label>
                  <textarea id="additionalRequirements" rows={3} value={formData.additionalRequirements} onChange={e => update('additionalRequirements', e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 resize-none" />
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8 pt-8 border-t border-slate-800">
              <button 
                type="button" 
                onClick={prev}
                className={`flex items-center text-sm font-bold text-slate-400 hover:text-white transition-colors ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </button>
              
              <button 
                type="submit" 
                disabled={loading}
                className="flex items-center bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 px-6 py-3 rounded-xl text-sm font-bold transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {step === 4 ? 'Schedule Site Inspection' : 'Next Step'}
                {step < 4 && <ChevronRight className="w-4 h-4 ml-1" />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
