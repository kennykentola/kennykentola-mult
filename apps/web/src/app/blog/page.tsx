'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '../../components/Navbar';
import { BookOpen, Calendar, Clock, Loader2 } from 'lucide-react';
import { getPublicBlogPosts } from '../../features/blog/blogService';

export default function BlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getPublicBlogPosts();
        setPosts(data);
      } catch (err) {
        console.error('Failed to load blog posts', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 lg:px-12 pt-32 pb-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6">Our Blog</h1>
          <p className="text-xl text-slate-400">Insights, tutorials, and guides from our elite software engineers and academic mentors.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-slate-400 border border-white/5 rounded-3xl bg-white/[0.02]">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-slate-600" />
            <p>No blog posts found. Check back soon!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link key={post.$id} href={`/blog/${post.slug}`} className="group block bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:border-amber-500/50 transition-all flex flex-col">
                <div className="h-48 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center border-b border-white/10 group-hover:scale-105 transition-transform duration-500 shrink-0">
                  <BookOpen className="w-12 h-12 text-slate-700" />
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <div className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-3">
                    {post.category || 'General'}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-amber-400 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-slate-400 text-sm mb-6 line-clamp-3 flex-1">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-white/5">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5"/> 
                      {new Date(post.publishedAt || post.$createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5"/> 
                      {Math.max(1, Math.ceil((post.content?.length || 0) / 1000))} min read
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
