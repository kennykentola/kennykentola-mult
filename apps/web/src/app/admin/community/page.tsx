'use client';

import React, { useState, useEffect } from 'react';
import { Trash2, MessageSquare, Heart, AlertTriangle } from 'lucide-react';
import { getSessionJwt } from '@/lib/sessionJwt';
import toast from 'react-hot-toast';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export default function AdminCommunityPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const jwt = await getSessionJwt();
      const res = await fetch(`${API_BASE}/academy/community/posts`, {
        headers: { 'Authorization': `Bearer ${jwt}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load posts');
      setPosts(data.posts || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (postId: string) => {
    if (!window.confirm('Are you sure you want to delete this post and all its comments?')) return;
    try {
      const jwt = await getSessionJwt();
      const res = await fetch(`${API_BASE}/academy/community/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${jwt}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete post');
      
      setPosts(posts.filter(p => p.$id !== postId));
      toast.success('Post deleted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete post');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading posts...</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Community Moderation</h1>
        <p className="text-slate-500">View and moderate all posts from the student community.</p>
      </div>

      <div className="space-y-4">
        {posts.map(post => (
          <div key={post.$id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold text-slate-900">{post.authorName}</div>
                <div className="text-xs text-slate-500">{new Date(post.createdAt).toLocaleString()}</div>
              </div>
              <button 
                onClick={() => deletePost(post.$id)}
                className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                title="Delete Post"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 text-slate-700 whitespace-pre-wrap">{post.content}</div>
            
            <div className="mt-6 flex items-center gap-6 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Heart className="h-4 w-4" /> {post.likesCount || 0} Likes
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <MessageSquare className="h-4 w-4" /> {post.commentsCount || 0} Comments
              </div>
            </div>
          </div>
        ))}
        {posts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 text-slate-500">
            No posts found in the community.
          </div>
        )}
      </div>
    </div>
  );
}
