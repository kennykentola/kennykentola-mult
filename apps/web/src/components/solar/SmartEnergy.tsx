'use client';

import React from 'react';
import { Smartphone, Activity, Zap, ShieldAlert } from 'lucide-react';

export function SmartEnergy() {
  const features = [
    { icon: Smartphone, title: 'Mobile Integration', desc: 'Monitor your site from anywhere on iOS & Android.' },
    { icon: Activity, title: 'Live Telemetry', desc: 'Real-time charting of current draw and battery health.' },
    { icon: Zap, title: 'Consumption Reports', desc: 'Detailed weekly and monthly load profiling.' },
    { icon: ShieldAlert, title: 'Predictive Alerts', desc: 'AI-driven maintenance warnings before failures occur.' },
  ];

  return (
    <section className="py-24 bg-[#050505] border-t border-slate-900 overflow-hidden relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-full bg-emerald-900/10 blur-[150px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          <div className="order-2 lg:order-1 relative">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-2 shadow-2xl backdrop-blur-xl">
              <img 
                src="/images/solar/dashboard-mockup.jpg" 
                alt="Smart Energy Dashboard Mockup" 
                className="w-full rounded-2xl opacity-90 mix-blend-luminosity"
              />
              {/* Overlay elements simulating UI */}
              <div className="absolute bottom-10 -right-10 bg-slate-900 border border-slate-700 p-4 rounded-xl shadow-2xl hidden md:block">
                <div className="text-xs text-slate-400 mb-1">Battery Health</div>
                <div className="text-2xl font-black text-emerald-400">98.5%</div>
                <div className="w-full h-1 bg-slate-800 mt-2 rounded-full overflow-hidden">
                  <div className="w-[98.5%] h-full bg-emerald-500" />
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Smart Telemetry & Control</h2>
            <p className="text-slate-400 text-lg mb-10 leading-relaxed">
              Every installation comes with access to the Infinite Power Dashboard. 
              Monitor your grid in real-time, view historical consumption, and request maintenance instantly.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={i}>
                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-emerald-400" />
                    </div>
                    <h3 className="text-white font-bold mb-2">{f.title}</h3>
                    <p className="text-slate-400 text-sm">{f.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
