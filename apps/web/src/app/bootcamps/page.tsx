import React from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, Users, Code, Globe, Smartphone, Check } from 'lucide-react';

export const metadata = {
  title: 'Bootcamps — KennyKentola Academy',
  description: 'Intensive 3-month coding bootcamps in Frontend, Backend, Fullstack, and Mobile Development. Job-ready in months.',
};

const bootcamps = [
  {
    title: 'Frontend Development',
    subtitle: 'HTML · CSS · JavaScript · React',
    duration: '3 Months',
    price: '₦35,000',
    color: 'from-indigo-500/20 to-purple-500/20 border-purple-500/30',
    accent: 'text-indigo-400',
    icon: Globe,
    outcomes: [
      'Build responsive, pixel-perfect websites',
      'React component architecture',
      'API integration & state management',
      'Deploy live projects to Vercel/Netlify',
    ],
    badge: 'Beginner Friendly',
  },
  {
    title: 'Backend Development',
    subtitle: 'Node.js · Express · Databases · APIs',
    duration: '3 Months',
    price: '₦35,000',
    color: 'from-emerald-500/20 to-teal-500/20 border-teal-500/30',
    accent: 'text-emerald-400',
    icon: Code,
    outcomes: [
      'Build REST APIs from scratch',
      'Database design (PostgreSQL & MongoDB)',
      'Authentication, JWT & session management',
      'Deployment on Railway / Render',
    ],
    badge: 'Popular',
  },
  {
    title: 'Fullstack Development',
    subtitle: 'React · Node.js · TypeScript · Cloud',
    duration: '4 Months',
    price: '₦55,000',
    color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30',
    accent: 'text-cyan-400',
    icon: Code,
    outcomes: [
      'End-to-end web application development',
      'TypeScript & modern tooling',
      'Fullstack project portfolio',
      'Hiring support & CV review',
    ],
    badge: '⭐ Best Value',
  },
  {
    title: 'Mobile Development',
    subtitle: 'React Native · Expo · App Stores',
    duration: '3 Months',
    price: '₦40,000',
    color: 'from-rose-500/20 to-pink-500/20 border-rose-500/30',
    accent: 'text-rose-400',
    icon: Smartphone,
    outcomes: [
      'Build cross-platform iOS & Android apps',
      'React Native + Expo workflow',
      'State management & navigation',
      'Publish to Play Store & App Store',
    ],
    badge: 'In Demand',
  },
];

const included = [
  'Weekly live coaching sessions (Zoom)',
  'Dedicated instructor & peer community',
  'Real-world capstone project',
  'Graded assignments with feedback',
  'Job-ready certificate on graduation',
  'Alumni network & career support',
  'Recordings of all live sessions',
  'Priority instructor messaging',
];

export default function BootcampsPage() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-white font-sans">
      <div className="absolute top-0 left-0 w-[40%] h-[40%] rounded-full bg-indigo-900/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[30%] h-[30%] rounded-full bg-cyan-900/10 blur-[100px] pointer-events-none" />

      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl flex h-16 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center font-bold text-white">K</div>
            <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">KennyKentola</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </nav>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/login" className="text-slate-400 hover:text-white transition-colors">Login</Link>
            <Link href="/register?portal=academy" className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2 font-semibold text-white hover:opacity-90 transition-opacity">Apply Now</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/5 px-4 py-1.5 text-xs font-semibold text-indigo-300 mb-6">
          <Clock className="h-3 w-3" /> Intensive Bootcamps — Next Cohort Open
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
          Go from{' '}
          <span className="bg-gradient-to-r from-slate-400 to-slate-500 bg-clip-text text-transparent">Zero</span>
          {' '}to{' '}
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Job-Ready</span>
          {' '}in Months
        </h1>
        <p className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Our structured bootcamps combine live weekly coaching, real project work, and expert feedback to get you hired or freelancing in record time.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register?portal=academy" className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-3 font-semibold text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
            Apply for Next Cohort <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/contact" className="rounded-full border border-slate-700 px-8 py-3 font-semibold text-slate-300 hover:text-white hover:border-slate-500 transition-colors">
            Ask a Question
          </Link>
        </div>
      </section>

      {/* Bootcamp cards */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid sm:grid-cols-2 gap-6">
          {bootcamps.map((b) => {
            const Icon = b.icon;
            return (
              <div key={b.title} className={`rounded-3xl border bg-gradient-to-br ${b.color} p-8 flex flex-col`}>
                <div className="flex items-start justify-between mb-6">
                  <div className={`h-12 w-12 rounded-xl bg-slate-950/40 border border-white/5 flex items-center justify-center ${b.accent}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-[11px] font-bold rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300">{b.badge}</span>
                </div>
                <h3 className="text-xl font-bold text-white">{b.title}</h3>
                <p className="text-sm text-slate-400 mt-1">{b.subtitle}</p>

                <div className="flex items-center gap-4 mt-4 mb-6">
                  <div className="text-2xl font-black text-white">{b.price}</div>
                  <div className="text-xs text-slate-500 border-l border-slate-700 pl-4">
                    <Clock className="h-3 w-3 inline mr-1" />{b.duration}
                  </div>
                </div>

                <ul className="space-y-2 flex-1">
                  {b.outcomes.map(o => (
                    <li key={o} className="flex items-start gap-2 text-sm text-slate-300">
                      <Check className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" /> {o}
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/register?portal=academy&bootcamp=${encodeURIComponent(b.title)}`}
                  className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 py-3 text-sm font-bold text-white transition-colors"
                >
                  Apply for This Bootcamp <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* What's included */}
      <section className="mx-auto max-w-3xl px-6 pb-24">
        <h2 className="text-3xl font-bold text-center mb-10">Every Bootcamp Includes</h2>
        <div className="rounded-3xl border border-white/5 bg-slate-900/30 p-8 grid sm:grid-cols-2 gap-3">
          {included.map((item) => (
            <div key={item} className="flex items-start gap-3 text-sm text-slate-300">
              <Check className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" /> {item}
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Bootcamp Graduates', value: '100+' },
            { label: 'Cohorts Completed', value: '8' },
            { label: 'Job Placement Rate', value: '80%' },
            { label: 'Average Rating', value: '4.9 / 5' },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-2xl border border-white/5 bg-slate-900/30 p-6 text-center">
              <div className="text-3xl font-black text-white">{value}</div>
              <div className="text-xs text-slate-500 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-6 pb-24 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Change Your Career?</h2>
        <p className="text-slate-400 mb-8">Applications for the next cohort are now open. Spots are limited.</p>
        <Link href="/register?portal=academy" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-10 py-4 font-bold text-white hover:opacity-90 transition-opacity text-base">
          Apply Now — It's Free <ArrowRight className="h-5 w-5" />
        </Link>
      </section>
    </div>
  );
}
