'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AIVideoGenerator } from '../../../components/AIVideoGenerator';
import { useRouter } from 'next/navigation';
import { getAdminBlogPosts, deleteBlogPost } from '../../../features/blog/blogService';
import { FileCheck, Plus, Edit, Trash2, Send, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminBlogPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const data = await getAdminBlogPosts();
      setPosts(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await deleteBlogPost(id);
      toast.success('Post deleted successfully');
      loadPosts();
    } catch (err) {
      toast.error('Failed to delete post');
    }
  };

  const handleBroadcast = (post: any) => {
    const html = `
      <h1>${post.title}</h1>
      <p>${post.excerpt}</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://kennykentola.com'}/blog/${post.slug}" style="display:inline-block;padding:10px 20px;background:#f59e0b;color:#fff;text-decoration:none;border-radius:5px;margin-top:15px;">Read Full Article</a>
    `;
    
    // Store in localStorage to pass to newsletter page
    localStorage.setItem('newsletter_draft_subject', `New Article: ${post.title}`);
    localStorage.setItem('newsletter_draft_html', html);
    
    router.push('/admin/newsletter');
  };

  return (
    <div className="p-6 lg:p-12 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-3">
              <FileCheck className="w-8 h-8 text-orange-400" />
              Blog Manager
            </h1>
            <p className="text-slate-400 mt-2">Manage your articles, news, and technical posts.</p>
          </div>
          <Link
            href="/admin/blog/new"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Post
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/50 border border-slate-800 rounded-3xl">
            <FileCheck className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Posts Found</h3>
            <p className="text-slate-400 mb-6">You haven't written any blog posts yet.</p>
            <Link
              href="/admin/blog/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold rounded-xl transition-colors"
            >
              Write your first post
            </Link>
          </div>
        ) : (
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4 font-bold">Title</th>
                    <th className="px-6 py-4 font-bold">Category</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold">Date</th>
                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {posts.map((post) => (
                    <tr key={post.$id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-white max-w-xs truncate">
                        {post.title}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-full text-xs font-semibold">
                          {post.category || 'General'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {post.isPublished ? (
                          <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-semibold">
                            Published
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 rounded-full text-xs font-semibold">
                            Draft
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {post.publishedAt 
                          ? new Date(post.publishedAt).toLocaleDateString()
                          : new Date(post.$createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleBroadcast(post)}
                            title="Broadcast to Newsletter"
                            className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                          <Link
                            href={`/admin/blog/edit/${post.$id}`}
                            title="Edit Post"
                            aria-label="Edit Post"
                            className="p-2 text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(post.$id)}
                            title="Delete Post"
                            aria-label="Delete Post"
                            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-16 border-t border-slate-800 pt-16">
          <AIVideoGenerator />
        </div>
      </div>
    </div>
  );
}
