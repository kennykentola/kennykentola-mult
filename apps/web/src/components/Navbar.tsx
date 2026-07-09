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
        <div className="flex-1 flex items-center justify-start">
          <Link href="/" className="flex items-center group cursor-pointer" onClick={() => setIsOpen(false)}>
            <img 
              src="/logo.png" 
              alt="KennyKentola Logo" 
              className="h-10 md:h-12 w-auto object-contain transition-transform group-hover:scale-105 rounded-lg" 
            />
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden xl:flex items-center gap-5 text-sm font-medium text-slate-400">
          <Link href="/academy" className="hover:text-white transition-colors">Academy</Link>
          <Link href="/academic" className="hover:text-white transition-colors">Academic Guidance</Link>
          <Link href="/agency" className="hover:text-white transition-colors">Software Development</Link>
          <Link href="/about" className="hover:text-white transition-colors">About Us</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link>
          <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
          <Link href="/solar" className="hover:text-white transition-colors">Solar / Electrical</Link>
          <Link href="/design" className="hover:text-white transition-colors">Printing & Graphics</Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex flex-1 items-center justify-end gap-4">
          <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link href="/register" className="h-10 px-5 inline-flex items-center justify-center rounded-lg bg-white text-black text-sm font-semibold hover:bg-slate-200 transition-colors">
            Start Building
          </Link>
        </div>

        {/* Mobile Actions & Hamburger */}
        <div className="md:hidden flex flex-1 items-center justify-end gap-3">
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
          <Link href="/academy" onClick={() => setIsOpen(false)} className="py-4 text-lg font-medium text-slate-300 hover:text-white border-b border-white/5">
            Academy
          </Link>
          <Link href="/academic" onClick={() => setIsOpen(false)} className="py-4 text-lg font-medium text-slate-300 hover:text-white border-b border-white/5">
            Academic Guidance
          </Link>
          <Link href="/agency" onClick={() => setIsOpen(false)} className="py-4 text-lg font-medium text-slate-300 hover:text-white border-b border-white/5">
            Software Development
          </Link>
          <Link href="/about" onClick={() => setIsOpen(false)} className="py-4 text-lg font-medium text-slate-300 hover:text-white border-b border-white/5">
            About Us
          </Link>
          <Link href="/contact" onClick={() => setIsOpen(false)} className="py-4 text-lg font-medium text-slate-300 hover:text-white border-b border-white/5">
            Contact Us
          </Link>
          <Link href="/blog" onClick={() => setIsOpen(false)} className="py-4 text-lg font-medium text-slate-300 hover:text-white border-b border-white/5">
            Blog
          </Link>
          <Link href="/solar" onClick={() => setIsOpen(false)} className="py-4 text-lg font-medium text-slate-300 hover:text-white border-b border-white/5">
            Solar / Electrical
          </Link>
          <Link href="/design" onClick={() => setIsOpen(false)} className="py-4 text-lg font-medium text-slate-300 hover:text-white border-b border-white/5">
            Printing & Graphics
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
