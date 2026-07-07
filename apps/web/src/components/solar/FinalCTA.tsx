'use client';

import React from 'react';
import { ArrowRight, Phone } from 'lucide-react';
import Link from 'next/link';

export function FinalCTA() {
  return (
    <section className="py-32 bg-[#050505] relative overflow-hidden border-t border-slate-900">
      <div className="absolute inset-0 bg-[url('/images/solar/cta-bg.jpg')] bg-cover bg-center opacity-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-slate-950/80 to-[#050505]" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
          Power Your Future with Reliable Infrastructure
        </h2>
        <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
          Partner with certified engineers to design, install, and maintain energy systems that reduce costs, improve reliability, and support long-term growth.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="#consultation" className="inline-flex justify-center items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-8 py-4 rounded-xl font-bold transition-colors">
            Book Free Consultation <ArrowRight className="w-5 h-5" />
          </Link>
          <a href="tel:+2348163571677" className="inline-flex justify-center items-center gap-2 border border-slate-700 hover:border-slate-500 bg-slate-900/50 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-bold transition-all">
            <Phone className="w-5 h-5" /> Speak to an Engineer
          </a>
        </div>
      </div>
    </section>
  );
}
