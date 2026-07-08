'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin } from 'lucide-react';
import { Navbar } from '../../../components/Navbar';
import { getSolarProjects, SolarProject } from '../../../features/solar/solarProjectsService';

export default function PortfolioIndex() {
  const [projects, setProjects] = useState<SolarProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getSolarProjects()
      .then(data => {
        if (mounted) {
          setProjects(data);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error(err);
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-32 text-center">
        <h1 className="text-4xl md:text-6xl font-black text-white mb-6">Our Engineering Portfolio</h1>
        <p className="text-xl text-slate-400 mb-16 max-w-2xl mx-auto">
          Explore our extensive catalog of deployed solar arrays, commercial backup systems, and hybrid infrastructure projects across Nigeria.
        </p>

        {loading ? (
          <div className="text-slate-400 animate-pulse py-12 text-center">Loading engineering portfolio...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left mb-16">
            {projects.map(project => (
              <div key={project.$id} className="group relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 flex flex-col">
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
                
                <div className="p-6 md:p-8 bg-gradient-to-b from-transparent to-slate-950 relative -mt-12 pt-16 flex-grow flex flex-col">
                  <h3 className="text-2xl font-bold text-white mb-2">{project.title}</h3>
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-4">
                    <MapPin className="w-4 h-4" /> {project.location}
                  </div>
                  
                  <div className="space-y-2 mb-8 flex-grow">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">System Size:</span>
                      <span className="text-white font-medium text-right max-w-[60%]">{project.size}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Est. Savings:</span>
                      <span className="text-emerald-400 font-bold">{project.savings}</span>
                    </div>
                  </div>
                  
                  <Link href={`/solar/portfolio/${project.$id}`} className="w-full inline-flex justify-center items-center py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-sm font-bold transition-colors">
                    View Full Engineering Report
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <div>
          <Link href="/solar" className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 transition-colors font-bold">
            <ArrowLeft className="w-5 h-5" /> Back to Solar Home
          </Link>
        </div>
      </main>
    </div>
  );
}
