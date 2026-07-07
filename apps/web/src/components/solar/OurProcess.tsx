'use client';

import React from 'react';

const steps = [
  { num: '01', title: 'Consultation', desc: 'Initial technical discovery.' },
  { num: '02', title: 'Site Inspection', desc: 'Engineer physical assessment.' },
  { num: '03', title: 'Energy Analysis', desc: 'Load profiling & system design.' },
  { num: '04', title: 'Proposal', desc: 'Detailed quote & ROI projection.' },
  { num: '05', title: 'Installation', desc: 'Deployment by certified teams.' },
  { num: '06', title: 'Commissioning', desc: 'Testing & grid integration.' },
  { num: '07', title: 'Maintenance', desc: 'Ongoing SLA & monitoring.' }
];

export function OurProcess() {
  return (
    <section className="py-24 bg-slate-950 border-t border-slate-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Deployment Process</h2>
          <p className="text-slate-400 text-lg">
            A rigorous, standardized workflow to ensure your infrastructure is deployed safely, on time, and on budget.
          </p>
        </div>

        <div className="relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-[45px] left-[5%] right-[5%] h-0.5 bg-slate-800" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-6 relative z-10">
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center relative group">
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-emerald-400 font-black mb-4 group-hover:scale-110 group-hover:border-emerald-500/50 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300">
                  {step.num}
                </div>
                <h3 className="text-white font-bold mb-2">{step.title}</h3>
                <p className="text-slate-400 text-xs">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
