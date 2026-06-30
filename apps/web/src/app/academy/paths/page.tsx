'use client';
import { useEffect, useState } from 'react';
import { Network, ArrowRight, Layers, Clock, Award, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function LearningPathsPage() {
  const [paths, setPaths] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchPaths() {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
        const res = await fetch(`${apiBase}/learning-paths`);
        if (!res.ok) throw new Error('Failed to fetch learning paths');
        const data = await res.json();
        setPaths(data);
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }
    fetchPaths();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 pb-20">
      {/* Header */}
      <div className="relative border-b border-white/10 bg-slate-950 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20 [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
            <Network className="h-8 w-8 text-indigo-400" />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl mb-6">
            Structured <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Learning Paths</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-8 text-slate-400">
            Follow a curated sequence of courses designed by experts to take you from beginner to job-ready professional.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-rose-400 py-12 bg-rose-500/10 rounded-2xl border border-rose-500/20">
            {error}
          </div>
        ) : paths.length === 0 ? (
          <div className="text-center py-20 bg-slate-800/50 rounded-3xl border border-slate-700">
            <Layers className="mx-auto h-12 w-12 text-slate-500 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Paths Available</h3>
            <p className="text-slate-400">Check back later for new curated learning tracks.</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {paths.map((path) => (
              <Link 
                key={path.$id} 
                href={`/academy/paths/${path.slug}`}
                className="group relative flex flex-col rounded-3xl border border-white/5 bg-slate-900/50 overflow-hidden hover:bg-slate-800/80 transition-all hover:scale-[1.02] hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10"
                // eslint-disable-next-line react/forbid-dom-props
                style={path.borderColor ? { borderColor: path.borderColor } : {}}
              >
                <div className="p-8">
                  <div 
                    className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl"
                    // eslint-disable-next-line react/forbid-dom-props
                    style={{ backgroundColor: path.color ? `${path.color}20` : '#4f46e520' }}
                  >
                    <Layers 
                      className="h-7 w-7" 
                      // eslint-disable-next-line react/forbid-dom-props
                      style={{ color: path.color || '#818cf8' }}
                    />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors">
                    {path.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-6 line-clamp-3">
                    {path.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-3 mb-8">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300">
                      <Clock className="h-3.5 w-3.5 text-indigo-400" />
                      {path.duration || 'Self-paced'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300">
                      <Award className="h-3.5 w-3.5 text-amber-400" />
                      {path.level || 'All Levels'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300">
                      <BookOpen className="h-3.5 w-3.5 text-emerald-400" />
                      {path.curriculum?.length || 0} Courses
                    </span>
                  </div>
                  
                  <div className="mt-auto flex items-center justify-between border-t border-slate-700/50 pt-5">
                    <span className="text-sm font-bold text-indigo-400">Explore Path</span>
                    <ArrowRight className="h-5 w-5 text-indigo-400 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
