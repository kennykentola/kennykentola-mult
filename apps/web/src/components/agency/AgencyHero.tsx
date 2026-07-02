'use client';
import Link from 'next/link';
import { ArrowRight, Play, ShieldCheck, Zap, Code } from 'lucide-react';

export function AgencyHero() {
  return (
    <section className="relative pt-40 pb-20 overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 mb-8 animate-in slide-in-from-bottom-4 duration-700">
          <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">Award-Winning Agency</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tighter leading-[1.1] mb-6 animate-in slide-in-from-bottom-6 duration-1000">
          Architecting Your <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400">
            Digital Dominance.
          </span>
        </h1>
        
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-in slide-in-from-bottom-8 duration-1000 delay-100">
          We engineer scalable enterprise software, mobile applications, and high-conversion SaaS platforms designed to accelerate your growth and dominate your market.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in slide-in-from-bottom-10 duration-1000 delay-200">
          <Link href="/agency/dashboard" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-black font-extrabold hover:bg-slate-200 hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
            Start Your Project <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="/calendly" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-white font-bold hover:bg-indigo-500/20 transition-all flex items-center justify-center gap-2">
            Book Free Consultation <Play className="w-4 h-4" />
          </Link>
        </div>

        <div className="mt-20 pt-10 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-6 text-slate-400 text-sm font-medium animate-in fade-in duration-1000 delay-300">
          <div className="flex items-center justify-center gap-2"><ShieldCheck className="w-5 h-5 text-emerald-400" /> Secure by Design</div>
          <div className="flex items-center justify-center gap-2"><Zap className="w-5 h-5 text-amber-400" /> Agile Delivery</div>
          <div className="flex items-center justify-center gap-2"><Code className="w-5 h-5 text-cyan-400" /> Clean Architecture</div>
          <div className="flex items-center justify-center gap-2"><span className="text-white font-bold">100+</span> Projects Shipped</div>
        </div>
      </div>
    </section>
  );
}
