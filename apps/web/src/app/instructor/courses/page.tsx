'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  BookOpen, 
  Video, 
  FileCheck, 
  Trash2, 
  Edit, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  EyeOff, 
  DollarSign, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { 
  getInstructorCourses, 
  createCourse, 
  updateCourse, 
  createLesson, 
  updateLesson, 
  deleteLesson, 
  createAssignment 
} from '../../../features/instructor/instructorService';

// Fallback loader for lesson list
async function getLessonsForCourse(courseId: string) {
  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    const res = await fetch(`${API_BASE}/academy/courses/${courseId}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.lessons || [];
  } catch {
    return [];
  }
}

async function getAssignmentsForCourse(courseId: string) {
  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    const res = await fetch(`${API_BASE}/academy/courses/${courseId}/assignments`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.assignments || [];
  } catch {
    return [];
  }
}

export default function CourseManager() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [courseLessons, setCourseLessons] = useState<Record<string, any[]>>({});
  const [courseAssignments, setCourseAssignments] = useState<Record<string, any[]>>({});
  
  // Modals / Form States
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    category: 'Software Engineering',
    level: 'Beginner',
    summary: '',
    price: 0,
    isPublished: false
  });

  const [showLessonModal, setShowLessonModal] = useState(false);
  const [lessonForm, setLessonForm] = useState({
    courseId: '',
    title: '',
    content: '',
    videoUrl: '',
    order: 1,
    durationMinutes: 15,
    isPreview: false
  });

  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({
    courseId: '',
    title: '',
    instructions: '',
    dueDate: '',
    maxPoints: 100
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await getInstructorCourses();
      setCourses(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load courses.');
    } finally {
      setLoading(false);
    }
  };

  const loadCourseDetails = async (courseId: string) => {
    try {
      const [lessons, assignments] = await Promise.all([
        getLessonsForCourse(courseId),
        getAssignmentsForCourse(courseId)
      ]);
      setCourseLessons(prev => ({ ...prev, [courseId]: lessons }));
      setCourseAssignments(prev => ({ ...prev, [courseId]: assignments }));
    } catch (err) {
      console.error('Failed to load lessons or assignments', err);
    }
  };

  const handleToggleCourse = async (courseId: string) => {
    if (expandedCourse === courseId) {
      setExpandedCourse(null);
    } else {
      setExpandedCourse(courseId);
      if (!courseLessons[courseId]) {
        await loadCourseDetails(courseId);
      }
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await createCourse({
        ...courseForm,
        coverImage: `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop`
      });
      setShowCourseModal(false);
      setCourseForm({
        title: '',
        description: '',
        category: 'Software Engineering',
        level: 'Beginner',
        summary: '',
        price: 0,
        isPublished: false
      });
      await loadCourses();
    } catch (err: any) {
      setError(err.message || 'Failed to create course.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePublish = async (course: any) => {
    try {
      const updated = await updateCourse(course.id, {
        isPublished: !course.isPublished
      });
      setCourses(courses.map(c => c.id === course.id ? { ...c, isPublished: updated.isPublished } : c));
    } catch (err: any) {
      alert(err.message || 'Failed to toggle publication status.');
    }
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await createLesson(lessonForm.courseId, {
        title: lessonForm.title,
        content: lessonForm.content,
        videoUrl: lessonForm.videoUrl,
        order: Number(lessonForm.order),
        durationMinutes: Number(lessonForm.durationMinutes),
        isPreview: lessonForm.isPreview
      });
      setShowLessonModal(false);
      setLessonForm({
        courseId: '',
        title: '',
        content: '',
        videoUrl: '',
        order: 1,
        durationMinutes: 15,
        isPreview: false
      });
      await loadCourseDetails(expandedCourse || lessonForm.courseId);
      await loadCourses();
    } catch (err: any) {
      setError(err.message || 'Failed to add lesson.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;
    try {
      await deleteLesson(lessonId);
      if (expandedCourse) {
        await loadCourseDetails(expandedCourse);
        await loadCourses();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete lesson.');
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await createAssignment(assignmentForm.courseId, {
        title: assignmentForm.title,
        instructions: assignmentForm.instructions,
        dueDate: assignmentForm.dueDate,
        maxPoints: Number(assignmentForm.maxPoints)
      });
      setShowAssignmentModal(false);
      setAssignmentForm({
        courseId: '',
        title: '',
        instructions: '',
        dueDate: '',
        maxPoints: 100
      });
      await loadCourseDetails(expandedCourse || assignmentForm.courseId);
    } catch (err: any) {
      setError(err.message || 'Failed to add assignment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Course Manager</h1>
          <p className="text-slate-400 text-sm mt-1">Design curricula, arrange modules, publish lessons, and define course pricing.</p>
        </div>
        <button
          onClick={() => setShowCourseModal(true)}
          className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-650 hover:opacity-90 transition-opacity text-white px-5 py-3 text-xs font-bold flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create New Course
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm animate-pulse">Loading courses...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-3xl border border-white/5 bg-slate-900/20 max-w-lg mx-auto">
          <BookOpen className="h-16 w-16 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white">No courses created yet</h3>
          <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto px-6">
            Get started by creating your first course, where you can then build lessons, add streaming video links, and issue certificates.
          </p>
          <button
            onClick={() => setShowCourseModal(true)}
            className="mt-6 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20 px-6 py-2.5 text-xs font-semibold"
          >
            Create Course
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => {
            const isExpanded = expandedCourse === course.id;
            const lessons = courseLessons[course.id] || [];
            const assignments = courseAssignments[course.id] || [];

            return (
              <div key={course.id} className="glass-panel border border-white/5 bg-slate-900/10 rounded-2xl overflow-hidden transition-all duration-200">
                {/* Accordion Trigger Header */}
                <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-900/30 cursor-pointer" onClick={() => handleToggleCourse(course.id)}>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{course.title}</h3>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400 font-semibold">
                        <span>{course.category}</span>
                        <span>•</span>
                        <span>{course.level}</span>
                        <span>•</span>
                        <span>{course.lessonCount || 0} Lessons</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-auto" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleTogglePublish(course)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-colors ${
                        course.isPublished
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {course.isPublished ? (
                        <>
                          <Eye className="h-3 w-3" />
                          Published
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3 w-3" />
                          Draft
                        </>
                      )}
                    </button>

                    <div className="text-slate-400 hover:text-white transition-colors cursor-pointer" onClick={() => handleToggleCourse(course.id)}>
                      {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </div>
                  </div>
                </div>

                {/* Accordion Body details */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 border-t border-white/5 bg-slate-950/20 space-y-6">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Description</h4>
                      <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">{course.description}</p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Lessons Subsection */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                            <Video className="h-4 w-4 text-indigo-400" />
                            Curriculum ({lessons.length} lessons)
                          </h4>
                          <button
                            onClick={() => {
                              setLessonForm(prev => ({ ...prev, courseId: course.id, order: lessons.length + 1 }));
                              setShowLessonModal(true);
                            }}
                            className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                          >
                            <Plus className="h-3 w-3" /> Add Lesson
                          </button>
                        </div>

                        {lessons.length === 0 ? (
                          <p className="text-xs text-slate-500 italic py-4">No lessons added. Click Add Lesson to add content.</p>
                        ) : (
                          <div className="space-y-2">
                            {lessons.map((lesson: any) => (
                              <div key={lesson.id} className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-slate-900/30 text-xs">
                                <div className="flex items-center gap-3">
                                  <span className="font-extrabold text-slate-550 w-5 text-right">{lesson.order}.</span>
                                  <div>
                                    <div className="font-semibold text-white">{lesson.title}</div>
                                    <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                                      {lesson.durationMinutes || 0} mins {lesson.isPreview && '• Preview Available'}
                                    </div>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleDeleteLesson(lesson.id)}
                                  className="text-slate-500 hover:text-rose-455 transition-colors p-1"
                                  title="Delete Lesson"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Assignments Subsection */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                            <FileCheck className="h-4 w-4 text-purple-400" />
                            Assignments ({assignments.length})
                          </h4>
                          <button
                            onClick={() => {
                              setAssignmentForm(prev => ({ ...prev, courseId: course.id }));
                              setShowAssignmentModal(true);
                            }}
                            className="text-[10px] font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
                          >
                            <Plus className="h-3 w-3" /> Add Assignment
                          </button>
                        </div>

                        {assignments.length === 0 ? (
                          <p className="text-xs text-slate-500 italic py-4">No assignments defined yet.</p>
                        ) : (
                          <div className="space-y-2">
                            {assignments.map((assignment: any) => (
                              <div key={assignment.id} className="p-3 rounded-xl border border-white/5 bg-slate-900/30 text-xs space-y-1">
                                <div className="flex justify-between font-semibold text-white">
                                  <span>{assignment.title}</span>
                                  <span className="text-[10px] text-slate-450">{assignment.maxPoints} pts</span>
                                </div>
                                <div className="text-[10px] text-slate-500 font-medium">
                                  Due: {new Date(assignment.dueDate).toLocaleDateString()}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Course Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowCourseModal(false)} />
          <div className="relative z-10 w-full max-w-lg glass-panel rounded-3xl p-8 border border-white/10 shadow-2xl bg-slate-900/90 backdrop-blur-md">
            <h3 className="text-xl font-bold text-white mb-6">Create New Course</h3>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Course Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master React Hooks and Suspense"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Course Category</label>
                <select
                  title="Course Category"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                  value={courseForm.category}
                  onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                >
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Mobile Development">Mobile Development</option>
                  <option value="Graphics Design">Graphics Design</option>
                  <option value="Computer Operations">Computer Operations</option>
                  <option value="Solar Installation">Solar Installation</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">Difficulty Level</label>
                  <select
                    title="Difficulty Level"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                    value={courseForm.level}
                    onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="course-price-input" className="text-xs font-semibold text-slate-400 block mb-1.5">Pricing (₦ / NGN)</label>
                  <input
                    id="course-price-input"
                    type="number"
                    min="0"
                    placeholder="0"
                    title="Price in NGN"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/55"
                    value={courseForm.price}
                    onChange={(e) => setCourseForm({ ...courseForm, price: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Short Summary</label>
                <input
                  type="text"
                  required
                  placeholder="One sentence summary of who this course is for"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                  value={courseForm.summary}
                  onChange={(e) => setCourseForm({ ...courseForm, summary: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Detailed Description</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detailed course description, syllabus, prerequisites..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 resize-none"
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                />
              </div>

              <div className="flex gap-4 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="rounded-xl border border-slate-850 px-5 py-2.5 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-650 px-5 py-2.5 text-xs font-bold text-white"
                >
                  {submitting ? 'Creating...' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lesson Modal */}
      {showLessonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowLessonModal(false)} />
          <div className="relative z-10 w-full max-w-lg glass-panel rounded-3xl p-8 border border-white/10 shadow-2xl bg-slate-900/90 backdrop-blur-md">
            <h3 className="text-xl font-bold text-white mb-6">Add Lesson</h3>
            <form onSubmit={handleCreateLesson} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Lesson Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Introduction to App Router"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="lesson-order-input" className="text-xs font-semibold text-slate-400 block mb-1.5">Lesson Order</label>
                  <input
                    id="lesson-order-input"
                    type="number"
                    min="1"
                    placeholder="1"
                    title="Lesson Order"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                    value={lessonForm.order}
                    onChange={(e) => setLessonForm({ ...lessonForm, order: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label htmlFor="lesson-duration-input" className="text-xs font-semibold text-slate-400 block mb-1.5">Duration (minutes)</label>
                  <input
                    id="lesson-duration-input"
                    type="number"
                    min="1"
                    placeholder="15"
                    title="Duration in Minutes"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                    value={lessonForm.durationMinutes}
                    onChange={(e) => setLessonForm({ ...lessonForm, durationMinutes: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Video Streaming URL (YouTube / Vimeo / Cloud link)</label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                  value={lessonForm.videoUrl}
                  onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Lesson Content / Code Snippets</label>
                <textarea
                  rows={4}
                  placeholder="Markdown contents, instructions, or code samples for the student..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 resize-none"
                  value={lessonForm.content}
                  onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  id="isPreview"
                  type="checkbox"
                  className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-indigo-500"
                  checked={lessonForm.isPreview}
                  onChange={(e) => setLessonForm({ ...lessonForm, isPreview: e.target.checked })}
                />
                <label htmlFor="isPreview" className="text-xs font-semibold text-slate-350">
                  Allow students to preview this lesson before enrolling/paying
                </label>
              </div>

              <div className="flex gap-4 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setShowLessonModal(false)}
                  className="rounded-xl border border-slate-850 px-5 py-2.5 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-gradient-to-r from-indigo-550 to-purple-650 px-5 py-2.5 text-xs font-bold text-white"
                >
                  {submitting ? 'Adding...' : 'Add Lesson'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowAssignmentModal(false)} />
          <div className="relative z-10 w-full max-w-lg glass-panel rounded-3xl p-8 border border-white/10 shadow-2xl bg-slate-900/90 backdrop-blur-md">
            <h3 className="text-xl font-bold text-white mb-6">Create Assignment</h3>
            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Assignment Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Build and Deploy a Next.js App Router Site"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                  value={assignmentForm.title}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="assignment-due-date" className="text-xs font-semibold text-slate-400 block mb-1.5">Due Date</label>
                  <input
                    id="assignment-due-date"
                    type="datetime-local"
                    required
                    placeholder="Due Date"
                    title="Due Date"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                    value={assignmentForm.dueDate}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="assignment-max-points" className="text-xs font-semibold text-slate-400 block mb-1.5">Max Points</label>
                  <input
                    id="assignment-max-points"
                    type="number"
                    min="1"
                    placeholder="100"
                    title="Max Points"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                    value={assignmentForm.maxPoints}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, maxPoints: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Instructions</label>
                <textarea
                  rows={6}
                  required
                  placeholder="Outline the steps the student needs to follow, submission format, and grading rubric..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 resize-none"
                  value={assignmentForm.instructions}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, instructions: e.target.value })}
                />
              </div>

              <div className="flex gap-4 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setShowAssignmentModal(false)}
                  className="rounded-xl border border-slate-850 px-5 py-2.5 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-650 px-5 py-2.5 text-xs font-bold text-white"
                >
                  {submitting ? 'Creating...' : 'Create Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
