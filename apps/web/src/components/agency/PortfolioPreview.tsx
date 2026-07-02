'use client';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

const projects = [
  { 
    title: 'FinTech Dashboard', 
    category: 'SaaS Platform',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80',
    tech: ['React', 'Node.js', 'PostgreSQL']
  },
  { 
    title: 'E-Commerce Mobile App', 
    category: 'Mobile App',
    image: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=80',
    tech: ['React Native', 'Appwrite']
  },
  { 
    title: 'Healthcare AI Assistant', 
    category: 'AI Solution',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80',
    tech: ['Next.js', 'Python', 'OpenAI']
  },
];

export function PortfolioPreview() {
  return (
    <section id="portfolio" className="py-24 bg-[#050505]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="text-4xl font-extrabold text-white mb-4">Selected Work</h2>
            <p className="text-slate-400 max-w-xl">We build products that look beautiful and perform even better. Here's a glimpse of what we've shipped.</p>
          </div>
          <Link href="/agency/dashboard" className="px-6 py-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold transition-all whitespace-nowrap">
            View All Projects
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, i) => (
            <div key={i} className="group relative rounded-2xl overflow-hidden bg-slate-900 border border-white/5">
              <div className="aspect-[4/3] overflow-hidden">
                <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80" />
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <div className="text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">{project.category}</div>
                <h3 className="text-2xl font-bold text-white mb-3">{project.title}</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tech.map((t, idx) => (
                    <span key={idx} className="px-2 py-1 bg-white/10 backdrop-blur-md rounded text-[10px] font-medium text-slate-300">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
