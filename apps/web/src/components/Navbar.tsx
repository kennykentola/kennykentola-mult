'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl flex h-20 items-center justify-between px-6 lg:px-12">
        {/* Logo */}
        <Link href="/" className="flex items-center group cursor-pointer" onClick={() => setIsOpen(false)}>
          <img 
            src="/logo.png" 
            alt="KennyKentola Logo" 
            className="h-10 md:h-12 w-auto object-contain transition-transform group-hover:scale-105 rounded-lg" 
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="#ecosystem" className="hover:text-white transition-colors">Ecosystem</a>
          <a href="#metrics" className="hover:text-white transition-colors">Scale</a>
          <Link href="/about" className="hover:text-white transition-colors">Manifesto</Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link href="/register" className="h-10 px-5 inline-flex items-center justify-center rounded-lg bg-white text-black text-sm font-semibold hover:bg-slate-200 transition-colors">
            Start Building
          </Link>
        </div>

        {/* Mobile Actions & Hamburger */}
        <div className="md:hidden flex items-center gap-3">
          <Link href="/register" className="h-9 px-4 inline-flex items-center justify-center rounded-lg bg-white text-black text-xs font-semibold hover:bg-slate-200 transition-colors">
            Start
          </Link>
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="text-slate-300 hover:text-white p-1"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-[#050505] border-b border-white/10 flex flex-col p-6 shadow-2xl animate-in slide-in-from-top-2">
          <a href="#ecosystem" onClick={() => setIsOpen(false)} className="py-4 text-lg font-medium text-slate-300 hover:text-white border-b border-white/5">
            Ecosystem
          </a>
          <a href="#metrics" onClick={() => setIsOpen(false)} className="py-4 text-lg font-medium text-slate-300 hover:text-white border-b border-white/5">
            Scale
          </a>
          <Link href="/about" onClick={() => setIsOpen(false)} className="py-4 text-lg font-medium text-slate-300 hover:text-white border-b border-white/5">
            Manifesto
          </Link>
          <Link href="/login" onClick={() => setIsOpen(false)} className="py-4 text-lg font-medium text-slate-300 hover:text-white border-b border-white/5">
            Sign In
          </Link>
          <Link href="/register" onClick={() => setIsOpen(false)} className="py-4 text-lg font-medium text-cyan-400 hover:text-cyan-300">
            Start Building
          </Link>
        </div>
      )}
    </header>
  );
}
