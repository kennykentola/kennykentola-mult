import React from 'react';
import Link from 'next/link';

export default function About() {
  return (
    <div className="relative min-h-screen bg-slate-950 font-sans text-white">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[120px]" />
      <header className="sticky top-0 z-50 w-full border-b border-slate-900 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl flex h-16 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
              K
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              KennyKentola
            </span>
          </Link>
        </div>
      </header>
      
      <main className="relative mx-auto max-w-4xl px-6 py-20">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-8">About KennyKentola</h1>
        
        <div className="prose prose-invert prose-lg max-w-none text-slate-300">
          <p>
            KennyKentola Multi-Company is a unified digital platform dedicated to empowering the next generation of technologists and providing top-tier services to businesses and individuals.
          </p>
          
          <h2 className="text-2xl font-bold text-white mt-12 mb-4">Our Mission</h2>
          <p>
            To bridge the gap between education and industry by providing accessible, high-quality technical training while simultaneously delivering professional software, printing, and clean energy solutions.
          </p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4">What We Do</h2>
          <ul className="space-y-4">
            <li><strong>Academy Portal:</strong> Immersive learning experiences, courses, and bootcamps for aspiring developers.</li>
            <li><strong>Project Build Portal:</strong> Custom software development, MVP creation, and IT support for startups and students.</li>
            <li><strong>Printing Portal:</strong> High-quality, fast-turnaround document printing, ID cards, and custom design prints.</li>
            <li><strong>Clean Energy Setup:</strong> Solar and electrical installations for sustainable power solutions.</li>
          </ul>

          <div className="mt-16 p-8 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-center">
            <h3 className="text-xl font-bold text-white mb-4">Join our journey</h3>
            <p className="mb-6">Whether you want to learn to code or need a professional team to build your app, we're here for you.</p>
            <Link href="/register" className="inline-block rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90">
              Get Started Today
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
