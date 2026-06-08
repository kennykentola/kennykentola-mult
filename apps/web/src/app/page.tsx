import React from 'react';
import Link from 'next/link';
import { BookOpen, Code, Settings, Printer, GraduationCap, Sun, ArrowRight } from 'lucide-react';
import { academyOverview } from '../features/academy/content';

export default function Home() {
  const portalLinks = [
    {
      title: 'Academy Portal',
      desc: 'Your student space for lessons, assignments, live classes, and progress tracking.',
      href: '/register?portal=academy',
      badge: 'Education First',
      accent: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300'
    },
    {
      title: 'Printing Portal',
      desc: 'Use this when you need documents, IDs, flyers, or book printing handled separately.',
      href: '/register?portal=printing',
      badge: 'Print Services',
      accent: 'border-rose-500/30 bg-rose-500/10 text-rose-300'
    },
    {
      title: 'Project / App Build Portal',
      desc: 'For project write-ups, software builds, and custom app development requests.',
      href: '/register?portal=projects',
      badge: 'Build Requests',
      accent: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300'
    }
  ];

  const services = [
    {
      title: academyOverview.title,
      desc: academyOverview.description,
      icon: BookOpen,
      color: 'from-violet-500/20 to-purple-500/20 border-purple-500/30 text-purple-400',
      link: '/student/dashboard/courses',
      linkLabel: 'Enter Academy'
    },
    {
      title: 'Software Development',
      desc: 'Get custom applications, MVP development, and web products engineered for your startups.',
      icon: Code,
      color: 'from-blue-500/20 to-cyan-500/20 border-cyan-500/30 text-cyan-400',
      link: '/projects',
      linkLabel: 'Start a Project'
    },
    {
      title: 'App Maintenance',
      desc: 'Secure SLA-backed support, bug fixing, and scaling support for your active legacy codebases.',
      icon: Settings,
      color: 'from-emerald-500/20 to-teal-500/20 border-teal-500/30 text-teal-400',
      link: '/projects',
      linkLabel: 'Request Support'
    },
    {
      title: 'CS Student Projects',
      desc: 'Struggling with computer science thesis work? Get premium proposals, document reviews, and code builders.',
      icon: GraduationCap,
      color: 'from-amber-500/20 to-orange-500/20 border-orange-500/30 text-orange-400',
      link: '/projects',
      linkLabel: 'Submit Project Brief'
    },
    {
      title: 'Printing Services',
      desc: 'Upload files and place print, photocopy, invoice creation, custom flyer, and ID card orders.',
      icon: Printer,
      color: 'from-rose-500/20 to-pink-500/20 border-pink-500/30 text-pink-400',
      link: '/printing',
      linkLabel: 'Place Print Order'
    },
    {
      title: 'Solar and Home Electrical',
      desc: 'Certified engineers for clean energy setup, solar panel installation, repairs, and home wiring.',
      icon: Sun,
      color: 'from-yellow-500/20 to-amber-600/20 border-yellow-500/30 text-yellow-400',
      link: '/projects',
      linkLabel: 'Request Installation'
    }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/10 blur-[120px]" />

      <header className="sticky top-0 z-50 w-full border-b border-slate-900 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
              K
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              KennyKentola
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#academy" className="hover:text-white transition-colors">Academy</a>
            <a href="#services" className="hover:text-white transition-colors">Services</a>
            <a href="#portfolio" className="hover:text-white transition-colors">Portfolio</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#blog" className="hover:text-white transition-colors">Blog</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-white transition-colors">
              Login
            </Link>
            <Link href="/register" className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:opacity-90 transition-opacity">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <section className="relative mx-auto max-w-7xl px-6 pt-20 pb-16 text-center lg:pt-32">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/5 px-4 py-1.5 text-xs font-semibold text-indigo-300 backdrop-blur-sm">
          One Unified Digital Platform
        </div>
        <h1 className="mt-8 text-5xl font-extrabold tracking-tight sm:text-7xl">
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Learn. </span>
          <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">Build. </span>
          <span className="bg-gradient-to-r from-rose-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">Print. </span>
          <span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-amber-500 bg-clip-text text-transparent">Power.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400 sm:text-xl leading-relaxed">
          One platform for computer science education, startup software engineering, professional document printing, and clean solar electricity.
        </p>

        <div className="mt-10 flex justify-center gap-4">
          <a href="#services" className="group rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 shadow-md hover:bg-slate-200 transition-colors flex items-center gap-2">
            Explore Services
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </a>
          <Link href="/register" className="rounded-full border border-slate-800 bg-slate-900/50 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm hover:bg-slate-900 transition-colors">
            Learn More
          </Link>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-3 text-left">
          {portalLinks.map((portal) => (
            <Link
              key={portal.title}
              href={portal.href}
              className={`group rounded-2xl border p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${portal.accent}`}
            >
              <span className="inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]">
                {portal.badge}
              </span>
              <h3 className="mt-4 text-lg font-bold text-white group-hover:text-white">
                {portal.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {portal.desc}
              </p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white">
                Open portal <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section id="services" className="mx-auto max-w-7xl px-6 py-20 scroll-mt-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">
            What We Deliver
          </h2>
          <p className="mt-4 text-slate-400 max-w-lg mx-auto text-sm sm:text-base">
            Providing software development, high-fidelity design, exam project builds, and residential solar installation setups.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div
                key={index}
                className={`group relative rounded-2xl border bg-gradient-to-br ${item.color} p-6 shadow-md hover:scale-[1.02] hover:shadow-lg transition-all duration-300 flex flex-col justify-between`}
              >
                <div>
                  <div className="h-12 w-12 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-center mb-6">
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                <a href={item.link} className="mt-8 flex items-center gap-1.5 text-sm font-semibold cursor-pointer group-hover:underline text-indigo-400">
                  {item.linkLabel} <ArrowRight className="h-3 w-3" />
                </a>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
