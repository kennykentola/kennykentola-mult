'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Send, Check } from 'lucide-react';

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Mocking API submission
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1500);
  };

  return (
    <div className="relative min-h-screen bg-slate-950 font-sans text-white">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[120px]" />
      <header className="sticky top-0 z-50 w-full border-b border-slate-900 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl flex h-16 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
              K
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              KennyKentola
            </span>
          </Link>
        </div>
      </header>
      
      <main className="relative mx-auto max-w-7xl px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">Contact Us</h1>
          <p className="mt-6 text-xl text-slate-400 max-w-2xl mx-auto">
            Have a question about our courses, need a project quote, or want to discuss a partnership? We'd love to hear from you.
          </p>
        </div>

        <div className="grid gap-12 md:grid-cols-2">
          {/* Contact Info */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Get in touch</h2>
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Email</h3>
                  <p className="text-slate-400 mt-1">support@kennykentola.com</p>
                  <p className="text-slate-400">hello@kennykentola.com</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Phone</h3>
                  <p className="text-slate-400 mt-1">+234 (0) 800 123 4567</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Office</h3>
                  <p className="text-slate-400 mt-1">Lagos, Nigeria</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-sm">
            {success ? (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-6">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
                <p className="text-slate-400">Thank you for reaching out. We will get back to you shortly.</p>
                <button onClick={() => setSuccess(false)} className="mt-8 text-indigo-400 hover:text-indigo-300">
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="text-xs font-semibold text-slate-400 block mb-1.5">First Name</label>
                    <input id="firstName" type="text" required className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500/50" />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="text-xs font-semibold text-slate-400 block mb-1.5">Last Name</label>
                    <input id="lastName" type="text" required className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500/50" />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="text-xs font-semibold text-slate-400 block mb-1.5">Email</label>
                  <input id="email" type="email" required className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500/50" />
                </div>
                <div>
                  <label htmlFor="subject" className="text-xs font-semibold text-slate-400 block mb-1.5">Subject</label>
                  <select id="subject" className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500/50">
                    <option>Academy & Courses</option>
                    <option>Agency Project Quote</option>
                    <option>Printing Services</option>
                    <option>Other Support</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="message" className="text-xs font-semibold text-slate-400 block mb-1.5">Message</label>
                  <textarea id="message" required rows={4} className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500/50 resize-none"></textarea>
                </div>
                <button disabled={loading} type="submit" className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:opacity-90 flex justify-center gap-2">
                  {loading ? 'Sending...' : 'Send Message'} <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
