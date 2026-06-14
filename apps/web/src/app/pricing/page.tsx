import React from 'react';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';

export default function Pricing() {
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
      
      <main className="relative mx-auto max-w-7xl px-6 py-20">
        <div className="text-center">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">Simple, transparent pricing</h1>
          <p className="mt-6 text-xl text-slate-400 max-w-2xl mx-auto">
            Choose the perfect plan for your learning journey or agency project needs.
          </p>
        </div>

        <div className="mt-20 grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          {/* Basic Plan */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/30 p-8 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-slate-300">Pay Per Course</h3>
            <div className="mt-4 flex items-baseline text-5xl font-extrabold">
              ₦15,000
              <span className="ml-1 text-xl font-medium text-slate-500">/avg</span>
            </div>
            <p className="mt-4 text-sm text-slate-400">Great for specific skill building.</p>
            <ul className="mt-8 space-y-4 text-sm text-slate-300">
              <li className="flex gap-3"><Check className="h-5 w-5 text-indigo-400 shrink-0" /> Lifetime access to purchased courses</li>
              <li className="flex gap-3"><Check className="h-5 w-5 text-indigo-400 shrink-0" /> Standard community access</li>
              <li className="flex gap-3"><Check className="h-5 w-5 text-indigo-400 shrink-0" /> Certificate of completion</li>
            </ul>
            <Link href="/register" className="mt-8 block w-full rounded-xl border border-slate-700 bg-slate-800 px-6 py-3 text-center text-sm font-semibold hover:bg-slate-700 transition-colors">
              Get Started
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="rounded-3xl border-2 border-indigo-500 bg-slate-900 p-8 shadow-2xl shadow-indigo-500/20 relative scale-105">
            <div className="absolute -top-4 left-0 right-0 flex justify-center">
              <span className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-1 text-xs font-semibold text-white">Most Popular</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Bootcamp Student</h3>
            <div className="mt-4 flex items-baseline text-5xl font-extrabold">
              ₦150,000
              <span className="ml-1 text-xl font-medium text-slate-500">/cohort</span>
            </div>
            <p className="mt-4 text-sm text-slate-400">Intensive learning with direct mentorship.</p>
            <ul className="mt-8 space-y-4 text-sm text-slate-300">
              <li className="flex gap-3"><Check className="h-5 w-5 text-indigo-400 shrink-0" /> Full curriculum access</li>
              <li className="flex gap-3"><Check className="h-5 w-5 text-indigo-400 shrink-0" /> Weekly live mentoring sessions</li>
              <li className="flex gap-3"><Check className="h-5 w-5 text-indigo-400 shrink-0" /> Project reviews & grading</li>
              <li className="flex gap-3"><Check className="h-5 w-5 text-indigo-400 shrink-0" /> Career support & resume building</li>
            </ul>
            <Link href="/register" className="mt-8 block w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:opacity-90 transition-opacity">
              Apply to Bootcamp
            </Link>
          </div>

          {/* Agency Plan */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/30 p-8 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-slate-300">Custom Agency Project</h3>
            <div className="mt-4 flex items-baseline text-5xl font-extrabold">
              Custom
            </div>
            <p className="mt-4 text-sm text-slate-400">For startups and businesses needing dev power.</p>
            <ul className="mt-8 space-y-4 text-sm text-slate-300">
              <li className="flex gap-3"><Check className="h-5 w-5 text-indigo-400 shrink-0" /> Dedicated project manager</li>
              <li className="flex gap-3"><Check className="h-5 w-5 text-indigo-400 shrink-0" /> Full-stack development team</li>
              <li className="flex gap-3"><Check className="h-5 w-5 text-indigo-400 shrink-0" /> UI/UX Design</li>
              <li className="flex gap-3"><Check className="h-5 w-5 text-indigo-400 shrink-0" /> SLA & Maintenance options</li>
            </ul>
            <Link href="/register?portal=projects" className="mt-8 block w-full rounded-xl border border-slate-700 bg-slate-800 px-6 py-3 text-center text-sm font-semibold hover:bg-slate-700 transition-colors">
              Request Quote
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
