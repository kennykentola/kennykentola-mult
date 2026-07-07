'use client';

import React from 'react';
import { ShieldCheck, Award, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function HeroBanner() {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-24 pb-12 overflow-hidden">
      {/* Background Image / Gradient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-slate-950/80 z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent z-10" />
        <img 
          src="/images/solar/hero-bg.jpg" 
          alt="Industrial Solar Array" 
          className="w-full h-full object-cover object-center"
        />
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-6 lg:px-12 w-full">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6">
            <ShieldCheck className="w-4 h-4" />
            Infinite Power Infrastructure
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white leading-[1.1] mb-6">
            Relentless Energy. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
              Zero Downtime.
            </span>
          </h1>
          
          <p className="text-xl text-slate-400 mb-10 leading-relaxed max-w-2xl">
            Engineer-grade solar and electrical infrastructure for physical operations. We design, deploy, and maintain systems that keep your business completely off the grid.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <a href="#consultation" className="inline-flex justify-center items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-8 py-4 rounded-xl font-bold transition-colors">
              Get Free Site Assessment
            </a>
            <Link href="#projects" className="inline-flex justify-center items-center gap-2 border border-slate-700 hover:border-slate-500 bg-slate-900/50 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-bold transition-all">
              View Our Projects <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function TrustMetrics() {
  const metrics = [
    { label: 'Solar Projects', value: '500+' },
    { label: 'Happy Clients', value: '350+' },
    { label: 'MW Installed', value: '12MW+' },
    { label: 'Engineers', value: '25+' },
    { label: 'States Covered', value: '15' },
    { label: 'Years Exp.', value: '10+' },
  ];

  return (
    <div className="relative z-30 -mt-16 max-w-7xl mx-auto px-6 lg:px-12 mb-24">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metrics.map((m, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center shadow-xl">
            <div className="text-2xl font-black text-emerald-400 mb-1">{m.value}</div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
