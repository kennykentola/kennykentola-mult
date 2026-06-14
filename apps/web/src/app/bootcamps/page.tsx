import React from 'react';
import Link from 'next/link';
import { ArrowRight, GraduationCap } from 'lucide-react';

export default function Bootcamps() {
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
          <div className="mx-auto h-16 w-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-6">
            <GraduationCap className="h-8 w-8" />
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">Intensive Bootcamps</h1>
          <p className="mt-6 text-xl text-slate-400 max-w-2xl mx-auto">
            Fast-track your tech career with our immersive, cohort-based bootcamps. Learn from industry experts and build real-world projects.
          </p>
        </div>

        <div className="mt-20 grid gap-8 md:grid-cols-2">
          {/* Bootcamp Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-sm">
            <span className="inline-flex rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300 mb-4">
              Next Cohort: July 2026
            </span>
            <h2 className="text-2xl font-bold">Full-Stack Web Engineering</h2>
            <p className="mt-4 text-slate-400 line-clamp-3">
              Master the MERN stack (MongoDB, Express, React, Node.js) and Next.js. Build production-ready applications, learn DevOps basics, and get career support.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-slate-300">
              <li>✓ 12 Weeks Intensive</li>
              <li>✓ 3 Real-world Projects</li>
              <li>✓ Career Support & Mock Interviews</li>
            </ul>
            <div className="mt-8">
              <Link href="/register" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90">
                Apply Now <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-sm">
            <span className="inline-flex rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300 mb-4">
              Next Cohort: August 2026
            </span>
            <h2 className="text-2xl font-bold">Mobile App Development</h2>
            <p className="mt-4 text-slate-400 line-clamp-3">
              Build cross-platform mobile apps using React Native and Expo. Understand mobile design patterns, state management, and app store deployment.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-slate-300">
              <li>✓ 10 Weeks Intensive</li>
              <li>✓ 2 Published Apps</li>
              <li>✓ Advanced State Management</li>
            </ul>
            <div className="mt-8">
              <Link href="/register" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90">
                Apply Now <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
