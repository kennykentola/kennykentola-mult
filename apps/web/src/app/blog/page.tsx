import React from 'react';
import Link from 'next/link';
import { Navbar } from '../../components/Navbar';
import { BookOpen, Calendar, Clock, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Blog — KennyKentola Digital',
  description: 'Project tips, research resources, tutorials, and technology updates.',
};

const DUMMY_POSTS = [
  {
    title: "How to Choose the Perfect Final Year CS Project",
    excerpt: "Struggling to find a topic? Here's a framework to help you select a thesis topic that is both achievable and impressive.",
    category: "Academic Guidance",
    date: "Oct 12, 2026",
    readTime: "5 min read"
  },
  {
    title: "Why Appwrite is the Best Backend for Student Projects",
    excerpt: "Learn why using an open-source BaaS like Appwrite can save you weeks of development time on your final year project.",
    category: "Software Development",
    date: "Oct 05, 2026",
    readTime: "8 min read"
  },
  {
    title: "The Ultimate Guide to Chapter Four Documentation",
    excerpt: "System implementation and testing is often the hardest chapter to write. Here's exactly how to structure it.",
    category: "Documentation",
    date: "Sep 28, 2026",
    readTime: "12 min read"
  }
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-slate-200">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 lg:px-12 pt-32 pb-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6">Our Blog</h1>
          <p className="text-xl text-slate-400">Insights, tutorials, and guides from our elite software engineers and academic mentors.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {DUMMY_POSTS.map((post, i) => (
            <Link key={i} href="#" className="group block bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:border-amber-500/50 transition-all">
              <div className="h-48 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center border-b border-white/10 group-hover:scale-105 transition-transform duration-500">
                <BookOpen className="w-12 h-12 text-slate-700" />
              </div>
              <div className="p-8">
                <div className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-3">
                  {post.category}
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-amber-400 transition-colors">
                  {post.title}
                </h3>
                <p className="text-slate-400 text-sm mb-6 line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5"/> {post.date}</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/> {post.readTime}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 text-center">
          <button className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-xl font-bold hover:bg-white/10 transition-colors">
            Load More Articles
          </button>
        </div>
      </main>
    </div>
  );
}
