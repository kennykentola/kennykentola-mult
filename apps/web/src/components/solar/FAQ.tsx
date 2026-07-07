'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  { q: "How long does a commercial installation take?", a: "Deployment timelines vary based on system size. A standard 50kW commercial system typically takes 2-3 weeks from final design approval to commissioning." },
  { q: "What is the lifespan of the battery storage?", a: "We use premium Tier-1 Lithium Iron Phosphate (LiFePO4) batteries rated for 6,000+ deep cycles, offering a typical lifespan of 10-15 years with proper SLA maintenance." },
  { q: "Do you offer financing options for enterprise systems?", a: "Yes, we partner with major financial institutions to offer Power Purchase Agreements (PPAs) and lease-to-own financing models for large-scale deployments." },
  { q: "Can the system integrate with our existing diesel generators?", a: "Absolutely. We specialize in hybrid microgrid solutions that automatically switch between solar, grid, and diesel generators to optimize fuel costs and guarantee zero downtime." },
  { q: "What happens if a component fails?", a: "All enterprise SLA clients receive 24/7 telemetry monitoring. If a fault is detected, our engineers are dispatched immediately according to your SLA priority tier (as fast as 4 hours)." },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="py-24 bg-slate-950 border-t border-slate-900">
      <div className="max-w-4xl mx-auto px-6 lg:px-12">
        <h2 className="text-3xl md:text-5xl font-black text-white text-center mb-16">Frequently Asked Questions</h2>
        
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className={`border border-slate-800 rounded-2xl overflow-hidden transition-all ${open === i ? 'bg-slate-900' : 'bg-transparent hover:bg-slate-900/50'}`}>
              <button 
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="text-lg font-bold text-white pr-4">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-emerald-500 shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`} />
              </button>
              {open === i && (
                <div className="px-6 pb-6 text-slate-400 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
