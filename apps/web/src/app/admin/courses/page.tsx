'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Plus, Trash2, Eye, EyeOff, Loader2, Search, AlertCircle, Users, DollarSign } from 'lucide-react';
import { getSessionJwt } from '../../../lib/sessionJwt';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = await getSessionJwt();
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);
  const [deletingLoading, setDeletingLoading] = useState(false);

  const loadCourses = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchWithAuth(`${API_BASE}/academy/instructor/courses`);
      setCourses(data.courses || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleTogglePublish = async (course: any) => {
    try {
      await fetchWithAuth(`${API_BASE}/academy/courses/${course.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isPublished: !course.isPublished }),
      });
      setCourses(prev => prev.map(c => c.id === course.id ? { ...c, isPublished: !c.isPublished } : c));
    } catch (err: any) {
      setError(err.message || 'Failed to toggle publish status.');
    }
  };

  const handleDeleteCourse = async () => {
    if (!deletingCourseId) return;
    setDeletingLoading(true);
    try {
      await fetchWithAuth(`${API_BASE}/academy/courses/${deletingCourseId}`, {
        method: 'DELETE',
      });
      setCourses(prev => prev.filter(c => c.id !== deletingCourseId));
      setDeletingCourseId(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete course.');
    } finally {
      setDeletingLoading(false);
    }
  };

  const filteredCourses = courses.filter(c =>
    c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.instructorName?.toLowerCase().includes(search.toLowerCase()) ||
    c.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Course Manager</h1>
          <p className="text-slate-400 text-sm mt-1">View, publish, and manage all academy courses. Use the Instructor portal to create and edit course content.</p>
        </div>
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500/50 transition-colors"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto text-rose-400 hover:text-rose-300">✕</button>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Courses', value: courses.length, icon: BookOpen, color: 'indigo' },
          { label: 'Published', value: courses.filter(c => c.isPublished).length, icon: Eye, color: 'emerald' },
          { label: 'Drafts', value: courses.filter(c => !c.isPublished).length, icon: EyeOff, color: 'slate' },
          { label: 'Free Courses', value: courses.filter(c => !c.price || c.price === 0).length, icon: DollarSign, color: 'cyan' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl border border-white/5 bg-slate-900/30 p-4">
            <div className={`text-${color}-400 mb-2`}><Icon className="h-5 w-5" /></div>
            <div className="text-2xl font-black text-white">{value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Courses Table */}
      <div className="rounded-3xl border border-white/5 bg-slate-900/20 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs font-bold uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">Course</th>
                <th className="px-6 py-4">Instructor</th>
                <th className="px-6 py-4">Lessons</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-rose-500 mb-4" />
                    Loading courses...
                  </td>
                </tr>
              ) : filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    {search ? 'No courses match your search.' : 'No courses found. Create one via the Instructor portal.'}
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-bold text-white">{course.title}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{course.category} · {course.level}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{course.instructorName}</td>
                    <td className="px-6 py-4 font-bold text-slate-300">{course.lessonCount || 0}</td>
                    <td className="px-6 py-4 text-slate-300">
                      {course.price === 0 || !course.price ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Free</span>
                      ) : (
                        <span className="font-bold">${course.price}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleTogglePublish(course)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-colors ${
                          course.isPublished
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                      >
                        {course.isPublished ? <><Eye className="h-3 w-3" /> Published</> : <><EyeOff className="h-3 w-3" /> Draft</>}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/courses/${course.id}/curriculum`}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-400 border border-rose-500/20 hover:bg-rose-500/10 transition-colors"
                        >
                          Curriculum
                        </Link>
                        <button
                          onClick={() => setDeletingCourseId(course.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors"
                          title="Delete course"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingCourseId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 rounded-2xl border border-rose-500/20 shadow-2xl p-6">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4">
              <Trash2 className="h-6 w-6 text-rose-400" />
            </div>
            <h2 className="text-lg font-bold text-white">Delete Course?</h2>
            <p className="mt-2 text-sm text-slate-400">
              This will permanently delete the course along with all lessons, assignments, submissions, and student enrollments. <strong className="text-rose-400">This cannot be undone.</strong>
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeletingCourseId(null)}
                disabled={deletingLoading}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-sm font-semibold text-slate-300 hover:text-white transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCourse}
                disabled={deletingLoading}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-sm font-bold text-white transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deletingLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
