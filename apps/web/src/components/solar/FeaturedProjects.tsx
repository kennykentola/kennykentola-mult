'use client';

import React from 'react';
import { ArrowRight, MapPin } from 'lucide-react';
import Link from 'next/link';

import { solarProjects } from '../../data/solarProjects';

export function FeaturedProjects() {
  const projects = solarProjects;
  return (
    <section id="projects" className="py-24 bg-[#050505] border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Featured Projects</h2>
            <p className="text-slate-400 text-lg">
              Explore our recent enterprise and commercial deployments. We deliver scale, reliability, and guaranteed ROI.
            </p>
          </div>
          <Link href="/solar/portfolio" className="inline-flex items-center gap-2 text-emerald-400 font-bold hover:text-emerald-300 transition-colors">
            View All Case Studies <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {projects.map(project => (
            <div key={project.id} className="group relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800">
              <div className="aspect-[4/3] overflow-hidden">
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-bold text-emerald-400">
                {project.type}
              </div>
              
              <div className="p-6 md:p-8 bg-gradient-to-b from-transparent to-slate-950 relative -mt-12 pt-16">
                <h3 className="text-2xl font-bold text-white mb-2">{project.title}</h3>
                
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-4">
                  <MapPin className="w-4 h-4" /> {project.location}
                </div>
                
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">System Size:</span>
                    <span className="text-white font-medium">{project.size}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Est. Savings:</span>
                    <span className="text-emerald-400 font-bold">{project.savings}</span>
                  </div>
                </div>
                
                <Link href={`/solar/portfolio/${project.id}`} className="w-full inline-flex justify-center items-center py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-sm font-bold transition-colors">
                  View Case Study
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
