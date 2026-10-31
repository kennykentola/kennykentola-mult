'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  Loader2, 
  Search, 
  AlertCircle, 
  DollarSign, 
  Video,
  Pencil,
  Check,
  X,
  Sparkles,
  CheckCircle2,
  Layers
} from 'lucide-react';
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

interface CourseItem {
  id: string;
  title: string;
  description: string;
  instructorId?: string;
  instructorName?: string;
  category?: string;
  level?: string;
  summary?: string;
  coverImage?: string;
  price: number;
  isPublished: boolean;
  aiVideoEnabled?: boolean;
  lessonCount?: number;
}

const CATEGORY_OPTIONS = [
  'Programming',
  'Software Engineering',
  'Artificial Intelligence',
  'Mobile Development',
  'Design',
  'Development',
  'Data',
  'Business',
  'Productivity',
  'Cybersecurity'
];

const LEVEL_OPTIONS = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Beginner to Advanced'
];

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Delete modal state
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);
  const [deletingLoading, setDeletingLoading] = useState(false);

  // Edit / Create modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formSaving, setFormSaving] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    price: 0,
    category: 'Programming',
    level: 'Beginner',
    summary: '',
    description: '',
    coverImage: '',
    instructorName: '',
    isPublished: true,
    aiVideoEnabled: true
  });

  // Quick price inline edit state
  const [quickPriceId, setQuickPriceId] = useState<string | null>(null);
  const [quickPriceValue, setQuickPriceValue] = useState<string>('');
  const [quickPriceSaving, setQuickPriceSaving] = useState(false);

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

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleTogglePublish = async (course: CourseItem) => {
    try {
      await fetchWithAuth(`${API_BASE}/academy/courses/${course.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isPublished: !course.isPublished }),
      });
      setCourses(prev => prev.map(c => c.id === course.id ? { ...c, isPublished: !c.isPublished } : c));
      showSuccess(`"${course.title}" status changed to ${!course.isPublished ? 'Published' : 'Draft'}`);
    } catch (err: any) {
      setError(err.message || 'Failed to toggle publish status.');
    }
  };

  const handleDeleteCourse = async () => {
    if (!deletingCourseId) return;
    setDeletingLoading(true);
    try {
      await fetchWithAuth(`${API_BASE}/academy/admin/courses/${deletingCourseId}`, {
        method: 'DELETE',
      });
      setCourses(prev => prev.filter(c => c.id !== deletingCourseId));
      setDeletingCourseId(null);
      showSuccess('Course permanently deleted.');
    } catch (err: any) {
      setError(err.message || 'Failed to delete course.');
    } finally {
      setDeletingLoading(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (course: CourseItem) => {
    setIsEditing(true);
    setFormData({
      id: course.id,
      title: course.title || '',
      price: course.price ?? 0,
      category: course.category || 'Programming',
      level: course.level || 'Beginner',
      summary: course.summary || '',
      description: course.description || '',
      coverImage: course.coverImage || '',
      instructorName: course.instructorName || '',
      isPublished: Boolean(course.isPublished),
      aiVideoEnabled: course.aiVideoEnabled ?? true
    });
    setModalOpen(true);
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormData({
      id: '',
      title: '',
      price: 100000,
      category: 'Programming',
      level: 'Beginner',
      summary: '',
      description: '',
      coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800',
      instructorName: 'KennyKentola Academy',
      isPublished: true,
      aiVideoEnabled: true
    });
    setModalOpen(true);
  };

  // Save Modal Form (Create or Edit)
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSaving(true);
    setError('');

    try {
      const payload = {
        title: formData.title,
        price: Number(formData.price) || 0,
        category: formData.category,
        level: formData.level,
        summary: formData.summary,
        description: formData.description,
        coverImage: formData.coverImage,
        instructorName: formData.instructorName,
        isPublished: formData.isPublished,
        aiVideoEnabled: formData.aiVideoEnabled
      };

      if (isEditing) {
        const res = await fetchWithAuth(`${API_BASE}/academy/courses/${formData.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        const updatedCourse = res.course || { ...payload, id: formData.id };
        setCourses(prev => prev.map(c => c.id === formData.id ? { ...c, ...updatedCourse, price: payload.price } : c));
        showSuccess(`Course "${formData.title}" updated successfully! Price set to ₦${Number(payload.price).toLocaleString()}`);
      } else {
        const res = await fetchWithAuth(`${API_BASE}/academy/courses`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        const newCourse = res.course || { ...payload, id: res.course?.$id || Date.now().toString() };
        setCourses(prev => [newCourse, ...prev]);
        showSuccess(`New course "${formData.title}" created successfully!`);
      }

      setModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save course changes.');
    } finally {
      setFormSaving(false);
    }
  };

  // Inline Quick Price Edit
  const handleSaveQuickPrice = async (courseId: string) => {
    const numPrice = Number(quickPriceValue);
    if (isNaN(numPrice) || numPrice < 0) {
      setError('Please enter a valid price (minimum 0).');
      return;
    }

    setQuickPriceSaving(true);
    setError('');
    try {
      await fetchWithAuth(`${API_BASE}/academy/courses/${courseId}`, {
        method: 'PATCH',
        body: JSON.stringify({ price: numPrice }),
      });
      setCourses(prev => prev.map(c => c.id === courseId ? { ...c, price: numPrice } : c));
      setQuickPriceId(null);
      showSuccess(`Price updated to ₦${numPrice.toLocaleString()} successfully!`);
    } catch (err: any) {
      setError(err.message || 'Failed to update price.');
    } finally {
      setQuickPriceSaving(false);
    }
  };

  const filteredCourses = courses.filter(c => {
    const matchesSearch = 
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.instructorName?.toLowerCase().includes(search.toLowerCase()) ||
      c.category?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'All' || c.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Academy Courses & Pricing</h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Admin & Superhero Console
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Manage course pricing (₦ NGN), course titles, descriptions, curriculum, and publication statuses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-bold text-sm shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] transition-all"
          >
            <Plus className="h-4 w-4" />
            Add New Course
          </button>
        </div>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="ml-auto text-emerald-400 hover:text-emerald-300">✕</button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-3 animate-in fade-in">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto text-rose-400 hover:text-rose-300">✕</button>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Courses', value: courses.length, icon: BookOpen, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
          { label: 'Published', value: courses.filter(c => c.isPublished).length, icon: Eye, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Drafts', value: courses.filter(c => !c.isPublished).length, icon: EyeOff, color: 'text-slate-400 bg-slate-800 border-slate-700' },
          { label: 'Free Courses', value: courses.filter(c => !c.price || c.price === 0).length, icon: DollarSign, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-md p-4">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${color} mb-3`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="text-2xl font-black text-white">{value}</div>
            <div className="text-xs text-slate-400 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/30 p-3 rounded-2xl border border-white/5">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by title, instructor, or category..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-500 whitespace-nowrap pl-2">Filter:</span>
          {['All', 'Programming', 'Artificial Intelligence', 'Mobile Development', 'Design'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                categoryFilter === cat 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-slate-800/60 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Table */}
      <div className="rounded-3xl border border-white/5 bg-slate-900/20 overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs font-bold uppercase text-slate-400 border-b border-white/5">
              <tr>
                <th className="px-6 py-4">Course</th>
                <th className="px-6 py-4">Instructor</th>
                <th className="px-6 py-4">Lessons</th>
                <th className="px-6 py-4">Price (₦ NGN)</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-500">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-500 mb-4" />
                    Loading courses and pricing...
                  </td>
                </tr>
              ) : filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-500">
                    <p className="text-base text-slate-400 font-medium">No courses found matching your criteria.</p>
                    <button 
                      onClick={() => { setSearch(''); setCategoryFilter('All'); }}
                      className="mt-2 text-indigo-400 hover:text-indigo-300 text-sm font-semibold"
                    >
                      Clear filters
                    </button>
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course) => {
                  const isQuickEditing = quickPriceId === course.id;
                  const priceNum = Number(course.price || 0);

                  return (
                    <tr key={course.id} className="hover:bg-slate-800/30 transition-colors">
                      {/* Course Title & Category */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {course.coverImage ? (
                            <img 
                              src={course.coverImage} 
                              alt={course.title} 
                              className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0" 
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center shrink-0">
                              <BookOpen className="w-6 h-6 text-slate-500" />
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-white text-base leading-snug">{course.title}</div>
                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                              <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300">
                                {course.category || 'General'}
                              </span>
                              <span>·</span>
                              <span>{course.level || 'All Levels'}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Instructor */}
                      <td className="px-6 py-4 text-slate-300 font-medium">
                        {course.instructorName || 'KennyKentola Academy'}
                      </td>

                      {/* Lessons Count */}
                      <td className="px-6 py-4 font-bold text-slate-200">
                        {course.lessonCount || 0}
                      </td>

                      {/* Price & Quick Price Editor */}
                      <td className="px-6 py-4">
                        {isQuickEditing ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-slate-400">₦</span>
                            <input
                              type="number"
                              min="0"
                              value={quickPriceValue}
                              onChange={(e) => setQuickPriceValue(e.target.value)}
                              className="w-28 px-2 py-1 bg-slate-950 border border-indigo-500 rounded-lg text-sm text-white font-bold focus:outline-none"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveQuickPrice(course.id);
                                if (e.key === 'Escape') setQuickPriceId(null);
                              }}
                            />
                            <button
                              onClick={() => handleSaveQuickPrice(course.id)}
                              disabled={quickPriceSaving}
                              className="p-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
                              title="Save Price"
                            >
                              {quickPriceSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => setQuickPriceId(null)}
                              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            {priceNum === 0 ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                Free
                              </span>
                            ) : (
                              <span className="font-extrabold text-white text-base">
                                ₦{priceNum.toLocaleString()}
                              </span>
                            )}
                            <button
                              onClick={() => {
                                setQuickPriceId(course.id);
                                setQuickPriceValue(String(priceNum));
                              }}
                              className="p-1 text-slate-500 hover:text-indigo-400 rounded transition-colors"
                              title="Quick edit price"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleTogglePublish(course)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                            course.isPublished
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                          }`}
                        >
                          {course.isPublished ? <><Eye className="h-3 w-3" /> Published</> : <><EyeOff className="h-3 w-3" /> Draft</>}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(course)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/10 transition-colors inline-flex items-center gap-1"
                            title="Edit course details & price"
                          >
                            <Pencil className="h-3 w-3" /> Edit
                          </button>
                          <Link
                            href={`/admin/courses/${course.id}/curriculum`}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-400 border border-rose-500/20 hover:bg-rose-500/10 transition-colors inline-flex items-center gap-1"
                          >
                            <Layers className="h-3 w-3" /> Curriculum
                          </Link>
                          <Link
                            href={`/admin/courses/${course.id}/live-classes`}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-sky-400 border border-sky-500/20 hover:bg-sky-500/10 transition-colors whitespace-nowrap inline-flex items-center gap-1"
                          >
                            <Video className="h-3 w-3" /> Live
                          </Link>
                          <button
                            onClick={() => setDeletingCourseId(course.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors"
                            title="Delete course"
                            aria-label={`Delete ${course.title}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Create Course Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 rounded-3xl border border-indigo-500/20 shadow-2xl p-6 sm:p-8 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {isEditing ? 'Edit Course & Pricing' : 'Create New Academy Course'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isEditing ? `Modifying: ${formData.title}` : 'Add a brand new course to the catalog.'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-5 mt-6">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Course Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Full-Stack Web Development Bootcamp"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Price & Category Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Price (₦ Nigerian Naira) <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">₦</span>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      placeholder="100000"
                      className="w-full pl-8 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm font-bold focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Enter 0 for Free course.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                  >
                    {CATEGORY_OPTIONS.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Level & Instructor Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                  >
                    {LEVEL_OPTIONS.map(lvl => (
                      <option key={lvl} value={lvl}>{lvl}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Instructor Name
                  </label>
                  <input
                    type="text"
                    value={formData.instructorName}
                    onChange={(e) => setFormData({ ...formData, instructorName: e.target.value })}
                    placeholder="KennyKentola Academy"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Cover Image URL */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Short Summary */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Short Summary
                </label>
                <input
                  type="text"
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="A quick one-line summary of what students will achieve"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Detailed Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Full Description <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Full course details, syllabus overview, and prerequisites..."
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="inline-flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-500 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-semibold text-slate-300">Publish immediately</span>
                </label>

                <label className="inline-flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.aiVideoEnabled}
                    onChange={(e) => setFormData({ ...formData, aiVideoEnabled: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-500 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-semibold text-slate-300">Enable AI Video Generator</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-700 text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSaving}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-sm font-bold text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)]"
                >
                  {formSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isEditing ? 'Save Changes' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCourseId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 rounded-2xl border border-rose-500/20 shadow-2xl p-6">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4">
              <Trash2 className="h-6 w-6 text-rose-400" />
            </div>
            <h2 className="text-lg font-bold text-white">Delete Course?</h2>
            <p className="mt-2 text-sm text-slate-400">
              This will permanently delete the course along with all lessons, assignments, and enrollments. <strong className="text-rose-400">This cannot be undone.</strong>
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
