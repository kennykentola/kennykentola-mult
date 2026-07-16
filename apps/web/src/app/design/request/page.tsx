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
            <div className="flex flex-col gap-4 mt-4">
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-rose-500 hover:bg-rose-400 text-black font-black rounded-xl transition-colors shadow-[0_0_30px_rgba(244,63,94,0.2)] hover:shadow-[0_0_50px_rgba(244,63,94,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Submitting...' : 'Submit Request'}
              </button>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink-0 mx-4 text-slate-500 text-sm">Or send directly via</span>
                <div className="flex-grow border-t border-white/10"></div>
              </div>

              <a 
                href="https://wa.me/2348163571677"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-14 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-xl transition-colors shadow-[0_0_30px_rgba(37,211,102,0.1)] hover:shadow-[0_0_50px_rgba(37,211,102,0.3)]"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                </svg>
                Send Files on WhatsApp
              </a>
            </div>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}
