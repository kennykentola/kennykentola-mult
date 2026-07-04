'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Video,
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  Loader2,
  Calendar,
  Clock,
  Link as LinkIcon
} from 'lucide-react';
import Link from 'next/link';
import { fetchAcademyLiveClasses, createLiveClass, updateLiveClass, deleteLiveClass, AcademyLiveClassDto } from '../../../../../features/academy/api';

type LiveClassForm = {
  title: string;
  scheduledAt: string;
  durationMinutes: number;
  meetingUrl: string;
  status: string;
};

const emptyForm = (): LiveClassForm => ({
  title: '',
  scheduledAt: new Date().toISOString().slice(0, 16),
  durationMinutes: 60,
  meetingUrl: '',
  status: 'scheduled'
});

export default function InstructorLiveClassesPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = React.use(params);
  const [liveClasses, setLiveClasses] = useState<AcademyLiveClassDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState<AcademyLiveClassDto | null>(null);
  const [form, setForm] = useState<LiveClassForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadClasses = useCallback(() => {
    if (!courseId) return;
    setLoading(true);
    setError('');
    const load = async () => {
      try {
        const res = await fetchAcademyLiveClasses(courseId);
        setLiveClasses(res.liveClasses || []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [courseId]);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  function openCreateForm() {
    setEditingClass(null);
    setForm(emptyForm());
    setShowForm(true);
  }

  function openEditForm(cls: AcademyLiveClassDto) {
    setEditingClass(cls);
    setForm({
      title: cls.title,
      scheduledAt: cls.scheduledAt ? new Date(cls.scheduledAt).toISOString().slice(0, 16) : emptyForm().scheduledAt,
      durationMinutes: cls.durationMinutes,
      meetingUrl: cls.meetingUrl,
      status: cls.status
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingClass(null);
    setForm(emptyForm());
  }

  async function handleSave() {
    if (!form.title.trim() || !form.scheduledAt || !form.meetingUrl.trim()) {
      setError('Title, scheduled time, and meeting URL are required.');
      return;
    }
    setSaving(true);
    setError('');

    const payload = {
      title: form.title.trim(),
      scheduledAt: new Date(form.scheduledAt).toISOString(),
      durationMinutes: Number(form.durationMinutes),
      meetingUrl: form.meetingUrl.trim(),
      status: form.status
    };

    try {
      if (editingClass) {
        await updateLiveClass(editingClass.id, payload);
        setSuccessMsg('Live class updated successfully!');
      } else {
        await createLiveClass(courseId, payload);
        setSuccessMsg('Live class created successfully!');
      }
      closeForm();
      loadClasses();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e: any) {
      setError(e.message || 'Failed to save live class');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deletingId) return;
    setSaving(true);
    try {
      await deleteLiveClass(deletingId);
      setSuccessMsg('Live class deleted successfully.');
      setDeletingId(null);
      loadClasses();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e: any) {
      setError(e.message || 'Failed to delete live class');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/instructor/courses" className="text-slate-400 hover:text-white transition-colors">
              Courses
            </Link>
            <span className="text-slate-600">/</span>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Video className="h-6 w-6 text-indigo-400" />
              Live Classes Manager
            </h1>
          </div>
          <p className="text-slate-400 mt-2">Schedule and manage live sessions for your students.</p>
        </div>
        <button
          onClick={openCreateForm}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
        >
          <Plus className="h-5 w-5" /> Add Live Class
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-rose-500/50 bg-rose-500/10 text-rose-400 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}
      {successMsg && (
        <div className="p-4 rounded-xl border border-emerald-500/50 bg-emerald-500/10 text-emerald-400 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{successMsg}</p>
        </div>
      )}

      {/* Main Content Area */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : liveClasses.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
              <Video className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-white">No live classes scheduled</h3>
            <p className="text-slate-400 mt-2">Create your first live session to engage your students in real-time.</p>
            <button onClick={openCreateForm} className="mt-6 text-indigo-400 font-bold hover:text-indigo-300">
              + Schedule Live Class
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {liveClasses.map((cls) => (
              <div key={cls.id} className="p-6 hover:bg-slate-800/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-white truncate">{cls.title}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      cls.status === 'ongoing' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                      cls.status === 'completed' ? 'bg-slate-800 text-slate-400 border border-slate-700' :
                      'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {cls.status.charAt(0).toUpperCase() + cls.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      {new Date(cls.scheduledAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      {new Date(cls.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({cls.durationMinutes} min)
                    </div>
                    <div className="flex items-center gap-1.5 truncate max-w-[200px]" title={cls.meetingUrl}>
                      <LinkIcon className="h-4 w-4 shrink-0" />
                      <a href={cls.meetingUrl} target="_blank" rel="noopener noreferrer" className="truncate hover:text-indigo-400 hover:underline transition-colors">
                        {cls.meetingUrl}
                      </a>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditForm(cls)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    title="Edit Live Class"
                    aria-label={`Edit ${cls.title}`}
                  >
                    <Pencil className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setDeletingId(cls.id)}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    title="Delete Live Class"
                    aria-label={`Delete ${cls.title}`}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-6">
              {editingClass ? 'Edit Live Class' : 'Schedule Live Class'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1.5">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Q&A Session - Week 1"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1.5">Date & Time</label>
                  <input
                    type="datetime-local"
                    value={form.scheduledAt}
                    onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    title="Date & Time"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1.5">Duration (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    value={form.durationMinutes}
                    onChange={(e) => setForm({ ...form, durationMinutes: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    title="Duration (minutes)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1.5">Meeting URL</label>
                <input
                  type="url"
                  value={form.meetingUrl}
                  onChange={(e) => setForm({ ...form, meetingUrl: e.target.value })}
                  placeholder="e.g. https://meet.google.com/abc-defg-hij"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1.5">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  title="Status"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={closeForm}
                disabled={saving}
                className="flex-1 py-3 rounded-xl border border-slate-700 font-bold text-slate-300 hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white transition-colors disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg shadow-indigo-500/20"
              >
                {saving && <Loader2 className="h-5 w-5 animate-spin" />}
                {editingClass ? 'Update Class' : 'Schedule Class'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 rounded-2xl border border-rose-500/20 shadow-2xl p-6">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4">
              <Trash2 className="h-6 w-6 text-rose-400" />
            </div>
            <h2 className="text-lg font-bold text-white">Delete Live Class?</h2>
            <p className="mt-2 text-sm text-slate-400">
              This will permanently remove the live class from the student dashboard. <strong className="text-rose-400">This cannot be undone.</strong>
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeletingId(null)}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-sm font-semibold text-slate-300 hover:text-white transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-sm font-bold text-white transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
