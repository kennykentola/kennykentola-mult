'use client';

import React from 'react';

const testimonials = [
  {
    quote: "Infinite Power completely transformed our manufacturing plant. We haven't experienced a single hour of downtime since the industrial array was commissioned.",
    name: "Oluwaseun Adebayo",
    role: "Operations Director, Manufacturing Hub",
    avatar: "/images/solar/avatar-1.jpg"
  },
  {
    quote: "Their engineering team is world-class. The telemetry dashboard gives us complete visibility over our corporate energy consumption.",
    name: "Ngozi Okafor",
    role: "Facilities Manager, Tech Campus",
    avatar: "/images/solar/avatar-2.jpg"
  },
  {
    quote: "From the initial energy audit to the final commissioning, the process was seamless. The SLA maintenance gives us incredible peace of mind.",
    name: "Ibrahim Musa",
    role: "Estate Developer",
    avatar: "/images/solar/avatar-3.jpg"
  }
];

export function Testimonials() {
  return (
    <section className="py-24 bg-[#050505] border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <h2 className="text-3xl md:text-5xl font-black text-white text-center mb-16">Trusted by Industry Leaders</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between">
              <p className="text-slate-300 text-lg leading-relaxed italic mb-8">"{t.quote}"</p>
              <div className="flex items-center gap-4">
                <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <div className="text-white font-bold">{t.name}</div>
                  <div className="text-slate-500 text-sm">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
