'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Navbar } from '../../../components/Navbar';
import { Footer } from '../../../components/Footer';
import { 
  ArrowLeft, Clock, Banknote, Gauge, Radio, Users, 
  MessageCircle, Play, Check, Briefcase, Calendar, Award, ArrowRight
} from 'lucide-react';

import { COURSES } from '../../../data/courses';

export default function CourseDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const course = COURSES.find(c => c.slug === slug) || COURSES[0];
  
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <div className="relative min-h-screen bg-[#050505] font-sans text-slate-200 selection:bg-indigo-500/30">
      <Navbar />

      {/* Cinematic Ambient Glows */}
      <div className="pointer-events-none absolute top-[10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/10 blur-[150px]" />
      <div className="pointer-events-none absolute top-[40%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/10 blur-[150px]" />

      <main className="mx-auto w-full max-w-[1280px] pt-24">
        
        {/* HERO SECTION */}
        <section className="px-4 py-12 md:px-6 lg:py-16">
          <Link href="/courses" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-white">
            <ArrowLeft className="w-4 h-4" />
            All courses
          </Link>
          
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-12 relative z-10">
            {/* Left Column */}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {course.category}
                </span>
                <span className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide bg-white/5 border border-white/10 text-slate-300">
                  {course.level}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <Radio className="w-3 h-3" />
                  Live cohort
                </span>
              </div>
              
              <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-[3.5rem]">
                {course.title}
              </h1>
              
              <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-400 md:text-lg">
                {course.description}
              </p>
              
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a href="https://wa.me/2348163571677" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 px-8 text-sm font-bold text-white shadow-[0_0_20px_-5px_rgba(16,185,129,0.5)] transition hover:opacity-90">
                  Enroll now
                </a>
                <a href="https://chat.whatsapp.com/EMXMN6IV8am4ysAKXtzzbz?s=cl&p=a&ilr=0" className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 text-sm font-semibold text-white transition hover:bg-white/10">
                  <Play className="w-4 h-4 text-cyan-400" fill="currentColor" />
                  Join a class
                </a>
              </div>
              
              <dl className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {[
                  { icon: Clock, label: 'Duration', value: course.duration },
                  { icon: Banknote, label: 'Price', value: course.price },
                  { icon: Gauge, label: 'Effort', value: course.effort },
                  { icon: Radio, label: 'Format', value: course.format },
                  { icon: Users, label: 'Cohort', value: course.cohortSize }
                ].map((item, i) => (
                  <div key={i} className="rounded-xl border border-white/5 bg-white/5 p-4 backdrop-blur-md">
                    <item.icon className="w-5 h-5 text-indigo-400 mb-2" />
                    <dt className="text-[11px] font-medium uppercase tracking-wider text-slate-500">{item.label}</dt>
                    <dd className="mt-1 text-sm font-semibold text-slate-200">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            
            {/* Right Column */}
            <div className="relative">
              <div className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-gradient-to-tr from-cyan-500/20 via-transparent to-indigo-500/20 blur-3xl" />
              
              <aside className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0A0A0A] shadow-2xl">
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/80 via-transparent to-transparent" />
                  <span className="absolute bottom-4 left-4 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide bg-indigo-500 text-white shadow-lg">
                    {course.category}
                  </span>
                </div>
                
                <div className="p-6 lg:p-8">
                  <p className="text-sm leading-relaxed text-slate-300">
                    Enrollment is handled personally via WhatsApp — no online checkout.
                  </p>
                  <a href="https://wa.me/2348163571677" className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] text-sm font-bold text-white transition hover:bg-[#128C7E] shadow-[0_4px_14px_0_rgba(37,211,102,0.39)]">
                    <MessageCircle className="w-5 h-5" />
                    Enroll via WhatsApp
                  </a>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* STICKY NAV */}
        <nav className="sticky top-[72px] z-40 border-y border-white/10 bg-[#050505]/80 backdrop-blur-md">
          <div className="mx-auto flex w-full max-w-[1280px] gap-2 overflow-x-auto px-4 md:px-6 no-scrollbar">
            {['Overview', 'Modules', 'Careers', 'Mentors'].map(tab => (
              <button 
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  document.getElementById(tab.toLowerCase())?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={`shrink-0 border-b-2 px-4 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab 
                    ? 'border-indigo-400 text-white' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </nav>

        {/* CONTENT SECTIONS */}
        <div className="py-12 md:py-20 space-y-24">
          
          {/* Overview */}
          <section id="overview" className="scroll-mt-36 px-4 md:px-6">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-400">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              What you'll learn
            </div>
            <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">Skills you'll walk away with</h2>
            
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6">
              {course.skills.map((skill, i) => (
                <div key={i} className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/5 px-6 py-5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400">
                    <Check className="w-5 h-5" />
                  </div>
                  <p className="text-base font-semibold text-slate-200">{skill}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Modules */}
          <section id="modules" className="scroll-mt-36 px-4 md:px-6">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-purple-400">
              <span className="h-2 w-2 rounded-full bg-purple-400" />
              Curriculum
            </div>
            <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">6 modules, built to ship</h2>
            <p className="mt-4 max-w-2xl text-lg text-slate-400">
              Every module pairs live teaching with a hands-on build, so you learn by making real things.
            </p>
            
            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:gap-6">
              {course.modules.map((module, i) => (
                <article key={i} className="rounded-3xl border border-white/10 bg-[#0A0A0A] p-6 lg:p-8 hover:border-white/20 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl font-extrabold text-white/5">0{i + 1}</span>
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-sm font-bold text-white">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-white">{module.title}</h3>
                  <ul className="mt-5 space-y-3">
                    {module.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-3 text-base text-slate-400">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          {/* Careers */}
          <section id="careers" className="scroll-mt-36 px-4 md:px-6 rounded-3xl bg-white/5 py-16">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Career outcomes
            </div>
            <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">Jobs you'll be ready for</h2>
            <p className="mt-4 max-w-2xl text-lg text-slate-400">
              This cohort is designed around real roles. Here's where graduates take their new skills.
            </p>
            
            <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {course.careers.map((career, i) => (
                <div key={i} className="flex flex-col items-start rounded-2xl border border-white/10 bg-[#0A0A0A] p-6 hover:bg-white/5 transition-colors">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <p className="mt-5 text-base font-bold text-white">{career}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Mentors */}
          <section id="mentors" className="scroll-mt-36 px-4 md:px-6">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-400">
              <span className="h-2 w-2 rounded-full bg-indigo-400" />
              Your instructor
            </div>
            
            <article className="mt-8 flex flex-col gap-8 rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-8 sm:flex-row sm:items-start lg:p-10">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[1.5rem] bg-[#0A0A0A] border border-white/10 shadow-xl overflow-hidden p-2">
                <img 
                  src="/8aa52611-294c-4f56-9132-f6a62f271095-Photoroom.png" 
                  alt="Kenny Kentola Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col items-start">
                <h3 className="text-2xl font-bold text-white md:text-3xl">Kenny Kentola Mentors</h3>
                <p className="mt-2 text-base font-semibold text-cyan-400">Industry Experts</p>
                <p className="mt-4 text-base leading-relaxed text-slate-400 md:text-lg">
                  Experienced professionals using advanced tools to build modern brands, software, and creative assets. Dedicated to bridging the gap between learning and real-world execution.
                </p>
                
                <div className="mt-8 flex flex-wrap gap-6 text-sm font-medium text-slate-300">
                  <span className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    Live weekly sessions
                  </span>
                  <span className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full">
                    <Award className="w-4 h-4 text-indigo-400" />
                    Verified certificate
                  </span>
                </div>
              </div>
            </article>
          </section>

          {/* CTA Footer Section */}
          <section className="px-4 md:px-6">
            <div className="relative overflow-hidden rounded-[2.5rem] p-10 text-center shadow-2xl md:p-16 border border-white/10">
              <div className="absolute inset-0 z-0">
                <img src="/8aa52611-294c-4f56-9132-f6a62f271095-Photoroom.png" alt="Background" className="w-full h-full object-cover opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-[#050505]/40" />
              </div>
              
              <div className="relative z-10 max-w-2xl mx-auto">
                <h2 className="text-3xl font-extrabold text-white sm:text-4xl md:text-5xl">Design Faster. Create Smarter.</h2>
                <p className="mt-6 text-lg text-slate-300">
                  Master modern workflows and become a more efficient, creative, and future-ready professional.
                </p>
                
                <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <a href="https://wa.me/2348163571677" className="inline-flex h-14 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 px-8 text-base font-bold text-white shadow-[0_0_20px_-5px_rgba(16,185,129,0.5)] transition hover:opacity-90">
                    <MessageCircle className="w-5 h-5" />
                    Enroll now
                  </a>
                  <a href="/contact" className="inline-flex h-14 w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-8 text-base font-semibold text-white backdrop-blur transition hover:bg-white/20">
                    Talk to us
                    <ArrowRight className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
