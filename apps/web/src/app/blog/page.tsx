'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '../../components/Navbar';
import { BookOpen, Calendar, Clock, Loader2, Mail, Sparkles, ArrowRight } from 'lucide-react';
import { getPublicBlogPosts } from '../../features/blog/blogService';
import toast from 'react-hot-toast';

export default function BlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

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

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSubscribing(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${API_URL}/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success(data.message);
        setEmail('');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setSubscribing(false);
    }
  };

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
                <div className="h-48 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center border-b border-white/10 group-hover:scale-105 transition-transform duration-500 shrink-0 overflow-hidden">
                  {post.coverImageUrl || post.coverImageId ? (
                    <img src={post.coverImageUrl || post.coverImageId} alt={post.title} className="w-full h-full object-cover" />
                  ) : (
                    <BookOpen className="w-12 h-12 text-slate-700" />
                  )}
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
        
        {/* Newsletter Section */}
        <div className="mt-24 max-w-4xl mx-auto glass-panel border border-indigo-500/20 rounded-3xl p-8 md:p-12 bg-indigo-950/10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]" />
          <div className="relative z-10">
            <Mail className="w-12 h-12 text-indigo-400 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Subscribe to our Newsletter</h2>
            <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
              Get the latest insights, tutorials, and tech news delivered directly to your inbox. No spam, just value.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <button
                type="submit"
                disabled={subscribing || !email}
                className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {subscribing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Subscribe <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
