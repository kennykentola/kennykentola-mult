'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchLearningPaths, LearningPath } from '../../features/academy/learningPathsApi';
import { Navbar } from '../../components/Navbar';
import { 
  ArrowRight, BookOpen, Code, Terminal, MonitorSmartphone, Brush, BrainCircuit, 
  CheckCircle, PlayCircle, Users, Trophy, Layout, Cpu, Database, Blocks, 
  Map, Sparkles, Server, Laptop, ChevronRight
} from 'lucide-react';

export default function AcademyPage() {
  const [paths, setPaths] = useState<LearningPath[]>([]);

  useEffect(() => {
    fetchLearningPaths().then(setPaths).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans selection:bg-indigo-500/30">
      <Navbar />

      {/* Global Glow Effects */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/10 blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/10 blur-[150px] pointer-events-none" />

      <main className="relative pt-32 pb-24 px-6 lg:px-12 max-w-7xl mx-auto overflow-hidden">
        
        {/* SECTION 1: HERO */}
        <section className="relative pt-12 pb-24 grid lg:grid-cols-2 gap-16 items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-semibold tracking-wider uppercase text-slate-300">kennykentola-digital Academy</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter text-white leading-[1.1] mb-6">
              Learn to Code. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-purple-400">
                Build Real Projects.
              </span> <br />
              Launch Your Career.
            </h1>
            
            <p className="text-lg md:text-xl text-slate-400 leading-relaxed mb-10">
              Master in-demand programming skills through interactive lessons, hands-on projects, expert mentorship, and AI-powered learning. Whether you're a complete beginner or an experienced developer, our platform helps you build practical skills that prepare you for real-world opportunities.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-10">
              <Link href="/register?portal=academy" className="w-full sm:w-auto h-14 px-8 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-base font-bold hover:opacity-90 transition-opacity shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)]">
                Start Learning Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="#paths" className="w-full sm:w-auto h-14 px-8 inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white text-base font-medium hover:bg-white/10 transition-colors backdrop-blur-md">
                Explore Learning Paths
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium text-slate-400">
              <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Beginner Friendly</span>
              <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Real-World Projects</span>
              <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> AI Learning Support</span>
              <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Learn Anywhere</span>
            </div>
          </div>

          <div className="relative rounded-3xl border border-white/10 bg-[#0A0A0A] p-2 overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-cyan-500/10" />
            <img 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80" 
              alt="Student coding on laptop" 
              className="w-full h-auto rounded-[1.25rem] object-cover mix-blend-luminosity opacity-80"
            />
            {/* Floating Elements overlay */}
            <div className="absolute top-8 left-8 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 animate-[bounce_4s_infinite]">
              <Code className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="absolute bottom-12 right-8 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 animate-[bounce_5s_infinite_reverse]">
              <BrainCircuit className="w-6 h-6 text-indigo-400" />
            </div>
          </div>
        </section>

        {/* SECTION 2: TRUSTED BY */}
        <section className="py-20 border-y border-white/5 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Join a Growing Community of Future Developers</h2>
          <p className="text-slate-400 max-w-2xl mx-auto mb-12">
            Designed for learners from universities, colleges, coding clubs, startups, and professionals worldwide.
          </p>
          


          <div className="mt-16 grid grid-cols-2 md:grid-cols-5 gap-4">
            {['Expert Instructors', 'Practical Learning', 'Interactive Coding', 'Career-Focused Curriculum', 'Supportive Community'].map((perk, i) => (
              <div key={i} className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                <span className="text-sm font-semibold text-slate-300 text-center">{perk}</span>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3: WHY CHOOSE US */}
        <section className="py-32 relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Everything You Need to Succeed</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              A meticulously designed learning ecosystem that guarantees results.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Map />, title: "Structured Learning", desc: "Follow clear learning paths from beginner to advanced." },
              { icon: <Terminal />, title: "Interactive Coding", desc: "Write and test code directly in your browser." },
              { icon: <Laptop />, title: "Real-World Projects", desc: "Build practical applications for your portfolio." },
              { icon: <BrainCircuit />, title: "AI Learning Assistant", desc: "Receive instant explanations. We use AI to also teach our students." },
              { icon: <Users />, title: "Expert Mentorship", desc: "Learn from experienced software developers." },
              { icon: <PlayCircle />, title: "Progress Tracking", desc: "Monitor your learning journey and achievements." },
              { icon: <MonitorSmartphone />, title: "Learn Anywhere", desc: "Study on desktop, tablet, or mobile seamlessly." },
              { icon: <Layout />, title: "Career-Focused", desc: "Learn technologies used by modern development teams." },
              { icon: <Database />, title: "Developer Community", desc: "Connect, collaborate, and grow with other learners." },
              { icon: <Trophy />, title: "Certificates", desc: "Earn certificates as you complete courses and learning paths." }
            ].map((feature, idx) => (
              <div key={idx} className="group p-8 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-indigo-500/30 transition-all">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <div className="text-indigo-400 w-6 h-6">{feature.icon}</div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4: FEATURED LEARNING PATHS */}
        <section id="paths" className="py-24 scroll-mt-24 border-t border-white/5">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Choose Your Learning Path</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {paths.map((path, idx) => {
              // Map icon name to the correct lucide-react component
              const Icon = {
                Layout, Server, Blocks, Code, MonitorSmartphone, Brush, BrainCircuit
              }[path.iconName as 'Layout'|'Server'|'Blocks'|'Code'|'MonitorSmartphone'|'Brush'|'BrainCircuit'] || Layout;
              
              // Map buttons text based on the old static array since they varied per path
              const buttonTextMap: Record<string, string> = {
                'frontend-engineering': 'Start Frontend',
                'backend-engineering': 'Explore Backend',
                'full-stack-development': 'Become Full Stack',
                'python-development': 'Learn Python',
                'mobile-app-development': 'Build Mobile Apps',
                'ui-ux-design': 'Start Designing',
                'ai-machine-learning': 'Explore AI'
              };

              return (
                <div key={idx} className={`relative overflow-hidden group p-8 rounded-3xl bg-[#0A0A0A] border border-white/10 transition-all ${path.borderColor}`}>
                  <div className={`absolute top-0 right-0 w-full h-full bg-gradient-to-bl ${path.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                      <Icon className={`w-6 h-6 ${
                        path.iconName === 'Layout' ? 'text-blue-400' :
                        path.iconName === 'Server' ? 'text-emerald-400' :
                        path.iconName === 'Blocks' ? 'text-purple-400' :
                        path.iconName === 'Code' ? 'text-yellow-400' :
                        path.iconName === 'MonitorSmartphone' ? 'text-cyan-400' :
                        path.iconName === 'Brush' ? 'text-pink-400' : 'text-indigo-400'
                      }`} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">{path.title}</h3>
                    <p className="text-slate-400 mb-8 flex-grow">{path.description}</p>
                    <Link href={`/academy/paths/${path.slug}`} className="inline-flex items-center gap-2 text-sm font-bold text-white w-max bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors">
                      {buttonTextMap[path.slug] || 'Explore Path'} <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 5: TECHNOLOGIES */}
        <section className="py-32 relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Learn Industry-Standard Technologies</h2>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
            {[
              "🌐 HTML & CSS", "⚡ JavaScript & TypeScript", "⚛️ React & Next.js",
              "🟢 Node.js & NestJS", "🐍 Python, Django & Flask", "🐘 PHP & Laravel",
              "🗄️ SQL, PostgreSQL & MongoDB", "🐳 Git, GitHub, Docker", "🤖 AI & Machine Learning"
            ].map((tech, i) => (
              <div key={i} className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 hover:-translate-y-1 transition-all cursor-default shadow-lg">
                {tech}
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 6: LEARNING JOURNEY */}
        <section className="py-24 border-t border-white/5">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">From Beginner to Career Ready</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Follow a proven path to mastery.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-8 relative">
            <div className="absolute left-8 top-10 bottom-10 w-0.5 bg-indigo-500/20 hidden md:block" />
            
            {[
              { emoji: "🌱", title: "Beginner", desc: "Learn programming fundamentals and build your first projects." },
              { emoji: "📚", title: "Intermediate", desc: "Master frameworks, databases, APIs, and collaborative development tools." },
              { emoji: "🚀", title: "Advanced", desc: "Build scalable applications and explore AI, Machine Learning, and cloud technologies." },
              { emoji: "💼", title: "Professional", desc: "Work on real-world projects, receive mentorship, and prepare for technical interviews." },
              { emoji: "🏆", title: "Career Ready", desc: "Graduate with practical experience, a professional portfolio, recognised certificates, and the confidence to pursue careers, freelance, or launch your own tech business." }
            ].map((step, idx) => (
              <div key={idx} className="relative flex flex-col md:flex-row gap-6 md:gap-8 items-start bg-[#0A0A0A] p-8 rounded-3xl border border-white/10 hover:border-indigo-500/30 transition-colors">
                <div className="w-16 h-16 shrink-0 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-3xl z-10 shadow-xl">
                  {step.emoji}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-slate-400 text-lg leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-20 text-center">
            <Link href="/register?portal=academy" className="h-16 px-10 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-lg font-bold hover:opacity-90 transition-opacity shadow-[0_0_50px_-12px_rgba(99,102,241,0.5)]">
              Start Your Journey
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

      </main>

      <footer className="border-t border-white/5 py-8 text-center text-slate-500 text-sm">
        <p>© {new Date().getFullYear()} KennyKentola Multi-Company Ecosystem. All rights reserved.</p>
      </footer>
    </div>
  );
}
