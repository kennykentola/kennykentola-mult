import React, { useEffect, useState } from 'react';
import { fetchCourseQna, createQnaThread, fetchQnaReplies, createQnaReply, QnaThreadDto, QnaReplyDto } from '../academy/api';
import { Loader2, MessageSquare, Send, User } from 'lucide-react';

export default function CourseQna({ courseId, lessonId }: { courseId: string; lessonId?: string }) {
  const [threads, setThreads] = useState<QnaThreadDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [newThreadContent, setNewThreadContent] = useState('');
  const [activeThread, setActiveThread] = useState<QnaThreadDto | null>(null);
  const [replies, setReplies] = useState<QnaReplyDto[]>([]);
  const [newReplyContent, setNewReplyContent] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadThreads();
  }, [courseId, lessonId]);

  const loadThreads = async () => {
    setLoading(true);
    try {
      const res = await fetchCourseQna(courseId, lessonId);
      setThreads(res.threads || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThreadContent.trim()) return;
    setActionLoading(true);
    try {
      const res = await createQnaThread(courseId, lessonId || '', newThreadContent);
      setThreads([res.thread, ...threads]);
      setNewThreadContent('');
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const openThread = async (thread: QnaThreadDto) => {
    setActiveThread(thread);
    setReplies([]);
    try {
      const res = await fetchQnaReplies(thread.$id);
      setReplies(res.replies || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeThread || !newReplyContent.trim()) return;
    setActionLoading(true);
    try {
      const res = await createQnaReply(activeThread.$id, newReplyContent);
      setReplies([...replies, res.reply]);
      setNewReplyContent('');
      // Update thread reply count locally
      setThreads(threads.map(t => t.$id === activeThread.$id ? { ...t, repliesCount: t.repliesCount + 1 } : t));
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !activeThread) {
    return (
      <div className="flex h-32 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (activeThread) {
    return (
      <div className="space-y-6">
        <button onClick={() => setActiveThread(null)} className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-2">
          ← Back to Discussions
        </button>

        <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center">
              <User className="h-5 w-5 text-slate-400" />
            </div>
            <div>
              <p className="font-bold text-white">{activeThread.authorName}</p>
              <p className="text-xs text-slate-500">{new Date(activeThread.createdAt).toLocaleString()}</p>
            </div>
          </div>
          <p className="text-slate-200 whitespace-pre-wrap">{activeThread.content}</p>
        </div>

        <div className="space-y-4 pl-6 border-l-2 border-indigo-500/20">
          <h3 className="font-bold text-slate-300">Replies ({replies.length})</h3>
          {replies.map(reply => (
            <div key={reply.$id} className="rounded-2xl border border-white/5 bg-slate-900/30 p-4">
              <div className="flex items-center gap-2 mb-2">
                <p className="font-bold text-sm text-slate-200">{reply.authorName}</p>
                <p className="text-xs text-slate-500">{new Date(reply.createdAt).toLocaleString()}</p>
              </div>
              <p className="text-sm text-slate-300 whitespace-pre-wrap">{reply.content}</p>
            </div>
          ))}

          <form onSubmit={handleCreateReply} className="mt-4 flex gap-3">
            <input 
              type="text" 
              value={newReplyContent}
              onChange={e => setNewReplyContent(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button disabled={actionLoading || !newReplyContent.trim()} type="submit" className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-500 disabled:opacity-50">
              <Send className="h-4 w-4" />
              Reply
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-indigo-400" />
          Course Discussions
        </h2>
      </div>

      <form onSubmit={handleCreateThread} className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4 flex gap-4">
        <textarea 
          value={newThreadContent}
          onChange={e => setNewThreadContent(e.target.value)}
          placeholder={lessonId ? "Ask a question about this lesson..." : "Start a general course discussion..."}
          className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 min-h-[80px] resize-y"
        />
        <div className="flex items-end">
          <button disabled={actionLoading || !newThreadContent.trim()} type="submit" className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white hover:bg-indigo-500 disabled:opacity-50 h-fit">
            <Send className="h-4 w-4" />
            Post
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {threads.length === 0 ? (
          <p className="text-slate-400 text-sm py-8 text-center border border-dashed border-white/10 rounded-2xl">No discussions yet. Be the first to start one!</p>
        ) : (
          threads.map(thread => (
            <button 
              key={thread.$id} 
              onClick={() => openThread(thread)}
              className="w-full text-left rounded-2xl border border-white/5 bg-slate-900/30 p-5 hover:border-indigo-500/30 hover:bg-slate-900/50 transition-all flex justify-between items-start gap-4"
            >
              <div>
                <p className="font-semibold text-white mb-2 line-clamp-2">{thread.content}</p>
                <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                  <span className="flex items-center gap-1"><User className="h-3 w-3" /> {thread.authorName}</span>
                  <span>•</span>
                  <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-lg whitespace-nowrap">
                <MessageSquare className="h-3.5 w-3.5" />
                {thread.repliesCount} {thread.repliesCount === 1 ? 'Reply' : 'Replies'}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
