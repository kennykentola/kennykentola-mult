'use client';

import React, { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '../../../../components/Navbar';
import { fetchLearningPathBySlug, LearningPath, CurriculumModule } from '../../../../features/academy/learningPathsApi';
import { ArrowLeft, Clock, GraduationCap, ChevronRight, CheckCircle2, FileCode2 } from 'lucide-react';
import * as Icons from 'lucide-react';

export default function LearningPathPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const [path, setPath] = useState<LearningPath | null>(null);
  const [curriculum, setCurriculum] = useState<CurriculumModule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLearningPathBySlug(slug)
      .then(data => {
        setPath(data);
        try {
          setCurriculum(JSON.parse(data.curriculum));
        } catch {
          setCurriculum([]);
        }
      })
      .catch(() => setPath(null))
      .finally(() => setIsLoading(false));
  }, [slug]);

  if (isLoading) {
    return <div className="min-h-screen bg-[#0A0A0A] text-slate-400 flex items-center justify-center">Loading path...</div>;
  }

  if (!path) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center">
        <h1 className="text-2xl text-white mb-4">Path Not Found</h1>
        <Link href="/academy#paths" className="text-indigo-400 hover:underline">Back to Academy</Link>
      </div>
    );
  }

  // Dynamically get the icon component from lucide-react
  const IconComponent = (Icons as any)[path.iconName] || Icons.Layout;

  return (
    <div className="min-h-screen bg-[#0A0A0A] selection:bg-indigo-500/30">
      <Navbar />

      <main className="pt-32 pb-24">
        {/* HERO SECTION */}
        <section className="px-6 lg:px-8 max-w-7xl mx-auto mb-16">
          <div className="mb-6">
            <Link href="/academy#paths" className="inline-flex items-center text-sm font-bold text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Paths
            </Link>
          </div>

          <div className={`relative overflow-hidden rounded-[2.5rem] p-10 md:p-16 border border-white/10 bg-slate-900/50`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${path.color} opacity-20 pointer-events-none`} />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-10">
              <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 backdrop-blur-xl">
                <IconComponent className="w-10 h-10 text-white" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <span className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase bg-white/10 border border-white/10 rounded-full text-white backdrop-blur-sm">
                    {path.level}
                  </span>
                  <span className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase bg-indigo-500/20 border border-indigo-500/30 rounded-full text-indigo-300 backdrop-blur-sm flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {path.duration}
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">{path.title}</h1>
                <p className="text-lg text-slate-300 max-w-3xl leading-relaxed">
                  {path.description}
                </p>
                
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link 
                    href={`/register?portal=academy&path=${path.slug}`}
                    className="inline-flex items-center justify-center gap-2 bg-white text-black px-8 py-4 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                  >
                    Enroll Now <ChevronRight className="w-5 h-5" />
                  </Link>
                  <a 
                    href="https://wa.me/2348163571677"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#20bd5a] transition-colors shadow-[0_0_40px_rgba(37,211,102,0.2)]"
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                    </svg>
                    Enroll via WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DETAILS GRID */}
        <section className="px-6 lg:px-8 max-w-7xl mx-auto grid md:grid-cols-3 gap-8 mb-24">
          <div className="md:col-span-2 space-y-12">
            
            {/* Curriculum */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                <FileCode2 className="text-indigo-400" /> Course Curriculum
              </h2>
              <div className="space-y-6">
                {curriculum.map((mod, idx) => (
                  <div key={idx} className="relative pl-8 md:pl-0">
                    {/* Timeline Line (Mobile) */}
                    <div className="md:hidden absolute left-[11px] top-8 bottom-[-24px] w-0.5 bg-white/10 last:hidden" />
                    
                    <div className="glass-panel border border-white/5 bg-slate-900/40 rounded-2xl p-6 md:p-8 hover:bg-slate-900/60 transition-colors relative">
                      {/* Timeline Dot (Mobile) */}
                      <div className="md:hidden absolute left-[-21px] top-6 w-3 h-3 rounded-full bg-indigo-500 border-2 border-[#0A0A0A]" />
                      
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                        <div>
                          <span className="text-indigo-400 font-bold text-sm tracking-wider uppercase block mb-1">Module {idx + 1}</span>
                          <h3 className="text-xl font-bold text-white">{mod.title}</h3>
                        </div>
                        <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-lg text-xs font-bold text-slate-300 whitespace-nowrap">
                          {mod.duration}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm mb-6 leading-relaxed">{mod.description}</p>
                      
                      <div className="grid sm:grid-cols-2 gap-3">
                        {mod.topics.map((topic, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{topic}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="glass-panel border border-white/5 bg-slate-900/40 rounded-2xl p-8">
              <h3 className="font-bold text-white mb-6 uppercase tracking-wider text-sm border-b border-white/10 pb-4">Technologies Covered</h3>
              <div className="flex flex-wrap gap-2">
                {path.technologies.map((tech, idx) => (
                  <span key={idx} className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-sm text-slate-300">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="glass-panel border border-white/5 bg-slate-900/40 rounded-2xl p-8">
              <h3 className="font-bold text-white mb-6 uppercase tracking-wider text-sm border-b border-white/10 pb-4">Career Outcomes</h3>
              <ul className="space-y-4">
                {path.careerOutcomes.map((outcome, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-slate-300">
                    <GraduationCap className="w-5 h-5 text-indigo-400 shrink-0" />
                    <span className="font-medium text-sm">{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-panel border border-white/5 bg-slate-900/40 rounded-2xl p-8">
              <h3 className="font-bold text-white mb-6 uppercase tracking-wider text-sm border-b border-white/10 pb-4">Prerequisites</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {path.prerequisites}
              </p>
            </div>
            
            <div className="flex flex-col gap-3">
              <Link 
                href={`/register?portal=academy&path=${path.slug}`}
                className="flex items-center justify-center gap-2 bg-indigo-600 text-white w-full py-4 rounded-xl font-bold hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20"
              >
                Enroll Now <ChevronRight className="w-5 h-5" />
              </Link>
              <a 
                href="https://wa.me/2348163571677"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-[#25D366] text-white w-full py-4 rounded-xl font-bold hover:bg-[#20bd5a] transition-colors shadow-lg shadow-[#25D366]/20"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                </svg>
                Enroll via WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
