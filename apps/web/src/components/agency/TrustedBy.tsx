'use client';
import { Layers, Shield, Cpu, Database, Cloud, Zap } from 'lucide-react';

export function TrustedBy() {
  return (
    <section className="py-12 border-b border-white/5 bg-[#050505]">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-slate-500 mb-8">Trusted by innovative startups and enterprises</p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
          <div className="flex items-center gap-2 text-xl font-bold text-white"><Layers /> AlphaTech</div>
          <div className="flex items-center gap-2 text-xl font-bold text-white"><Shield /> SecureNet</div>
          <div className="flex items-center gap-2 text-xl font-bold text-white"><Cpu /> NexusAI</div>
          <div className="flex items-center gap-2 text-xl font-bold text-white"><Database /> DataFlow</div>
          <div className="flex items-center gap-2 text-xl font-bold text-white"><Cloud /> CloudScale</div>
          <div className="flex items-center gap-2 text-xl font-bold text-white"><Zap /> BoltEnergy</div>
        </div>
      </div>
    </section>
  );
}
