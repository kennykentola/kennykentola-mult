'use client';

import React, { useState } from 'react';
import { Navbar } from '../../../components/Navbar';
import { Footer } from '../../../components/Footer';
import { useRouter } from 'next/navigation';
import { PenTool, CheckCircle } from 'lucide-react';

export default function DesignRequestForm() {
  const router = useRouter();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    jobType: '',
    details: ''
  });
  const [file, setFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('email', formData.email);
      submitData.append('phone', formData.phone);
      submitData.append('jobType', formData.jobType);
      submitData.append('details', formData.details);
      
      if (file) {
        submitData.append('file', file);
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/contact/design-quote`, {
        method: 'POST',
        body: submitData
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Failed to submit request');
      }

      setIsSubmitted(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200">
      <Navbar />

      <main className="mx-auto max-w-3xl px-6 lg:px-12 pt-20 pb-32">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider mb-6">
            <PenTool className="w-4 h-4" />
            Start Your Project
          </div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-white mb-4">
            Request a <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-500">Design Quote</span>
          </h1>
          <p className="text-lg text-slate-400">
            Tell us about your project, and we'll get back to you with an estimate and timeline.
          </p>
        </div>

        {isSubmitted ? (
          <div className="bg-[#0A0A0A] border border-white/10 rounded-[2rem] p-8 md:p-12 text-center shadow-2xl">
            <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Request Received!</h2>
            <p className="text-slate-400 mb-8">
              Thank you for telling us about your project. Please register or login to monitor the progress of your job from your dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => router.push('/register')}
                className="h-12 px-8 flex items-center justify-center bg-rose-500 hover:bg-rose-400 text-black font-bold rounded-xl transition-colors"
              >
                Register Now
              </button>
              <button 
                onClick={() => router.push('/login')}
                className="h-12 px-8 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 transition-colors"
              >
                Log In
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-[#0A0A0A] border border-white/10 rounded-[2rem] p-8 md:p-12 shadow-2xl space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Full Name</label>
                <input 
                  type="text" 
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-rose-500/50 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Email Address</label>
                <input 
                  type="email" 
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-rose-500/50 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Phone Number</label>
                <input 
                  type="tel" 
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-rose-500/50 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Job Type</label>
                <select 
                  name="jobType"
                  required
                  value={formData.jobType}
                  onChange={handleChange}
                  className="w-full h-12 bg-[#0F0F0F] border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-rose-500/50 transition-colors appearance-none"
                >
                  <option value="" disabled>Select a job type...</option>
                  <option value="Flyers & Posters">Flyers & Posters</option>
                  <option value="Social Media Designs">Social Media Designs</option>
                  <option value="Logos & Brand Identity">Logos & Brand Identity</option>
                  <option value="Bulk Photocopying & Printing">Bulk Photocopying & Printing</option>
                  <option value="Banners & Signage">Banners & Signage</option>
                  <option value="Website Design">Website Design</option>
                  <option value="Motion Graphics">Motion Graphics</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Project Details</label>
              <textarea 
                name="details"
                required
                value={formData.details}
                onChange={handleChange}
                placeholder="Tell us more about what you need..."
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-rose-500/50 transition-colors resize-y"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Attach a File (PDF, Image, Doc - optional)</label>
              <input 
                type="file" 
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setFile(e.target.files[0]);
                  }
                }}
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-rose-500/50 transition-colors file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-rose-500/10 file:text-rose-400 hover:file:bg-rose-500/20"
              />
            </div>

            {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-rose-500 hover:bg-rose-400 text-black font-black rounded-xl transition-colors shadow-[0_0_30px_rgba(244,63,94,0.2)] hover:shadow-[0_0_50px_rgba(244,63,94,0.4)] mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}
