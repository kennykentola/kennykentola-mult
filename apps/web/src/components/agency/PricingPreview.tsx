'use client';
import { Check } from 'lucide-react';
import Link from 'next/link';

const plans = [
  {
    name: 'MVP Launch',
    price: 'Custom',
    desc: 'Perfect for startups needing to validate their idea fast.',
    features: ['UI/UX Wireframing', 'Core Features Implementation', 'Responsive Web App', 'Standard QA Testing', '1 Month Support'],
    popular: false
  },
  {
    name: 'Business Scaling',
    price: 'Custom',
    desc: 'For established businesses migrating or scaling operations.',
    features: ['High-Fidelity UI/UX', 'Web & Mobile App', 'Custom API Architecture', 'Advanced Security', '3 Months SLA Support'],
    popular: true
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    desc: 'Complex architectures, SaaS platforms, and AI integrations.',
    features: ['Dedicated Dev Team', 'Cloud DevOps Architecture', 'Microservices', 'AI/LLM Integration', '12 Months SLA Support'],
    popular: false
  }
];

export function PricingPreview() {
  return (
    <section id="pricing" className="py-24 bg-[#0A0A0A] border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-white mb-4">Transparent Software Pricing</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">Every project is unique. Submit a brief to get a tailored technical proposal and official quote.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, i) => (
            <div key={i} className={`relative p-8 rounded-3xl border ${plan.popular ? 'bg-indigo-900/10 border-indigo-500/50 shadow-[0_0_40px_-10px_rgba(99,102,241,0.2)]' : 'bg-white/[0.02] border-white/5'} flex flex-col`}>
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-full">
                  Most Requested
                </div>
              )}
              
              <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
              <p className="text-sm text-slate-400 mb-6">{plan.desc}</p>
              
              <div className="text-3xl font-extrabold text-white mb-8">{plan.price} <span className="text-base font-medium text-slate-500">Quote</span></div>
              
              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-300">
                    <Check className={`w-5 h-5 shrink-0 ${plan.popular ? 'text-indigo-400' : 'text-slate-500'}`} />
                    {feat}
                  </li>
                ))}
              </ul>
              
              <Link href="/agency/dashboard" className={`w-full py-4 text-center rounded-xl font-bold transition-all ${plan.popular ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-white/5 hover:bg-white/10 text-white'}`}>
                Request Custom Quote
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
