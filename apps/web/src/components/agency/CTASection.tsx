'use client';
import Link from 'next/link';

export function CTASection() {
  return (
    <section className="py-32 bg-[#050505] relative overflow-hidden border-t border-white/5">
      <div className="absolute inset-0 bg-indigo-900/10 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
        <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
          Ready to build something <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">extraordinary?</span>
        </h2>
        <p className="text-xl text-slate-400 mb-10">
          Whether you need a dedicated development team or a full-stack SaaS platform from scratch, we have the firepower to execute.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/agency/dashboard" className="px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-[0_0_30px_rgba(79,70,229,0.4)]">
            Start Your Project
          </Link>
          <Link href="/contact" className="w-full sm:w-auto px-8 py-4 rounded-xl border border-white/20 text-white font-bold hover:bg-white/10 transition-all text-center">
            Book Consultation
          </Link>
        </div>
      </div>
    </section>
  );
}
