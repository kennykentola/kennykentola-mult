import React from 'react';
import { Navbar } from '../../../components/Navbar';
import { ExternalLink, Briefcase } from 'lucide-react';
import { notFound } from 'next/navigation';

async function getPortfolioItems() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/portfolio`, {
      cache: 'no-store'
    });
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return [];
  }
}

export const metadata = {
  title: 'Project Portfolio - KennyKentola Digital',
  description: 'Explore our latest project implementations and software agency work.',
};

export default async function PortfolioPage() {
  const items = await getPortfolioItems();

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 lg:px-12 pt-32 pb-24">
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 mb-6">
            <Briefcase className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">Our Work</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Project <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Portfolio</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            A showcase of our recent software implementations, web applications, and enterprise solutions.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl">
            <p className="text-slate-400">No projects to display at the moment. Check back soon!</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item: any) => (
              <div key={item.$id} className="group flex flex-col bg-slate-900 border border-white/10 rounded-3xl overflow-hidden hover:border-indigo-500/50 transition-all duration-300">
                <div className="h-48 md:h-64 w-full bg-slate-950 relative overflow-hidden">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-800">
                      <Briefcase className="w-16 h-16 opacity-20" />
                    </div>
                  )}
                  {item.url && (
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                      <a 
                        href={item.url.startsWith('http') ? item.url : `https://${item.url}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="px-6 py-3 bg-white text-black font-bold rounded-xl flex items-center gap-2 hover:bg-indigo-500 hover:text-white transition-colors shadow-2xl"
                      >
                        Visit Project <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                </div>
                
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-1 line-clamp-4">
                    {item.description}
                  </p>
                  
                  {item.url && (
                    <a 
                      href={item.url.startsWith('http') ? item.url : `https://${item.url}`}
                      target="_blank" 
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors mt-auto"
                    >
                      <ExternalLink className="w-4 h-4" /> {item.url.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
