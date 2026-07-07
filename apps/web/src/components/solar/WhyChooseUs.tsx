'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export function WhyChooseUs() {
  const advantages = [
    'Certified Engineers',
    'Premium Equipment',
    '24/7 Monitoring',
    'Fast Deployment',
    'Warranty Protection',
    'Safety Standards',
    'Maintenance Contracts',
    'Nationwide Coverage',
  ];

  return (
    <section className="py-24 bg-slate-950 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[40%] h-[60%] rounded-full bg-emerald-900/10 blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          <div>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Why Choose Infinite Power</h2>
            <p className="text-slate-400 text-lg mb-10 leading-relaxed">
              We don’t just install solar panels; we engineer resilient power infrastructure. 
              Our enterprise-grade approach guarantees your facility stays powered through any grid failure.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              {advantages.map((adv, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="text-white font-medium">{adv}</span>
                </div>
              ))}
            </div>
            
            <Link href="#consultation" className="inline-flex justify-center items-center gap-2 border-2 border-emerald-500 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 px-8 py-3 rounded-xl font-bold transition-all">
              Speak to an Engineer
            </Link>
          </div>

          <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl aspect-[4/3]">
            <img 
              src="/images/solar/engineers.jpg" 
              alt="Engineers inspecting solar array" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
          </div>

        </div>
      </div>
    </section>
  );
}
