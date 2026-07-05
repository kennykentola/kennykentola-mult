'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '../../../components/Navbar';
import { Footer } from '../../../components/Footer';
import { getPublicBlogPost } from '../../../features/blog/blogService';
import { Loader2, ArrowLeft, Calendar, User, Share2, Twitter, Facebook, Linkedin, Link as LinkIcon } from 'lucide-react';
import toast from 'react-hot-toast';

import { marked } from 'marked';

export default function BlogPostPage() {
  const params = useParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        if (params?.slug) {
          const data = await getPublicBlogPost(params.slug as string);
          setPost(data);
          
          if (data.content) {
            // Parse markdown to HTML asynchronously
            const parsed = await marked.parse(data.content);
            setHtmlContent(parsed);
          }
        }
      } catch (err) {
        console.error('Failed to load post', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [params?.slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-amber-500">
        <Loader2 className="w-12 h-12 animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center">
        <Navbar />
        <h1 className="text-4xl font-black mb-4">Post Not Found</h1>
        <p className="text-slate-400 mb-8">The article you're looking for doesn't exist.</p>
        <Link href="/blog" className="px-6 py-3 bg-amber-500 text-white font-bold rounded-xl">
          Back to Blog
        </Link>
      </div>
    );
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 selection:bg-amber-500/30">
      <Navbar />

      <main className="pt-32 pb-24">
        <article className="max-w-3xl mx-auto px-6 lg:px-0">
          
          <Link href="/blog" className="inline-flex items-center gap-2 text-slate-400 hover:text-amber-500 transition-colors mb-12 font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to all articles
          </Link>

          <header className="mb-12">
            <div className="flex flex-wrap items-center gap-4 text-sm font-bold mb-6">
              <span className="text-amber-500 uppercase tracking-wider bg-amber-500/10 px-3 py-1 rounded-full">
                {post.category || 'General'}
              </span>
              <span className="text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(post.publishedAt || post.$createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-8">
              {post.title}
            </h1>

            {(post.coverImageUrl || post.coverImageId) && (
              <div className="w-full h-64 md:h-96 rounded-3xl overflow-hidden mb-8 border border-white/10">
                <img 
                  src={post.coverImageUrl || post.coverImageId} 
                  alt={post.title} 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" 
                />
              </div>
            )}

            <div className="flex items-center justify-between py-6 border-y border-white/10">
              <div className="flex items-center gap-3 text-slate-300 font-medium">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-white font-black">
                  {post.authorName?.[0] || 'K'}
                </div>
                <span>{post.authorName || 'KennyKentola Team'}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-sm mr-2 hidden sm:inline">Share:</span>
                <a href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${post.title}`} target="_blank" rel="noreferrer" title="Share on Twitter" aria-label="Share on Twitter" className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-[#1DA1F2] hover:text-white hover:border-transparent transition-all">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noreferrer" title="Share on Facebook" aria-label="Share on Facebook" className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-[#4267B2] hover:text-white hover:border-transparent transition-all">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${post.title}`} target="_blank" rel="noreferrer" title="Share on LinkedIn" aria-label="Share on LinkedIn" className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-[#0077b5] hover:text-white hover:border-transparent transition-all">
                  <Linkedin className="w-4 h-4" />
                </a>
                <button onClick={copyLink} title="Copy Link" aria-label="Copy Link" className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-white hover:text-black hover:border-transparent transition-all">
                  <LinkIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </header>

          <div 
            className="prose prose-invert prose-lg max-w-none prose-a:text-amber-500 hover:prose-a:text-amber-400 prose-headings:text-white prose-img:rounded-2xl prose-img:border prose-img:border-white/10"
            dangerouslySetInnerHTML={{ __html: htmlContent || post.content }}
          />
          
        </article>
      </main>
      
      <Footer />
    </div>
  );
}
