'use client';

import React from 'react';
import { Check } from 'lucide-react';
import Link from 'next/link';

const plans = [
  {
    name: 'Basic SLA',
    target: 'Residential',
    price: '₦25,000',
    period: 'mo',
    color: 'border-slate-800',
    features: ['Bi-annual Inspection', 'Standard Telemetry', 'Panel Cleaning (1x/yr)', '9-5 Support'],
  },
  {
    name: 'Business SLA',
    target: 'Commercial',
    price: '₦85,000',
    period: 'mo',
    color: 'border-emerald-500/50',
    popular: true,
    features: ['Quarterly Inspection', 'Advanced Telemetry', 'Panel Cleaning (4x/yr)', 'Priority Support (24hr SLA)', 'Battery Rebalancing'],
  },
  {
    name: 'Enterprise SLA',
    target: 'Industrial',
    price: 'Custom',
    period: 'quote',
    color: 'border-slate-800',
    features: ['Monthly Inspection', 'Predictive AI Telemetry', 'Full Hardware Warranty', 'Emergency Dispatch (4hr SLA)', 'Dedicated Engineer'],
  }
];

export function MaintenancePlans() {
  return (
    <section className="py-24 bg-slate-950 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Service Level Agreements</h2>
          <p className="text-slate-400 text-lg">
            Ensure maximum uptime and prolong the lifespan of your infrastructure with our proactive maintenance plans.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <div key={i} className={`relative bg-slate-900/50 rounded-3xl p-8 border ${plan.color} ${plan.popular ? 'shadow-[0_0_30px_rgba(16,185,129,0.1)]' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Recommended
                </div>
              )}
              <div className="text-emerald-400 text-sm font-bold uppercase tracking-wider mb-2">{plan.target}</div>
              <h3 className="text-2xl font-bold text-white mb-4">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-black text-white">{plan.price}</span>
                <span className="text-slate-400">/{plan.period}</span>
              </div>
              
              <Link href="#consultation" className={`w-full inline-flex justify-center items-center py-3 rounded-xl font-bold transition-colors mb-8 ${plan.popular ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950' : 'bg-slate-800 hover:bg-slate-700 text-white'}`}>
                Request Agreement
              </Link>

              <div className="space-y-4">
                {plan.features.map(f => (
                  <div key={f} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span className="text-slate-300 text-sm">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
