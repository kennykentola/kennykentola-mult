'use client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const posts = [
  {
    title: 'Why Next.js is the Ultimate Choice for SaaS in 2026',
    cat: 'Engineering',
    date: 'Jul 2, 2026',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80'
  },
  {
    title: 'Designing for Conversion: UI/UX Principles',
    cat: 'Design',
    date: 'Jun 28, 2026',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80'
  },
  {
    title: 'How to Build HIPAA Compliant Architecture',
    cat: 'Security',
    date: 'Jun 15, 2026',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80'
  }
];

export function BlogPreview() {
  return (
    <section className="py-24 bg-[#050505]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-end mb-12">
          <h2 className="text-4xl font-extrabold text-white">Insights & Engineering</h2>
          <Link href="/blog" className="text-indigo-400 font-bold hover:text-white flex items-center gap-2">
            View All Posts <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((post, i) => (
            <Link href={`/blog/${i}`} key={i} className="group block">
              <div className="aspect-video rounded-2xl overflow-hidden mb-6 bg-slate-900 border border-white/5">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider mb-3">
                <span className="text-indigo-400">{post.cat}</span>
                <span className="text-slate-500">{post.date}</span>
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-2">
                {post.title}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
