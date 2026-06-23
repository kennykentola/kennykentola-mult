'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  deleteCourse,
  createAssignment,
  getCourseModules,
  createModule,
  deleteModule,
  uploadVideo
} from '../../../features/instructor/instructorService';
import { fetchCourseQuizzes, createQuiz, deleteQuiz } from '../../../features/academy/api';

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

async function getModulesForCourse(courseId: string) {
  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    const res = await fetch(`${API_BASE}/academy/courses/${courseId}/modules`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.modules || [];
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
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [courseLessons, setCourseLessons] = useState<Record<string, any[]>>({});
  const [courseModules, setCourseModules] = useState<Record<string, any[]>>({});
  const [courseAssignments, setCourseAssignments] = useState<Record<string, any[]>>({});
  const [courseQuizzes, setCourseQuizzes] = useState<Record<string, any[]>>({});
  
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
    moduleId: '',
    title: '',
    content: '',
    videoUrl: '',
    order: 1,
    durationMinutes: 15,
    isPreview: false
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const [showModuleModal, setShowModuleModal] = useState(false);
  const [moduleForm, setModuleForm] = useState({
    courseId: '',
    title: '',
    description: '',
    order: 1,
    isPublished: true
  });

  const [assignmentForm, setAssignmentForm] = useState({
    courseId: '',
    title: '',
    instructions: '',
    dueDate: '',
    maxPoints: 100
  });
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);

  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizForm, setQuizForm] = useState({
    courseId: '',
    moduleId: '',
    title: '',
    description: '',
    timeLimitMinutes: 30,
    passingScore: 70,
    questions: '[]'
  });

  const [submitting, setSubmitting] = useState(false);
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);

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
      const [lessons, assignments, modules, quizzesRes] = await Promise.all([
        getLessonsForCourse(courseId),
        getAssignmentsForCourse(courseId),
        getModulesForCourse(courseId),
        fetchCourseQuizzes(courseId).catch(() => ({ quizzes: [] }))
      ]);
      setCourseLessons(prev => ({ ...prev, [courseId]: lessons }));
      setCourseAssignments(prev => ({ ...prev, [courseId]: assignments }));
      setCourseModules(prev => ({ ...prev, [courseId]: modules }));
      setCourseQuizzes(prev => ({ ...prev, [courseId]: quizzesRes.quizzes || [] }));
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
      let finalVideoUrl = lessonForm.videoUrl;
      if (videoFile) {
        const res = await uploadVideo(videoFile);
        finalVideoUrl = res.url;
      }

      await createLesson(lessonForm.courseId, {
        title: lessonForm.title,
        content: lessonForm.content,
        videoUrl: finalVideoUrl,
        order: Number(lessonForm.order),
        durationMinutes: Number(lessonForm.durationMinutes),
        isPreview: lessonForm.isPreview,
        moduleId: lessonForm.moduleId || undefined
      });
      setShowLessonModal(false);
      setLessonForm({
        courseId: '',
        moduleId: '',
        title: '',
        content: '',
        videoUrl: '',
        order: 1,
        durationMinutes: 15,
        isPreview: false
      });
      setVideoFile(null);
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

  const handleDeleteCourse = async (courseId: string) => {
    setDeletingCourseId(null);
    try {
      await deleteCourse(courseId);
      setCourses(prev => prev.filter(c => c.id !== courseId));
      if (expandedCourse === courseId) setExpandedCourse(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete course.');
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

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await createModule(moduleForm.courseId, {
        title: moduleForm.title,
        description: moduleForm.description,
        order: Number(moduleForm.order),
        isPublished: moduleForm.isPublished
      });
      setShowModuleModal(false);
      setModuleForm({
        courseId: '',
        title: '',
        description: '',
        order: 1,
        isPublished: true
      });
      await loadCourseDetails(expandedCourse || moduleForm.courseId);
    } catch (err: any) {
      setError(err.message || 'Failed to add module.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Are you sure you want to delete this module?')) return;
    try {
      await deleteModule(moduleId);
      if (expandedCourse) {
        await loadCourseDetails(expandedCourse);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete module.');
    }
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await createQuiz(quizForm.courseId, {
        title: quizForm.title,
        description: quizForm.description,
        timeLimitMinutes: Number(quizForm.timeLimitMinutes),
        passingScore: Number(quizForm.passingScore),
        moduleId: quizForm.moduleId || undefined
      });
      setShowQuizModal(false);
      setQuizForm({
        courseId: '',
        moduleId: '',
        title: '',
        description: '',
        timeLimitMinutes: 30,
        passingScore: 70,
        questions: '[]'
      });
      await loadCourseDetails(expandedCourse || quizForm.courseId);
      
      // Redirect to the new quiz builder
      if (res && res.quiz) {
        router.push(`/instructor/courses/${quizForm.courseId}/quizzes/${res.quiz.$id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to add quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return;
    try {
      await deleteQuiz(quizId);
      if (expandedCourse) {
        await loadCourseDetails(expandedCourse);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete quiz.');
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
            const quizzes = courseQuizzes[course.id] || [];

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

                    <button
                      onClick={() => setDeletingCourseId(course.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors"
                      title="Delete course"
                    >
                      <Trash2 className="h-4 w-4" />
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

                    <div className="grid gap-6 md:grid-cols-1">
                      {/* Modules and Lessons Subsection */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                            <Video className="h-4 w-4 text-indigo-400" />
                            Curriculum ({lessons.length} lessons)
                          </h4>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setModuleForm(prev => ({ ...prev, courseId: course.id, order: (courseModules[course.id] || []).length + 1 }));
                                setShowModuleModal(true);
                              }}
                              className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                            >
                              <Plus className="h-3 w-3" /> Add Module
                            </button>
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
                        </div>

                        {lessons.length === 0 && (courseModules[course.id] || []).length === 0 ? (
                          <p className="text-xs text-slate-500 italic py-4">No curriculum added. Click Add Module or Add Lesson to start.</p>
                        ) : (
                          <div className="space-y-4 mt-4">
                            {/* Render Modules */}
                            {(courseModules[course.id] || []).map((module: any) => {
                              const moduleLessons = lessons.filter(l => l.moduleId === module.id).sort((a, b) => a.order - b.order);
                              return (
                                <div key={module.id} className="border border-white/10 bg-slate-900/50 rounded-xl overflow-hidden">
                                  <div className="flex items-center justify-between p-4 bg-slate-800/30 border-b border-white/5">
                                    <div>
                                      <h5 className="text-sm font-bold text-white">{module.order}. {module.title}</h5>
                                      {module.description && <p className="text-[10px] text-slate-400 mt-1">{module.description}</p>}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => {
                                          setLessonForm(prev => ({ ...prev, courseId: course.id, moduleId: module.id, order: moduleLessons.length + 1 }));
                                          setShowLessonModal(true);
                                        }}
                                        className="p-1.5 text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                                        title="Add Lesson to Module"
                                      >
                                        <Plus className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteModule(module.id)}
                                        className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                        title="Delete Module"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                  <div className="p-2 space-y-1">
                                    {moduleLessons.length === 0 ? (
                                      <p className="text-xs text-slate-500 italic p-3 text-center">No lessons in this module.</p>
                                    ) : (
                                      moduleLessons.map((lesson: any) => (
                                        <div key={lesson.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 text-xs transition-colors group">
                                          <div className="flex items-center gap-3">
                                            <span className="font-extrabold text-slate-550 w-5 text-right">{lesson.order}.</span>
                                            <Video className="h-4 w-4 text-slate-500 group-hover:text-indigo-400 transition-colors hidden sm:block" />
                                            <div>
                                              <div className="font-semibold text-white">{lesson.title}</div>
                                              <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                                                {lesson.durationMinutes || 0} mins {lesson.isPreview && '• Preview Available'}
                                              </div>
                                            </div>
                                          </div>
                                          <button onClick={() => handleDeleteLesson(lesson.id)} className="text-slate-500 hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity" title="Delete Lesson">
                                            <Trash2 className="h-3.5 w-3.5" />
                                          </button>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                </div>
                              );
                            })}

                            {/* Render Ungrouped Lessons */}
                            {lessons.filter(l => !l.moduleId).length > 0 && (
                              <div className="border border-white/10 bg-slate-900/50 rounded-xl overflow-hidden mt-4">
                                <div className="p-3 bg-slate-800/30 border-b border-white/5">
                                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ungrouped Lessons</h5>
                                </div>
                                <div className="p-2 space-y-1">
                                  {lessons.filter(l => !l.moduleId).sort((a, b) => a.order - b.order).map((lesson: any) => (
                                    <div key={lesson.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 text-xs transition-colors group">
                                      <div className="flex items-center gap-3">
                                        <span className="font-extrabold text-slate-550 w-5 text-right">{lesson.order}.</span>
                                        <Video className="h-4 w-4 text-slate-500 group-hover:text-indigo-400 transition-colors hidden sm:block" />
                                        <div>
                                          <div className="font-semibold text-white">{lesson.title}</div>
                                          <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                                            {lesson.durationMinutes || 0} mins {lesson.isPreview && '• Preview Available'}
                                          </div>
                                        </div>
                                      </div>
                                      <button onClick={() => handleDeleteLesson(lesson.id)} className="text-slate-500 hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity" title="Delete Lesson">
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
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

                      {/* Quizzes Subsection */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                            <FileCheck className="h-4 w-4 text-teal-400" />
                            Quizzes ({quizzes.length})
                          </h4>
                          <button
                            onClick={() => {
                              setQuizForm(prev => ({ ...prev, courseId: course.id }));
                              setShowQuizModal(true);
                            }}
                            className="text-[10px] font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1"
                          >
                            <Plus className="h-3 w-3" /> Add Quiz
                          </button>
                        </div>

                        {quizzes.length === 0 ? (
                          <div className="p-4 rounded-xl border border-dashed border-white/10 bg-slate-900/30 text-xs font-semibold text-slate-500 text-center">
                            No quizzes yet.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {quizzes.map((quiz: any) => (
                              <div key={quiz.$id} className="p-3 rounded-xl border border-white/5 bg-slate-900/30 text-xs flex justify-between items-center group transition-colors hover:border-indigo-500/30">
                                <div>
                                  <div className="font-semibold text-white">{quiz.title}</div>
                                  <div className="text-[10px] text-slate-500 font-medium mt-1">
                                    {quiz.timeLimitMinutes} mins • {quiz.passingScore}% to pass
                                  </div>
                                </div>
                                <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Link
                                    href={`/instructor/courses/${course.$id}/quizzes/${quiz.$id}`}
                                    className="flex items-center gap-1 text-[10px] font-bold text-indigo-400 hover:text-indigo-300"
                                  >
                                    <Edit className="h-3.5 w-3.5" /> Edit Quiz
                                  </Link>
                                  <button
                                    onClick={() => handleDeleteQuiz(quiz.$id)}
                                    title="Delete Quiz"
                                    aria-label="Delete Quiz"
                                    className="flex items-center gap-1 text-[10px] font-bold text-rose-400 hover:text-rose-300"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" /> Delete
                                  </button>
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
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Module (Optional)</label>
                <select
                  title="Select Module"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                  value={lessonForm.moduleId}
                  onChange={(e) => setLessonForm({ ...lessonForm, moduleId: e.target.value })}
                >
                  <option value="">-- No Module (Ungrouped) --</option>
                  {(courseModules[lessonForm.courseId] || []).map((m: any) => (
                    <option key={m.id} value={m.id}>{m.order}. {m.title}</option>
                  ))}
                </select>
              </div>

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
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Video Upload or Streaming URL</label>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="video/*"
                    title="Upload Video File"
                    aria-label="Upload Video File"
                    onChange={(e) => setVideoFile(e.target.files ? e.target.files[0] : null)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20"
                  />
                  <div className="flex items-center gap-4">
                    <div className="h-px bg-slate-800 flex-1"></div>
                    <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">OR ENTER URL</span>
                    <div className="h-px bg-slate-800 flex-1"></div>
                  </div>
                  <input
                    type="url"
                    title="Video Streaming URL"
                    aria-label="Video Streaming URL"
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 disabled:opacity-50"
                    value={lessonForm.videoUrl}
                    onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                    disabled={!!videoFile}
                  />
                </div>
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

      {/* Delete Course Confirmation Modal */}
      {deletingCourseId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 rounded-2xl border border-rose-500/20 shadow-2xl p-6">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4">
              <Trash2 className="h-6 w-6 text-rose-400" />
            </div>
            <h2 className="text-lg font-bold text-white">Delete Course?</h2>
            <p className="mt-2 text-sm text-slate-400">
              This will permanently delete the course, all its lessons, assignments, submissions, and enrollments. <strong className="text-rose-400">This cannot be undone.</strong>
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeletingCourseId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-sm font-semibold text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteCourse(deletingCourseId)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-sm font-bold text-white transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {showModuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowModuleModal(false)} />
          <div className="relative z-10 w-full max-w-lg glass-panel rounded-3xl p-8 border border-white/10 shadow-2xl bg-slate-900/90 backdrop-blur-md">
            <h3 className="text-xl font-bold text-white mb-6">Add Module</h3>
            <form onSubmit={handleCreateModule} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Module Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chapter 1: Introduction"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                  value={moduleForm.title}
                  onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Short Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Brief overview of what this module covers..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 resize-none"
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="module-order-input" className="text-xs font-semibold text-slate-400 block mb-1.5">Module Order</label>
                <input
                  id="module-order-input"
                  type="number"
                  min="1"
                  placeholder="1"
                  title="Module Order"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                  value={moduleForm.order}
                  onChange={(e) => setModuleForm({ ...moduleForm, order: Number(e.target.value) })}
                />
              </div>

              <div className="flex gap-4 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setShowModuleModal(false)}
                  className="rounded-xl border border-slate-850 px-5 py-2.5 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-xs font-bold text-white"
                >
                  {submitting ? 'Adding...' : 'Add Module'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Quiz Modal */}
      {showQuizModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowQuizModal(false)} />
          <div className="relative z-10 w-full max-w-lg glass-panel rounded-3xl p-8 border border-white/10 shadow-2xl bg-slate-900/90 backdrop-blur-md">
            <h3 className="text-xl font-bold text-white mb-6">Create Quiz</h3>
            <form onSubmit={handleCreateQuiz} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Quiz Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. End of Module 1 Quiz"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                  value={quizForm.title}
                  onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief description of the quiz..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 resize-none"
                  value={quizForm.description}
                  onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="quiz-time" className="text-xs font-semibold text-slate-400 block mb-1.5">Time Limit (mins)</label>
                  <input
                    id="quiz-time"
                    type="number"
                    min="1"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                    value={quizForm.timeLimitMinutes}
                    onChange={(e) => setQuizForm({ ...quizForm, timeLimitMinutes: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label htmlFor="quiz-passing" className="text-xs font-semibold text-slate-400 block mb-1.5">Passing Score (%)</label>
                  <input
                    id="quiz-passing"
                    type="number"
                    min="1"
                    max="100"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                    value={quizForm.passingScore}
                    onChange={(e) => setQuizForm({ ...quizForm, passingScore: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex gap-4 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setShowQuizModal(false)}
                  className="rounded-xl border border-slate-850 px-5 py-2.5 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-5 py-2.5 text-xs font-bold text-white"
                >
                  {submitting ? 'Creating...' : 'Create Quiz'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

