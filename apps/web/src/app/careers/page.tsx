'use client';

import React, { useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { Briefcase, ArrowRight, CheckCircle2, Send, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const jobs = [
  {
    id: 'swe-1',
    title: 'Senior Full-Stack Engineer',
    department: 'Engineering',
    type: 'Full-time, Remote',
    description: 'Lead the development of our enterprise and educational platforms using Next.js, Node, and Appwrite.',
  },
  {
    id: 'tw-1',
    title: 'Technical Writer',
    department: 'Documentation',
    type: 'Contract, Remote',
    description: 'Create comprehensive UML diagrams, API docs, and academic literature reviews for complex systems.',
  },
  {
    id: 'am-1',
    title: 'Academic Mentor (CS)',
    department: 'Mentorship',
    type: 'Part-time, Remote',
    description: 'Guide final year Computer Science students through their thesis and capstone project implementations.',
  }
];

export default function CareersPage() {
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    portfolio: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return toast.error('Please select a role to apply for.');
    
    setIsSubmitting(true);
    const jobTitle = jobs.find(j => j.id === selectedJob)?.title || 'General Application';

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: `Job Application: ${jobTitle}`,
          message: `Portfolio/LinkedIn: ${formData.portfolio}\n\nCover Letter:\n${formData.message}`
        })
      });
      
      if (!response.ok) throw new Error('Failed to submit application');
      
      toast.success('Application submitted successfully! We will review your profile.');
      setFormData({ name: '', email: '', portfolio: '', message: '' });
      setSelectedJob(null);
    } catch (error) {
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#050505] font-sans text-slate-200">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 lg:px-12 pt-32 pb-24">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-20">
          <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 border border-amber-500/20">
            <Briefcase className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight">
            Build the Future <br/> of Tech & Education
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl">
            Join a remote-first team of elite engineers, writers, and mentors dedicated to pushing the boundaries of software and academic excellence.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-16">
          {/* Jobs List */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
              Open Positions
              <span className="bg-amber-500/20 text-amber-500 text-sm py-1 px-3 rounded-full">{jobs.length}</span>
            </h2>
            
            {jobs.map((job) => (
              <div 
                key={job.id} 
                onClick={() => setSelectedJob(job.id)}
                className={`group cursor-pointer p-6 rounded-2xl border transition-all duration-300 ${
                  selectedJob === job.id 
                  ? 'bg-amber-500/10 border-amber-500/50 scale-[1.02]' 
                  : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{job.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-slate-400">
                      <span>{job.department}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                      <span>{job.type}</span>
                    </div>
                  </div>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    selectedJob === job.id ? 'bg-amber-500 text-white' : 'bg-white/5 text-slate-400 group-hover:text-white group-hover:bg-white/10'
                  }`}>
                    {selectedJob === job.id ? <CheckCircle2 className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                  </div>
                </div>
                <p className="text-slate-300">{job.description}</p>
              </div>
            ))}
          </div>

          {/* Application Form */}
          <div className="lg:col-span-5">
            <div className="sticky top-32 bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-2">Apply Now</h2>
              <p className="text-slate-400 mb-8 text-sm">
                {selectedJob 
                  ? `Applying for: ${jobs.find(j => j.id === selectedJob)?.title}`
                  : 'Select a position from the left to begin your application.'
                }
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                  <input
                    id="name"
                    type="text"
                    required
                    disabled={!selectedJob}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    required
                    disabled={!selectedJob}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label htmlFor="portfolio" className="block text-sm font-medium text-slate-300 mb-2">LinkedIn / Portfolio URL</label>
                  <input
                    id="portfolio"
                    type="url"
                    required
                    disabled={!selectedJob}
                    placeholder="https://"
                    value={formData.portfolio}
                    onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">Cover Letter</label>
                  <textarea
                    id="message"
                    required
                    rows={4}
                    disabled={!selectedJob}
                    placeholder="Tell us why you're a great fit..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !selectedJob}
                  className="w-full mt-4 h-12 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  Submit Application
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
