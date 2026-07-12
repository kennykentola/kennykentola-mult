'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Video,
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  GripVertical,
  UploadCloud
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import Link from 'next/link';
import { getSessionJwt } from '../../../../../lib/sessionJwt';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

type Lesson = {
  id: string;
  courseId: string;
  title: string;
  content: string;
  videoUrl: string;
  order: number;
  durationMinutes: number;
  isPreview: boolean;
};

type LessonForm = {
  title: string;
  content: string;
  videoUrl: string;
  order: number;
  durationMinutes: number;
  isPreview: boolean;
};

const emptyForm = (): LessonForm => ({
  title: '',
  content: '',
  videoUrl: '',
  order: 1,
  durationMinutes: 0,
  isPreview: false,
});

export default function AdminCurriculumPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [form, setForm] = useState<LessonForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Load lessons for course
  const loadLessons = useCallback(() => {
    if (!id) return;
    setLoadingLessons(true);
    setError('');
    const load = async () => {
      try {
        const jwt = await getSessionJwt();
        const res = await fetch(`${API_BASE}/academy/courses/${id}/lessons`, {
          headers: { Authorization: `Bearer ${jwt}` }
        });
        const d = await res.json();
        if (d.error) throw new Error(d.error);
        setLessons((d.lessons || []).sort((a: Lesson, b: Lesson) => a.order - b.order));
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoadingLessons(false);
      }
    };

    load();
  }, [id]);

  useEffect(() => {
    loadLessons();
  }, [loadLessons]);

  function openCreateForm() {
    setEditingLesson(null);
    setForm({ ...emptyForm(), order: lessons.length + 1 });
    setShowForm(true);
  }

  function openEditForm(lesson: Lesson) {
    setEditingLesson(lesson);
    setForm({
      title: lesson.title,
      content: lesson.content,
      videoUrl: lesson.videoUrl,
      order: lesson.order,
      durationMinutes: lesson.durationMinutes,
      isPreview: lesson.isPreview,
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingLesson(null);
    setForm(emptyForm());
  }

  async function handleSave() {
    if (!(form.title || '').trim()) { setError('Lesson title is required.'); return; }
    setSaving(true);
    setError('');
    const jwt = await getSessionJwt();
    const payload = {
      title: (form.title || '').trim(),
      content: (form.content || '').trim(),
      videoUrl: (form.videoUrl || '').trim(),
      order: Number(form.order),
      durationMinutes: Number(form.durationMinutes),
      isPreview: Boolean(form.isPreview),
    };

    try {
      if (editingLesson) {
        const res = await fetch(`${API_BASE}/academy/lessons/${editingLesson.id}`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Update failed');
        setSuccessMsg('Lesson updated successfully!');
      } else {
        const res = await fetch(`${API_BASE}/academy/courses/${id}/lessons`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Create failed');
        setSuccessMsg('Lesson created successfully!');
      }
      closeForm();
      loadLessons();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setUploading(true);
    setError('');
    try {
      const jwt = await getSessionJwt();
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${jwt}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      
      setForm(prev => ({ ...prev, videoUrl: data.url }));
      setSuccessMsg('Media uploaded to Cloudinary successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(lessonId: string) {
    if (!confirm('Delete this lesson? This cannot be undone.')) return;
    setDeletingId(lessonId);
    setError('');
    const jwt = await getSessionJwt();
    try {
      const res = await fetch(`${API_BASE}/academy/lessons/${lessonId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${jwt}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      setSuccessMsg('Lesson deleted.');
      loadLessons();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleDragEnd(result: DropResult) {
    if (!result.destination) return;
    
    const items = Array.from(lessons);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update order values locally
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index + 1
    }));
    
    setLessons(updatedItems);
    
    // Send to backend
    const jwt = await getSessionJwt();
    try {
      const res = await fetch(`${API_BASE}/academy/courses/${id}/reorder`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: updatedItems, type: 'lessons' }),
      });
      if (!res.ok) throw new Error('Failed to save new order to server');
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto p-4">
      {/* Back Link */}
      <Link href="/admin/courses" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Course Manager
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
            <Video className="h-3.5 w-3.5" />
            Curriculum Builder
          </span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white">Manage Curriculum</h1>
          <p className="mt-2 text-slate-400 text-sm">
            Add, edit, and reorder lessons for this course.
          </p>
        </div>
        {!showForm && (
          <button
            id="btn-add-lesson"
            onClick={openCreateForm}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-sm font-bold text-white transition-all shadow-lg shadow-indigo-500/20"
          >
            <Plus className="h-4 w-4" />
            Add Lesson
          </button>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-300 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
          <button aria-label="Dismiss error" onClick={() => setError('')} className="ml-auto"><X className="h-4 w-4" /></button>
        </div>
      )}
      {successMsg && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Lesson Form */}
      {showForm && (
        <div className="rounded-3xl border border-indigo-500/20 bg-slate-900/40 p-6 space-y-5 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">
              {editingLesson ? 'Edit Lesson' : 'New Lesson'}
            </h2>
            <button aria-label="Close form" onClick={closeForm} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="lesson-title" className="block text-xs font-semibold text-slate-400 mb-1.5">Lesson Title *</label>
              <input
                id="lesson-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-xl border border-white/5 bg-slate-900/60 px-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none transition-all"
                placeholder="e.g. Introduction to React Hooks"
              />
            </div>

            <div>
              <label htmlFor="lesson-video-url" className="block text-xs font-semibold text-slate-400 mb-1.5">Video/File URL</label>
              <div className="flex items-center gap-2">
                <input
                  id="lesson-video-url"
                  value={form.videoUrl}
                  onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                  className="flex-1 w-full rounded-xl border border-white/5 bg-slate-900/60 px-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none transition-all"
                  placeholder="https://..."
                />
                <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-4 py-3 text-sm font-semibold hover:bg-indigo-500/20 transition-all shrink-0">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                  {uploading ? 'Uploading...' : 'Upload'}
                  <input type="file" accept="video/*,image/*,.pdf" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                </label>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Upload directly to Cloudinary or paste a link.</p>
            </div>

            <div>
              <label htmlFor="lesson-duration" className="block text-xs font-semibold text-slate-400 mb-1.5">Duration (minutes)</label>
              <input
                id="lesson-duration"
                type="number"
                min={0}
                value={form.durationMinutes}
                onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
                className="w-full rounded-xl border border-white/5 bg-slate-900/60 px-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label htmlFor="lesson-order" className="block text-xs font-semibold text-slate-400 mb-1.5">Order / Position</label>
              <input
                id="lesson-order"
                type="number"
                min={1}
                value={form.order}
                onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                className="w-full rounded-xl border border-white/5 bg-slate-900/60 px-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none transition-all"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                id="lesson-is-preview"
                type="checkbox"
                checked={form.isPreview}
                onChange={(e) => setForm({ ...form, isPreview: e.target.checked })}
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-indigo-500"
              />
              <label htmlFor="lesson-is-preview" className="text-sm text-slate-300 font-medium">
                Free Preview (visible without enrollment)
              </label>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="lesson-content" className="block text-xs font-semibold text-slate-400 mb-1.5">Lesson Content / Notes</label>
              <textarea
                id="lesson-content"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={5}
                className="w-full rounded-xl border border-white/5 bg-slate-900/60 px-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none transition-all resize-none"
                placeholder="Lesson notes, description, or markdown content..."
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button onClick={closeForm} className="rounded-xl border border-slate-800 px-5 py-2.5 text-sm font-semibold text-slate-400 hover:text-white transition-all">
              Cancel
            </button>
            <button
              id="btn-save-lesson"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-5 py-2.5 text-sm font-bold text-white transition-all"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? 'Saving...' : editingLesson ? 'Update Lesson' : 'Create Lesson'}
            </button>
          </div>
        </div>
      )}

      {/* Lessons List */}
      {loadingLessons ? (
        <div className="rounded-3xl border border-white/5 bg-slate-900/20 p-12 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-400" />
          <p className="mt-3 text-sm text-slate-400">Loading lessons...</p>
        </div>
      ) : lessons.length === 0 ? (
        <div className="rounded-3xl border border-white/5 bg-slate-900/20 p-12 text-center">
          <Video className="mx-auto h-12 w-12 text-slate-700" />
          <h3 className="mt-4 text-lg font-bold text-white">No Lessons Yet</h3>
          <p className="mt-2 text-slate-400 text-sm">Click "Add Lesson" above to create your first lesson.</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="lessons-list">
            {(provided) => (
              <div className="space-y-3" {...provided.droppableProps} ref={provided.innerRef}>
                {lessons.map((lesson, idx) => (
                  <Draggable key={lesson.id} draggableId={lesson.id} index={idx}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`rounded-2xl border border-white/5 bg-slate-900/30 p-5 flex items-center gap-4 transition-colors group ${snapshot.isDragging ? 'bg-slate-800 shadow-2xl ring-2 ring-indigo-500' : 'hover:bg-slate-900/40'}`}
                      >
                        {/* Drag Handle */}
                        <div {...provided.dragHandleProps} className="text-slate-600 hover:text-white cursor-grab active:cursor-grabbing p-1">
                          <GripVertical className="h-5 w-5" />
                        </div>
                        
                        {/* Order Badge */}
                        <div className="h-9 w-9 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-sm font-black text-indigo-400 shrink-0">
                          {lesson.order}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white truncate">{lesson.title}</span>
                            {lesson.isPreview && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
                                <Eye className="h-2.5 w-2.5" /> Free Preview
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                            {lesson.videoUrl && (
                              <span className="flex items-center gap-1">
                                <Video className="h-3 w-3" /> Media attached
                              </span>
                            )}
                            {lesson.durationMinutes > 0 && (
                              <span>{lesson.durationMinutes} min</span>
                            )}
                            {lesson.content && (
                              <span className="flex items-center gap-1">
                                <BookOpen className="h-3 w-3" /> Has notes
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                  onClick={() => openEditForm(lesson)}
                  className="p-2 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-slate-800 transition-all"
                  title="Edit lesson"
                  aria-label="Edit lesson"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(lesson.id)}
                  disabled={deletingId === lesson.id}
                  className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 disabled:opacity-50 transition-all"
                  title="Delete lesson"
                  aria-label="Delete lesson"
                >
                          {deletingId === lesson.id
                            ? <Loader2 className="h-4 w-4 animate-spin" />
                            : <Trash2 className="h-4 w-4" />
                          }
                          </button>
                          <a
                            href={lesson.videoUrl || '#'}
                            target="_blank"
                            rel="noreferrer"
                            className={`p-2 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-slate-800 transition-all ${!lesson.videoUrl ? 'pointer-events-none opacity-30' : ''}`}
                            title="Preview video"
                            aria-label="Preview video"
                          >
                            <EyeOff className="h-4 w-4" />
                          </a>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
}
