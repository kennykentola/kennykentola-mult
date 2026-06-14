'use client';

import React, { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { MessageSquare, Heart, Send, Loader2, Users, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../features/auth/AuthContext';
import { getSessionJwt } from '../../../lib/sessionJwt';

interface Post {
  $id: string;
  userId: string;
  authorName: string;
  content: string;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  likes?: string[];
}

interface Comment {
  $id: string;
  postId: string;
  userId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export default function CommunityFeed() {
  const { profile } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [commentLoading, setCommentLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
  const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

  // 1. Initial load of posts
  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_BASE}/academy/community/posts`, {
        headers: {
          Authorization: `Bearer ${await getSessionJwt()}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch community posts');
      }

      const data = await res.json();
      setPosts(data.posts || []);
    } catch (err: any) {
      console.error('[Community Feed] Fetch posts error:', err);
      setError(err.message || 'Could not load community feed.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch comments for a post
  const fetchComments = async (postId: string) => {
    try {
      setCommentLoading((prev) => ({ ...prev, [postId]: true }));
      const res = await fetch(`${API_BASE}/academy/community/posts/${postId}/comments`, {
        headers: {
          Authorization: `Bearer ${await getSessionJwt()}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch comments');
      }

      const data = await res.json();
      setComments((prev) => ({ ...prev, [postId]: data.comments || [] }));
    } catch (err) {
      console.error('[Community Feed] Comments load error:', err);
    } finally {
      setCommentLoading((prev) => ({ ...prev, [postId]: false }));
    }
  };

  // 3. Connect to Socket.io for realtime updates
  useEffect(() => {
    fetchPosts();

    // Initialize socket connection
    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket] Connected to server.');
      socket.emit('join_community');
    });

    socket.on('new_post', (newPost: Post) => {
      setPosts((prev) => {
        // Prevent duplicate posts
        if (prev.some((p) => p.$id === newPost.$id)) return prev;
        return [newPost, ...prev];
      });
    });

    socket.on('post_liked', ({ postId, likesCount, likes }: { postId: string; likesCount: number; likes: string[] }) => {
      setPosts((prev) =>
        prev.map((p) => (p.$id === postId ? { ...p, likesCount, likes } : p))
      );
    });

    socket.on('new_comment', ({ comment, postId }: { comment: Comment; postId: string }) => {
      // Update post comments count in feed
      setPosts((prev) =>
        prev.map((p) => (p.$id === postId ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p))
      );

      // Append to comments state if open
      setComments((prev) => {
        const postComments = prev[postId] || [];
        if (postComments.some((c) => c.$id === comment.$id)) return prev;
        return { ...prev, [postId]: [...postComments, comment] };
      });
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  // 4. Create Post Action
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim() || submitting) return;

    try {
      setSubmitting(true);
      const res = await fetch(`${API_BASE}/academy/community/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await getSessionJwt()}`,
        },
        body: JSON.stringify({ content: postContent }),
      });

      if (!res.ok) {
        throw new Error('Failed to share post');
      }

      setPostContent('');
    } catch (err: any) {
      alert(err.message || 'Failed to submit post');
    } finally {
      setSubmitting(false);
    }
  };

  // 5. Like Post Action
  const handleLikePost = async (postId: string) => {
    try {
      const res = await fetch(`${API_BASE}/academy/community/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${await getSessionJwt()}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to like post');
      }
    } catch (err: any) {
      console.error('[Community] Like error:', err.message);
    }
  };

  // 6. Comment Action
  const handleAddComment = async (postId: string) => {
    const content = commentInputs[postId] || '';
    if (!content.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/academy/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await getSessionJwt()}`,
        },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        throw new Error('Failed to add comment');
      }

      setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
    } catch (err: any) {
      alert(err.message || 'Failed to post comment');
    }
  };

  // Helper to check if current user liked a post
  const isPostLiked = (post: Post) => {
    if (!profile) return false;
    return post.likes?.includes(profile.userId) || false;
  };

  const toggleComments = (postId: string) => {
    if (activeCommentsPostId === postId) {
      setActiveCommentsPostId(null);
    } else {
      setActiveCommentsPostId(postId);
      if (!comments[postId]) {
        fetchComments(postId);
      }
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Users className="h-5 w-5 text-white" />
          </div>
          Academy Community Feed
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Share announcements, ask coding questions, and build together with other students.
        </p>
      </div>

      {/* Post Composer */}
      <div className="rounded-2xl border border-white/5 bg-slate-900/30 backdrop-blur-md p-5 shadow-xl">
        <form onSubmit={handleCreatePost} className="space-y-4">
          <textarea
            required
            rows={3}
            placeholder="What are you building or learning today? Ask a question or share progress..."
            className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors resize-none"
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !postContent.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Sharing...
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" /> Share Post
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
          <p className="text-slate-500 text-sm">Loading community board...</p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
          {error}
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-6">
          {posts.map((post) => {
            const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });
            const liked = isPostLiked(post);

            return (
              <div
                key={post.$id}
                className="rounded-2xl border border-white/5 bg-slate-900/10 backdrop-blur-md p-6 shadow-md hover:border-slate-800 transition-colors space-y-4"
              >
                {/* Post Header */}
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm uppercase">
                    {post.authorName[0]}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white leading-tight">{post.authorName}</h4>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">{formattedDate}</span>
                  </div>
                </div>

                {/* Post Content */}
                <p className="text-slate-200 text-sm whitespace-pre-wrap leading-relaxed">
                  {post.content}
                </p>

                {/* Post Actions (Like, Comment counts) */}
                <div className="flex items-center gap-6 pt-3 border-t border-slate-900 text-xs font-semibold">
                  <button
                    onClick={() => handleLikePost(post.$id)}
                    className={`flex items-center gap-2 transition-colors ${
                      liked ? 'text-rose-400 hover:text-rose-300' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${liked ? 'fill-rose-500/25 text-rose-400' : ''}`} />
                    <span>{post.likesCount || 0} Like{post.likesCount !== 1 ? 's' : ''}</span>
                  </button>

                  <button
                    onClick={() => toggleComments(post.$id)}
                    className={`flex items-center gap-2 transition-colors ${
                      activeCommentsPostId === post.$id ? 'text-indigo-400' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>{post.commentsCount || 0} Comment{post.commentsCount !== 1 ? 's' : ''}</span>
                  </button>
                </div>

                {/* Comments Section */}
                {activeCommentsPostId === post.$id && (
                  <div className="pt-4 border-t border-slate-900/60 mt-4 space-y-4 animate-in slide-in-from-top-1 duration-200">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Comments</h5>

                    {/* Comments List */}
                    {commentLoading[post.$id] ? (
                      <div className="py-4 flex justify-center">
                        <Loader2 className="h-4 w-4 text-indigo-500 animate-spin" />
                      </div>
                    ) : (comments[post.$id] || []).length > 0 ? (
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {(comments[post.$id] || []).map((comment) => (
                          <div key={comment.$id} className="bg-slate-950/40 border border-slate-900 rounded-xl p-3 text-xs">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-white">{comment.authorName}</span>
                              <span className="text-[9px] text-slate-600">
                                {new Date(comment.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <p className="text-slate-300 leading-relaxed">{comment.content}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 text-center py-2">No comments yet. Start the conversation!</p>
                    )}

                    {/* Add Comment Input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        className="flex-1 bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                        value={commentInputs[post.$id] || ''}
                        onChange={(e) =>
                          setCommentInputs((prev) => ({ ...prev, [post.$id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddComment(post.$id);
                        }}
                      />
                      <button
                        onClick={() => handleAddComment(post.$id)}
                        disabled={!(commentInputs[post.$id] || '').trim()}
                        className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3.5 py-2 text-xs font-semibold text-white transition-colors disabled:opacity-50"
                      >
                        Post
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/30 p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-slate-700 mb-4 animate-pulse" />
          <h3 className="text-base font-bold text-white">The Board is Quiet</h3>
          <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            There are no posts on the community board yet. Share what you're working on to get the community started!
          </p>
        </div>
      )}
    </div>
  );
}
