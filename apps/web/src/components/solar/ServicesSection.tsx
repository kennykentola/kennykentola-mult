'use client';

import React from 'react';
import { Sun, Battery, Cable, Factory, Activity, Zap, ShieldAlert, Car, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const services = [
  {
    title: 'Solar Installation',
    description: 'High-yield panels for residential & commercial properties.',
    icon: Sun,
    href: '/p/solar-installation',
  },
  {
    title: 'Battery Storage',
    description: 'Military-grade lithium battery arrays for 24/7 power.',
    icon: Battery,
    href: '/p/battery-storage',
  },
  {
    title: 'Electrical Wiring',
    description: 'Industrial-grade wiring for large-scale operations.',
    icon: Cable,
    href: '/p/electrical-wiring',
  },
  {
    title: 'Commercial Solutions',
    description: 'Full-scale energy solutions for offices & factories.',
    icon: Factory,
    href: '/p/commercial-energy',
  },
  {
    title: 'Smart Telemetry',
    description: 'Real-time monitoring of your energy consumption.',
    icon: Activity,
    href: '/p/smart-monitoring',
  },
  {
    title: 'Generator Integration',
    description: 'Seamless hybrid integration with diesel/gas generators.',
    icon: Zap,
    href: '/p/generator-integration',
  },
  {
    title: 'EV Charging',
    description: 'Fast-charging stations for corporate and home parking.',
    icon: Car,
    href: '/p/ev-charging',
  },
  {
    title: 'Emergency Repairs',
    description: '24/7 rapid response for critical electrical failures.',
    icon: ShieldAlert,
    href: '/p/emergency-repairs',
  },
];

export function ServicesSection() {
  return (
    <section className="py-24 bg-[#050505] relative border-t border-slate-900">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-emerald-950/20 to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Our Services</h2>
          <p className="text-slate-400 text-lg">
            We provide end-to-end energy solutions, from initial engineering design to lifelong maintenance. 
            Built for reliability and maximum efficiency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, i) => {
            const Icon = service.icon;
            return (
              <div key={i} className="group relative bg-slate-900/50 border border-slate-800 rounded-3xl p-8 hover:bg-slate-800/80 hover:border-emerald-500/30 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-7 h-7 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                  {service.description}
                </p>
                <Link href={service.href} className="inline-flex items-center text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors">
                  Learn More <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
