import React from 'react';
import Link from 'next/link';
import { BookOpen, Code, Settings, Printer, GraduationCap, Sun, ArrowRight, Activity, Users, FileText, Zap, CheckCircle, Image as ImageIcon, Share2, PenTool, Contact, LayoutTemplate, CalendarDays, Monitor, Film, Lightbulb, Bot } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import FeaturedCourses from '../components/FeaturedCourses';

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] font-sans text-slate-200">
      {/* Cinematic Ambient Glows */}
      <div className="pointer-events-none absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[150px]" />
      <div className="pointer-events-none absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/10 blur-[150px]" />
      <div className="pointer-events-none absolute top-[40%] left-[30%] w-[30%] h-[30%] rounded-full bg-emerald-900/10 blur-[150px]" />

      <Navbar />

      <main className="mx-auto max-w-7xl px-6 lg:px-12 pt-24 pb-32">
        {/* HERO SECTION */}
        <div className="pt-12 pb-24 grid lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold tracking-wider uppercase text-slate-200">The Ultimate Execution Engine</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter text-white leading-[1.1] mb-6">
              Your Complete <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400">
                Business & Academic
              </span><br />
              Ecosystem.
            </h1>
            <p className="text-lg md:text-xl text-slate-400 leading-relaxed mb-8">
              Look no further! We offer quality and affordable services to meet your everyday office and academic needs. Whether you're a student, business owner, or professional, we've got you covered.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link href="/register" className="w-full sm:w-auto h-14 px-8 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-base font-semibold hover:opacity-90 transition-opacity shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)]">
                Start a Project
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/academy" className="w-full sm:w-auto h-14 px-8 inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white text-base font-medium hover:bg-white/10 transition-colors backdrop-blur-md">
                Explore the Academy
              </Link>
            </div>
          </div>
          
          {/* Hero Feature Grid */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-[2rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3" />
            <h2 className="text-2xl font-bold text-white mb-8 tracking-tight">Our Core Services</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-cyan-400 shrink-0" />
                <span className="text-slate-300 text-sm font-medium">Software Engineering</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-indigo-400 shrink-0" />
                <span className="text-slate-300 text-sm font-medium">Tech Academy & Mentorship</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-slate-300 text-sm font-medium">Solar & Inverter Installation</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-rose-400 shrink-0" />
                <span className="text-slate-300 text-sm font-medium">Graphic Design & Branding</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-amber-400 shrink-0" />
                <span className="text-slate-300 text-sm font-medium">CS Thesis & Implementations</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-pink-400 shrink-0" />
                <span className="text-slate-300 text-sm font-medium">Printing & Photocopying</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-teal-400 shrink-0" />
                <span className="text-slate-300 text-sm font-medium">CV & Document Formatting</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-blue-400 shrink-0" />
                <span className="text-slate-300 text-sm font-medium">Online Registrations & Typing</span>
              </div>
            </div>
            
            <div className="mt-10 pt-6 border-t border-white/10 flex flex-wrap gap-4">
              <span className="px-3 py-1 rounded-full bg-white/5 text-slate-400 text-xs font-semibold">✨ Fast service</span>
              <span className="px-3 py-1 rounded-full bg-white/5 text-slate-400 text-xs font-semibold">✨ Affordable prices</span>
              <span className="px-3 py-1 rounded-full bg-white/5 text-slate-400 text-xs font-semibold">✨ Neat & professional</span>
            </div>
          </div>
        </div>

        {/* NEW SERVICES HIGHLIGHT SECTION - Visual Match */}
        <div className="py-16 mb-12">
          
          {/* Top Tech Banner (Academy) */}
          <div className="relative rounded-3xl mb-16 border border-blue-900/50 shadow-[0_20px_50px_-12px_rgba(11,27,66,0.8)] overflow-hidden group">
            {/* Background Image Setup (matching ecosystem style) */}
            <div className="absolute inset-0 z-0">
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800" 
                alt="Tech Academy" 
                width="800" height="600" loading="lazy"
                className="w-full h-full object-cover opacity-30 mix-blend-luminosity group-hover:opacity-60 transition-opacity duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#0b1b42]/90 to-[#0b1b42]/80" />
            </div>

            <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
              
              <div className="md:w-1/2 z-10 mb-8 md:mb-0">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                    <GraduationCap className="w-7 h-7 text-[#0b1b42]" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-white tracking-widest uppercase">
                    Tech Academy & Mentorship
                  </h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-6 h-6 text-amber-400 shrink-0 mt-1" />
                    <p className="text-blue-100 text-lg leading-relaxed">
                      We train students to learn programming languages.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Zap className="w-6 h-6 text-amber-400 shrink-0 mt-1" />
                    <p className="text-blue-100 text-lg leading-relaxed">
                      We teach <strong className="text-white">AI Prompting</strong>, and we use AI to teach how to code a clean, fast, and light app.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="md:w-5/12 z-10">
                <p className="text-blue-200 font-bold text-sm tracking-widest uppercase mb-4 text-center md:text-left">Core Technologies</p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {['Python', 'HTML & CSS', 'React Js', 'Next Js', 'Nest Js', 'Appwrite', 'MongoDB'].map(tech => (
                    <span key={tech} className="px-4 py-2 bg-[#122454]/80 border border-[#1d3573] rounded-lg text-white font-semibold backdrop-blur-md">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Creative Design Services Grid */}
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-black text-indigo-400 tracking-widest uppercase flex items-center justify-center gap-4">
              <span className="h-px w-12 bg-indigo-500/50 hidden md:block"></span>
              Our Creative Design Services
              <span className="h-px w-12 bg-indigo-500/50 hidden md:block"></span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-white rounded-2xl p-6 text-center shadow-xl hover:-translate-y-2 transition-transform duration-300 group">
              <div className="w-16 h-16 mx-auto bg-[#0b1b42] group-hover:bg-indigo-600 transition-colors rounded-2xl flex items-center justify-center mb-4 text-white shadow-lg">
                <ImageIcon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-[#0b1b42] mb-2">Flyers & Posters</h3>
              <p className="text-slate-600 text-sm leading-relaxed">Eye-catching designs that deliver your message effectively.</p>
            </div>

            <div className="bg-white rounded-2xl p-6 text-center shadow-xl hover:-translate-y-2 transition-transform duration-300 group">
              <div className="w-16 h-16 mx-auto bg-[#0b1b42] group-hover:bg-indigo-600 transition-colors rounded-2xl flex items-center justify-center mb-4 text-white shadow-lg">
                <Share2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-[#0b1b42] mb-2">Social Media Designs</h3>
              <p className="text-slate-600 text-sm leading-relaxed">Engaging content that grows your brand and audience.</p>
            </div>

            <div className="bg-white rounded-2xl p-6 text-center shadow-xl hover:-translate-y-2 transition-transform duration-300 group">
              <div className="w-16 h-16 mx-auto bg-[#0b1b42] group-hover:bg-indigo-600 transition-colors rounded-2xl flex items-center justify-center mb-4 text-white shadow-lg">
                <PenTool className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-[#0b1b42] mb-2">Logos & Brand Identity</h3>
              <p className="text-slate-600 text-sm leading-relaxed">Unique identities that represent your brand professionally.</p>
            </div>

            <div className="bg-white rounded-2xl p-6 text-center shadow-xl hover:-translate-y-2 transition-transform duration-300 group">
              <div className="w-16 h-16 mx-auto bg-[#0b1b42] group-hover:bg-indigo-600 transition-colors rounded-2xl flex items-center justify-center mb-4 text-white shadow-lg">
                <Contact className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-[#0b1b42] mb-2">Business Cards</h3>
              <p className="text-slate-600 text-sm leading-relaxed">Professional cards that leave a lasting impression.</p>
            </div>

            <div className="bg-white rounded-2xl p-6 text-center shadow-xl hover:-translate-y-2 transition-transform duration-300 group">
              <div className="w-16 h-16 mx-auto bg-[#0b1b42] group-hover:bg-indigo-600 transition-colors rounded-2xl flex items-center justify-center mb-4 text-white shadow-lg">
                <LayoutTemplate className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-[#0b1b42] mb-2">Banners</h3>
              <p className="text-slate-600 text-sm leading-relaxed">Bold and attractive banners for any occasion.</p>
            </div>

            <div className="bg-white rounded-2xl p-6 text-center shadow-xl hover:-translate-y-2 transition-transform duration-300 group">
              <div className="w-16 h-16 mx-auto bg-[#0b1b42] group-hover:bg-indigo-600 transition-colors rounded-2xl flex items-center justify-center mb-4 text-white shadow-lg">
                <CalendarDays className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-[#0b1b42] mb-2">Event Graphics</h3>
              <p className="text-slate-600 text-sm leading-relaxed">Stunning visuals that make your events unforgettable.</p>
            </div>

            <div className="bg-white rounded-2xl p-6 text-center shadow-xl hover:-translate-y-2 transition-transform duration-300 group">
              <div className="w-16 h-16 mx-auto bg-[#0b1b42] group-hover:bg-indigo-600 transition-colors rounded-2xl flex items-center justify-center mb-4 text-white shadow-lg">
                <Monitor className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-[#0b1b42] mb-2">Website Design</h3>
              <p className="text-slate-600 text-sm leading-relaxed">Modern, responsive websites that convert visitors to customers.</p>
            </div>

            <div className="bg-white rounded-2xl p-6 text-center shadow-xl hover:-translate-y-2 transition-transform duration-300 group">
              <div className="w-16 h-16 mx-auto bg-[#0b1b42] group-hover:bg-indigo-600 transition-colors rounded-2xl flex items-center justify-center mb-4 text-white shadow-lg">
                <Film className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-[#0b1b42] mb-2">Motion Graphics</h3>
              <p className="text-slate-600 text-sm leading-relaxed">Dynamic animations that bring your ideas to life.</p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 text-center shadow-xl hover:-translate-y-2 transition-transform duration-300 group lg:col-span-2 lg:col-start-2 border-2 border-indigo-500/20">
              <div className="w-16 h-16 mx-auto bg-indigo-600 rounded-2xl flex items-center justify-center mb-4 text-white shadow-lg shadow-indigo-500/30">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-[#0b1b42] mb-2">Academic & Documentation</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">Assignment & Project writing, Project Printing, and detailed academic guidance.</p>
            </div>
          </div>
        </div>

        {/* FEATURED COURSES FROM ACADEMY */}
        <FeaturedCourses />

        {/* AI PROMPT ENGINEERING MASTERCLASS PROMO */}
        <div className="relative rounded-[2.5rem] mb-24 overflow-hidden border border-purple-500/30 group shadow-[0_0_80px_-15px_rgba(168,85,247,0.4)]">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800" 
              alt="AI Technology" 
              width="800" height="600" loading="lazy"
              className="w-full h-full object-cover opacity-20 mix-blend-screen group-hover:opacity-40 transition-opacity duration-700" 
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#0a0514] via-purple-900/60 to-[#050505]/95" />
          </div>

          <div className="relative z-10 p-10 md:p-16 flex flex-col lg:flex-row items-center gap-12">
            <div className="absolute top-0 right-0 w-96 h-96 bg-fuchsia-500/20 blur-[120px] rounded-full pointer-events-none" />
            
            <div className="lg:w-3/5">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/50 mb-6">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                </span>
                <span className="text-purple-300 text-xs font-black tracking-widest uppercase">Master The Future</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-6">
                Learn <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400">AI Prompt Engineering</span> Like A Master.
              </h2>
              
              <p className="text-purple-100/80 text-lg md:text-xl leading-relaxed mb-8 max-w-2xl font-medium">
                I don't just use AI; I orchestrate it. Let me teach you the exact frameworks, psychological prompts, and technical structures to make AI bend to your will. Whether it's coding, writing, or designing—become the master of the machine.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/academy" className="h-14 px-8 inline-flex items-center justify-center gap-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all shadow-lg shadow-purple-500/30 hover:scale-105">
                  <Bot className="w-5 h-5" />
                  Join The Masterclass
                </Link>
                <Link href="/ai-prompting" className="h-14 px-8 inline-flex items-center justify-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-colors backdrop-blur-sm">
                  View Curriculum
                </Link>
              </div>
            </div>

            <div className="lg:w-2/5 w-full">
              <div className="bg-[#050505]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-fuchsia-500" />
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                  <span className="text-slate-500 text-xs font-mono ml-2">system_prompt.txt</span>
                </div>
                <div className="font-mono text-sm space-y-4">
                  <p className="text-purple-400">System: <span className="text-slate-300">You are an elite AI Orchestrator...</span></p>
                  <p className="text-emerald-400">User: <span className="text-slate-300">Teach me how to control the LLM...</span></p>
                  <p className="text-blue-400">AI: <span className="text-slate-300 animate-pulse">Initializing Masterclass module...</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BENTO BOX ECOSYSTEM */}
        <div id="ecosystem" className="py-12 scroll-mt-24">
          <h2 className="text-3xl font-bold text-white mb-10 tracking-tight">The Infrastructure Ecosystem</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[340px]">
            
            {/* 1. Software Agency (Large, 2x2) */}
            <Link href="/agency" className="group relative overflow-hidden md:col-span-2 md:row-span-2 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-sm transition-all hover:border-cyan-500/50 hover:bg-white/[0.07]">
              <div className="absolute inset-0 z-0">
                <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800" alt="Code infrastructure" width="800" height="600" loading="lazy" className="w-full h-full object-cover opacity-40 mix-blend-luminosity group-hover:opacity-80 transition-opacity duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />
              </div>
              <div className="relative z-10 flex flex-col justify-end h-full p-8 md:p-10">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center mb-6">
                  <Code className="w-6 h-6 text-cyan-400" />
                </div>
                <div className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-4 w-max">
                  Enterprise-Grade Software
                </div>
                <h3 className="text-3xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors">Architecting Digital Dominance.</h3>
                <p className="text-slate-400 text-lg leading-relaxed">
                  We engineer scalable, high-performance applications designed to dominate your market. From robust full-stack Web Apps and Cross-platform Mobile Apps to complex SaaS platforms and enterprise backend systems. Built from the ground up to never fail.
                </p>
              </div>
            </Link>

            {/* 2. The Academy (Wide, 2x1) */}
            <Link href="/register?portal=academy" className="group relative overflow-hidden md:col-span-2 md:row-span-1 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-sm transition-all hover:border-violet-500/50 hover:bg-white/[0.07]">
              <div className="absolute inset-0 z-0">
                <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800" alt="Academy students" width="800" height="600" loading="lazy" className="w-full h-full object-cover opacity-40 mix-blend-luminosity group-hover:opacity-80 transition-opacity duration-700" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/90 to-transparent" />
              </div>
              <div className="relative z-10 flex flex-col justify-center h-full p-8 md:p-10 w-full md:w-3/4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-violet-400" />
                  </div>
                  <div className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold uppercase tracking-wider">
                    AI-Powered Mastery
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-violet-400 transition-colors">Forging AI-Augmented Engineers.</h3>
                <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                  Master React, Python, Data Structures, and modern frameworks with elite mentorship. We forge developers who command AI pair programming and LLM-assisted architecture from day one. Build systems 10x faster.
                </p>
              </div>
            </Link>

            {/* 3. Design & Printing (Square, 1x1) */}
            <Link href="/design" className="group relative overflow-hidden md:col-span-1 md:row-span-1 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-sm transition-all hover:border-rose-500/50 hover:bg-white/[0.07]">
              <div className="absolute inset-0 z-0">
                <img src="https://images.unsplash.com/photo-1562240020-ce31ccb0fa7d?auto=format&fit=crop&q=80&w=800" alt="Printing and design" width="800" height="600" loading="lazy" className="w-full h-full object-cover opacity-40 mix-blend-luminosity group-hover:opacity-80 transition-opacity duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/70 to-transparent" />
              </div>
              <div className="relative z-10 flex flex-col justify-end h-full p-6">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center mb-4">
                  <Printer className="w-5 h-5 text-rose-400" />
                </div>
                <div className="inline-block px-2 py-1 rounded bg-rose-500/10 text-rose-400 text-[10px] font-bold uppercase tracking-wider mb-2 w-max">
                  kennykentola-digital Designs
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-rose-400 transition-colors">Creative Hub &<br/>Physical Assets.</h3>
                <p className="text-slate-400 text-xs">Premium Logos, Web Design, High-end Graphic Printing, and Bulk Document Photocopying.</p>
              </div>
            </Link>

            {/* 4. CS Thesis (Square, 1x1) */}
            <Link href="/academic" className="group relative overflow-hidden md:col-span-1 md:row-span-1 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-sm transition-all hover:border-amber-500/50 hover:bg-white/[0.07]">
              <div className="absolute inset-0 z-0">
                <img src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800" alt="Thesis documents" width="800" height="600" loading="lazy" className="w-full h-full object-cover opacity-40 mix-blend-luminosity group-hover:opacity-80 transition-opacity duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/70 to-transparent" />
              </div>
              <div className="relative z-10 flex flex-col justify-end h-full p-6">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mb-4">
                  <GraduationCap className="w-5 h-5 text-amber-400" />
                </div>
                <div className="inline-block px-2 py-1 rounded bg-amber-500/10 text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-2 w-max">
                  Academic Excellence
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">CS Projects &<br/>Thesis Handover.</h3>
                <p className="text-slate-400 text-xs">Final year project documentation, thesis writing, and custom code implementation.</p>
              </div>
            </Link>

            {/* 5. Solar & Maintenance (Wide, 4x1) */}
            <Link href="/solar" className="group relative overflow-hidden md:col-span-4 md:row-span-1 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-sm transition-all hover:border-emerald-500/50 hover:bg-white/[0.07]">
              <div className="absolute inset-0 z-0">
                <img src="https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80&w=800" alt="Solar panels" width="800" height="600" loading="lazy" className="w-full h-full object-cover opacity-40 mix-blend-luminosity group-hover:opacity-80 transition-opacity duration-700" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/80 to-transparent" />
              </div>
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between h-full p-8 md:p-10">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                      <Sun className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                      Infinite Power
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">Relentless Energy & Maintenance.</h3>
                  <p className="text-slate-400 text-lg">
                    We deploy high-yield Solar Panels, Inverters, and handle Home Electrical Wiring to keep your physical operations off the grid. Plus, we offer SLA-backed App Maintenance to keep your software running flawlessly.
                  </p>
                </div>
                <div className="mt-6 md:mt-0">
                  <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </Link>

          </div>
        </div>

        {/* TRUST METRICS */}
        <div id="metrics" className="py-24 border-y border-white/5 mt-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 mb-4 rounded-xl bg-white/5 flex items-center justify-center text-white">
                <Users className="w-6 h-6" />
              </div>
              <div className="text-4xl md:text-5xl font-extrabold text-white mb-2">10k+</div>
              <div className="text-sm font-medium text-slate-400 uppercase tracking-widest">Students Forged</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 mb-4 rounded-xl bg-white/5 flex items-center justify-center text-white">
                <Activity className="w-6 h-6" />
              </div>
              <div className="text-4xl md:text-5xl font-extrabold text-white mb-2">99.9%</div>
              <div className="text-sm font-medium text-slate-400 uppercase tracking-widest">Software Uptime</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 mb-4 rounded-xl bg-white/5 flex items-center justify-center text-white">
                <FileText className="w-6 h-6" />
              </div>
              <div className="text-4xl md:text-5xl font-extrabold text-white mb-2">500k</div>
              <div className="text-sm font-medium text-slate-400 uppercase tracking-widest">Prints Delivered</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 mb-4 rounded-xl bg-white/5 flex items-center justify-center text-white">
                <Zap className="w-6 h-6" />
              </div>
              <div className="text-4xl md:text-5xl font-extrabold text-white mb-2">1.2MW</div>
              <div className="text-sm font-medium text-slate-400 uppercase tracking-widest">Solar Installed</div>
            </div>
          </div>
        </div>

        {/* UNIFIED CTA FOOTER */}
        <div className="py-32 flex flex-col items-center text-center">
          <h2 className="text-5xl font-extrabold text-white mb-6">Ready to execute?</h2>
          <p className="text-xl text-slate-400 max-w-2xl mb-10">
            Whether you need a full-stack application, an elite developer education, or an off-grid solar array—your timeline starts today.
          </p>
          <Link href="/register" className="h-16 px-10 inline-flex items-center justify-center rounded-xl bg-white text-black text-lg font-bold hover:bg-slate-200 hover:scale-105 transition-all shadow-[0_0_50px_-12px_rgba(255,255,255,0.4)]">
            Initialize Project
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
