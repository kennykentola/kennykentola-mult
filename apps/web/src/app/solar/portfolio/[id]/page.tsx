import React from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Zap, Clock, Leaf, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Navbar } from '../../../../components/Navbar';
import { solarProjects } from '../../../../data/solarProjects';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const project = solarProjects.find(p => p.id === resolvedParams.id);
  if (!project) return { title: 'Not Found' };
  return { title: `${project.title} - Case Study | Infinite Power` };
}

export default async function PortfolioDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const project = solarProjects.find(p => p.id === resolvedParams.id);

  if (!project) {
    notFound();
  }
  
  return (
    <div className="min-h-screen bg-[#050505] text-slate-200">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 border-b border-slate-900 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={project.image} alt={project.title} className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold mb-6">
            <Zap className="w-4 h-4" /> Engineering Case Study
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6">{project.title}</h1>
          <div className="flex flex-wrap items-center gap-6 text-slate-400 text-lg">
            <div className="flex items-center gap-2"><MapPin className="w-5 h-5" /> {project.location}</div>
            <div className="flex items-center gap-2"><ShieldCheck className="w-5 h-5" /> {project.type}</div>
          </div>
        </div>
      </section>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-2xl font-bold text-white mb-6">Executive Summary</h2>
              <p className="text-slate-300 text-lg leading-relaxed whitespace-pre-wrap">
                {project.description}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-6">Deployed Infrastructure</h2>
              <ul className="space-y-4">
                {project.equipment.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                    <span className="text-slate-300 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Sidebar Metrics */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sticky top-32">
              <h3 className="text-xl font-bold text-white mb-8">Performance Telemetry</h3>
              
              <div className="space-y-6">
                <div className="pb-6 border-b border-slate-800">
                  <div className="text-sm text-slate-500 mb-1">Total System Size</div>
                  <div className="text-2xl font-bold text-white">{project.size}</div>
                </div>
                
                <div className="pb-6 border-b border-slate-800">
                  <div className="text-sm text-slate-500 mb-1 flex items-center gap-2">Monthly OPEX Savings</div>
                  <div className="text-3xl font-black text-emerald-400">{project.savings}</div>
                </div>
                
                <div className="pb-6 border-b border-slate-800">
                  <div className="text-sm text-slate-500 mb-1 flex items-center gap-2"><Leaf className="w-4 h-4" /> Carbon Offset</div>
                  <div className="text-xl font-bold text-white">{project.metrics.co2Offset}</div>
                </div>

                <div className="pb-6 border-b border-slate-800">
                  <div className="text-sm text-slate-500 mb-1">Grid Independence</div>
                  <div className="text-xl font-bold text-white">{project.metrics.gridIndependence}</div>
                </div>

                <div className="pb-6 border-b border-slate-800">
                  <div className="text-sm text-slate-500 mb-1">Est. ROI Period</div>
                  <div className="text-xl font-bold text-white">{project.metrics.roi}</div>
                </div>
                
                <div>
                  <div className="text-sm text-slate-500 mb-1 flex items-center gap-2"><Clock className="w-4 h-4" /> Deployment Timeline</div>
                  <div className="text-lg font-bold text-white">{project.timeline}</div>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-slate-800">
                <Link href="/solar#consultation" className="w-full block text-center py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors">
                  Request Similar System
                </Link>
              </div>
            </div>
          </div>

        </div>
        
        <div className="mt-16 border-t border-slate-900 pt-16">
          <Link href="/solar/portfolio" className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 transition-colors font-bold">
            <ArrowLeft className="w-5 h-5" /> Back to Case Studies
          </Link>
        </div>
      </main>
    </div>
  );
}
