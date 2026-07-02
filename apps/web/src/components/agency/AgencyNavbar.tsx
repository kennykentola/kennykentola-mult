'use client';
import Link from 'next/link';
import { Menu, X, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export function AgencyNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/agency" className="text-2xl font-extrabold tracking-tighter text-white">
          kennykentola<span className="text-indigo-500">.agency</span>
        </Link>
        <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link href="#services" className="hover:text-white transition-colors">Services</Link>
          <Link href="#portfolio" className="hover:text-white transition-colors">Portfolio</Link>
          <Link href="#process" className="hover:text-white transition-colors">Process</Link>
          <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="#case-studies" className="hover:text-white transition-colors">Case Studies</Link>
        </div>
        <div className="hidden lg:flex items-center gap-4">
          <Link href="/login" className="text-sm font-bold text-slate-300 hover:text-white transition-colors">
            Client Login
          </Link>
          <Link href="/agency/dashboard" className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-[0_0_15px_rgba(79,70,229,0.4)] transition-all">
            Start Your Project
          </Link>
        </div>
        <button className="lg:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
      {isOpen && (
        <div className="lg:hidden p-4 border-b border-white/5 bg-[#0A0A0A]">
          <div className="flex flex-col gap-4">
            <Link href="#services" onClick={() => setIsOpen(false)} className="text-white font-medium">Services</Link>
            <Link href="#portfolio" onClick={() => setIsOpen(false)} className="text-white font-medium">Portfolio</Link>
            <Link href="#pricing" onClick={() => setIsOpen(false)} className="text-white font-medium">Pricing</Link>
            <Link href="/login" onClick={() => setIsOpen(false)} className="text-indigo-400 font-bold">Client Login</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
