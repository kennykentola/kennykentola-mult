'use client';

import React, { useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ContactFormProps {
  topics: string[];
}

export default function ContactForm({ topics }: ContactFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    topic: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.email || !formData.topic || !formData.message) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          subject: formData.topic,
          message: formData.message
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to send message');
      }

      toast.success('Your message has been sent successfully!');
      setFormData({ firstName: '', lastName: '', email: '', topic: '', message: '' });
    } catch (error: any) {
      toast.error(error.message || 'An error occurred while sending your message.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Send a Message</h2>
      <form onSubmit={handleSubmit} className="rounded-3xl border border-white/5 bg-slate-900/30 p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">First Name *</label>
            <input 
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              type="text" 
              placeholder="John" 
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors" 
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">Last Name</label>
            <input 
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              type="text" 
              placeholder="Doe" 
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors" 
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1.5">Email Address *</label>
          <input 
            name="email"
            value={formData.email}
            onChange={handleChange}
            type="email" 
            placeholder="john@example.com" 
            className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors" 
          />
        </div>
        <div>
          <label htmlFor="contact-topic" className="text-xs font-semibold text-slate-400 block mb-1.5">Topic *</label>
          <select 
            name="topic"
            id="contact-topic"
            value={formData.topic}
            onChange={handleChange}
            className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
          >
            <option value="">Select a topic...</option>
            {topics.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1.5">Message *</label>
          <textarea 
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={5} 
            placeholder="Tell us how we can help..." 
            className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors resize-none" 
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 py-3 text-sm font-bold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>Send Message <ArrowRight className="h-4 w-4" /></>
          )}
        </button>
        <p className="text-xs text-slate-500 text-center">We typically reply within 24 hours directly to your email.</p>
      </form>
    </div>
  );
}
