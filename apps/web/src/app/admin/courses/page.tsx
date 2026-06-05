'use client';

import React, { useState } from 'react';
import { BookOpen, Plus, Trash2, Edit2, Upload, FileText, ToggleLeft, ToggleRight } from 'lucide-react';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState([
    { id: 'nextjs-15', title: 'Full-Stack React & Next.js 15', price: '$0 (Free)', instructor: 'Kenny Kentola', enrolled: 18, isPublished: true },
    { id: 'python-django', title: 'Python & Django Backend Masterclass', price: '$0 (Free)', instructor: 'Sarah Jenkins', enrolled: 9, isPublished: true },
    { id: 'mobile-expo', title: 'React Native & Expo Go Mobile Development', price: '$199', instructor: 'Kenny Kentola', enrolled: 0, isPublished: false }
  ]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructor, setInstructor] = useState('Kenny Kentola');
  const [price, setPrice] = useState('$0 (Free)');
  const [isPublished, setIsPublished] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    const newCourse = {
      id: `course-${Date.now()}`,
      title,
      price,
      instructor,
      enrolled: 0,
      isPublished
    };
    setCourses([...courses, newCourse]);
    setTitle('');
    setDescription('');
    setPrice('$0 (Free)');
    setIsPublished(false);
    setShowAddForm(false);
  };

  const handleTogglePublish = (id: string) => {
    const updated = courses.map(c => {
      if (c.id === id) {
        return { ...c, isPublished: !c.isPublished };
      }
      return c;
    });
    setCourses(updated);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Course Manager</h1>
          <p className="text-slate-400 text-sm mt-1">Design course curriculums, configure lesson handouts, and manage student enrollments.</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="rounded-xl bg-gradient-to-r from-rose-500 to-orange-600 hover:opacity-90 transition-opacity px-5 py-3 text-xs font-bold text-white shadow flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Create Course Curriculum
        </button>
      </div>

      {/* Creation form */}
      {showAddForm && (
        <div className="glass-panel border border-white/10 bg-slate-900/40 rounded-2xl p-6 lg:p-8 animate-in fade-in duration-200">
          <h2 className="text-lg font-bold text-white mb-6">Create New Course</h2>
          <form onSubmit={handleCreateCourse} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="course-title-input" className="text-xs font-semibold text-slate-400 block mb-1.5">Course Title</label>
                <input
                  id="course-title-input"
                  title="Course Title"
                  type="text"
                  required
                  placeholder="e.g. Docker Fundamentals"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500/50 transition-colors"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="instructor-name-input" className="text-xs font-semibold text-slate-400 block mb-1.5">Instructor Name</label>
                <input
                  id="instructor-name-input"
                  title="Instructor Name"
                  placeholder="e.g. Kenny Kentola"
                  type="text"
                  required
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500/50 transition-colors"
                  value={instructor}
                  onChange={(e) => setInstructor(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="description-input" className="text-xs font-semibold text-slate-400 block mb-1.5">Description</label>
              <textarea
                id="description-input"
                title="Description"
                required
                rows={4}
                placeholder="Detailed summary of the curriculum path, target audience, and syllabus..."
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500/50 transition-colors resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="price-input" className="text-xs font-semibold text-slate-400 block mb-1.5">Price / Tuition Cost</label>
                <input
                  id="price-input"
                  title="Price / Tuition Cost"
                  type="text"
                  required
                  placeholder="e.g. Free, $150"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500/50 transition-colors"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Cover Image (Optional)</label>
                <div className="flex items-center gap-3">
                  <button type="button" className="rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 px-4 py-2.5 text-xs text-slate-300 font-semibold flex items-center gap-2 transition-colors">
                    <Upload className="h-4 w-4" /> Cover JPG
                  </button>
                </div>
              </div>
              <div className="flex items-center pt-6">
                <button
                  type="button"
                  onClick={() => setIsPublished(!isPublished)}
                  className="flex items-center gap-2 text-xs font-semibold text-slate-300"
                >
                  {isPublished ? (
                    <ToggleRight className="h-6 w-6 text-rose-500" />
                  ) : (
                    <ToggleLeft className="h-6 w-6 text-slate-500" />
                  )}
                  Publish Immediately
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="rounded-xl bg-slate-900 hover:bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-400 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-rose-600 hover:bg-rose-500 px-5 py-2.5 text-xs font-semibold text-white transition-colors"
              >
                Create Course
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Courses List Table */}
      <div className="glass-panel border border-white/5 bg-slate-900/20 rounded-3xl p-6 lg:p-8 space-y-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Academy Courses Listing</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-900 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-4 px-4">Course Info</th>
                <th className="py-4 px-4">Instructor</th>
                <th className="py-4 px-4">Enrolled Students</th>
                <th className="py-4 px-4">Tuition Price</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/50">
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-slate-900/25 transition-colors">
                  <td className="py-4 px-4 font-semibold text-white">{course.title}</td>
                  <td className="py-4 px-4 text-slate-400">{course.instructor}</td>
                  <td className="py-4 px-4 font-bold text-slate-300">{course.enrolled}</td>
                  <td className="py-4 px-4 text-slate-400">{course.price}</td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => handleTogglePublish(course.id)}
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                        course.isPublished 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-450 border border-rose-500/20'
                      }`}
                    >
                      {course.isPublished ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button className="text-rose-450 hover:underline font-bold text-[10px]">
                      Manage Curriculum
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
