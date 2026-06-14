'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  Lock,
  MessageSquare,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Upload,
  Video
} from 'lucide-react';
import { useAuth } from '../../../../features/auth/AuthContext';
import {
  AcademyAssignmentDto,
  AcademyCourseDetailResponse,
  AcademyEnrollmentDto,
  AcademyLessonDto,
  AcademyLiveClassDto,
  enrollInAcademyCourse,
  fetchAcademyAssignments,
  fetchAcademyCourse,
  fetchAcademyLiveClasses,
  fetchAcademyProgress,
  fetchMyAcademyAssignments,
  submitAcademyAssignment,
  updateAcademyCourseProgress,
  fetchLessonProgress,
  updateLessonProgress,
  LessonProgressDto,
  fetchCourseQuizzes,
  fetchMyQuizAttempts,
  submitQuizAttempt,
  QuizDto,
  QuizAttemptDto,
  submitTestimonial
} from '../../../../features/academy/api';
import { academyOverview, catalogCourses, enrolledCourses } from '../../../../features/academy/content';

type FallbackCourse = (typeof catalogCourses)[number] | (typeof enrolledCourses)[number];

type CourseTab = 'lessons' | 'assignments' | 'live' | 'quizzes';

function buildFallbackLessons(course: FallbackCourse): AcademyLessonDto[] {
  return [
    {
      id: `${course.id}-lesson-1`,
      courseId: course.id,
      title: `Introduction to ${course.title}`,
      content: `Set up the learning path for ${course.title} and understand the project goals.`,
      order: 1,
      durationMinutes: 24,
      isPreview: true
    },
    {
      id: `${course.id}-lesson-2`,
      courseId: course.id,
      title: `${course.title} Core Workflow`,
      content: `Build the core workflow and practice the implementation pattern for ${course.title}.`,
      order: 2,
      durationMinutes: 34,
      isPreview: false
    },
    {
      id: `${course.id}-lesson-3`,
      courseId: course.id,
      title: `Shipping ${course.title} in Production`,
      content: `Review deployment, refinement, and production-ready best practices for ${course.title}.`,
      order: 3,
      durationMinutes: 29,
      isPreview: false
    }
  ];
}

function buildFallbackAssignments(course: FallbackCourse): AcademyAssignmentDto[] {
  return [
    {
      id: `${course.id}-assignment-1`,
      courseId: course.id,
      title: `Complete the ${course.title} Feature Sprint`,
      instructions: `Build a polished mini-project around ${course.title}. Include a short write-up of your implementation choices.`,
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
      maxPoints: 100,
      submission: null
    }
  ];
}

function buildFallbackLiveClasses(course: FallbackCourse): AcademyLiveClassDto[] {
  return [
    {
      id: `${course.id}-live-1`,
      courseId: course.id,
      title: `${course.title} Live Clinic`,
      scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
      durationMinutes: 90,
      meetingUrl: 'https://meet.google.com',
      status: 'scheduled'
    }
  ];
}

function formatPrice(price: number) {
  return price === 0 ? 'Free' : `$${price}`;
}

function formatDateTime(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
}

export default function CourseDetailPage() {
  const params = useParams<{ courseId: string }>();
  const pathname = usePathname();
  const courseId = Array.isArray(params?.courseId) ? params?.courseId[0] : params?.courseId;
  const { profile } = useAuth();
  const portalBasePath = pathname?.startsWith('/student') ? '/student' : '/dashboard';

  const [courseData, setCourseData] = useState<AcademyCourseDetailResponse | null>(null);
  const [enrollment, setEnrollment] = useState<AcademyEnrollmentDto | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [assignments, setAssignments] = useState<AcademyAssignmentDto[]>([]);
  const [liveClasses, setLiveClasses] = useState<AcademyLiveClassDto[]>([]);
  const [lessonProgress, setLessonProgress] = useState<LessonProgressDto[]>([]);
  const [quizzes, setQuizzes] = useState<QuizDto[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttemptDto[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string>('');
  const [activeQuizAnswers, setActiveQuizAnswers] = useState<Record<number, number>>({});
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>('');
  const [assignmentFiles, setAssignmentFiles] = useState('');
  const [assignmentNote, setAssignmentNote] = useState('');
  const [activeTab, setActiveTab] = useState<CourseTab>('lessons');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showTestimonialModal, setShowTestimonialModal] = useState(false);
  const [testimonialRating, setTestimonialRating] = useState(5);
  const [testimonialContent, setTestimonialContent] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadCourse() {
      if (!courseId) return;

      setLoading(true);
      setError('');
      setSuccess('');

      const [courseResponse, progressResponse, assignmentsResponse, myAssignmentsResponse, liveClassesResponse, lessonProgressResponse, quizzesResponse, attemptsResponse] = await Promise.allSettled([
        fetchAcademyCourse(courseId),
        fetchAcademyProgress(),
        fetchAcademyAssignments(courseId),
        fetchMyAcademyAssignments(courseId),
        fetchAcademyLiveClasses(courseId),
        fetchLessonProgress(courseId),
        fetchCourseQuizzes(courseId),
        fetchMyQuizAttempts(courseId)
      ]);

      if (cancelled) return;

      let resolvedCourse: AcademyCourseDetailResponse | null = null;
      let resolvedEnrollment: AcademyEnrollmentDto | null = null;

      if (courseResponse.status === 'fulfilled') {
        resolvedCourse = courseResponse.value;
        setCourseData(courseResponse.value);
      }

      if (progressResponse.status === 'fulfilled') {
        resolvedEnrollment = progressResponse.value.enrollments.find((item) => item.courseId === courseId) || null;
        setEnrollment(resolvedEnrollment);
      }

      if (lessonProgressResponse.status === 'fulfilled') {
        setLessonProgress(lessonProgressResponse.value.lessonProgress);
      }

      if (quizzesResponse.status === 'fulfilled') {
        setQuizzes(quizzesResponse.value.quizzes);
      }
      if (attemptsResponse.status === 'fulfilled') {
        setQuizAttempts(attemptsResponse.value.attempts);
      }

      const fallbackCourse = [...catalogCourses, ...enrolledCourses].find((course) => course.id === courseId);

      if (!resolvedCourse && fallbackCourse) {
        const fallbackLessons = buildFallbackLessons(fallbackCourse);
        resolvedCourse = {
          course: {
            id: fallbackCourse.id,
            title: fallbackCourse.title,
            description: fallbackCourse.description,
            instructorId: 'local-fallback',
            instructorName: fallbackCourse.instructor,
            category: fallbackCourse.category,
            level: 'Beginner',
            summary: fallbackCourse.description,
            coverImage: '',
            price: typeof fallbackCourse.price === 'string' ? 0 : 0,
            isPublished: true,
            lessonCount: fallbackLessons.length
          },
          lessons: fallbackLessons
        };
        setCourseData(resolvedCourse);
      }

      if (assignmentsResponse.status === 'fulfilled') {
        setAssignments(assignmentsResponse.value.assignments);
      } else if (fallbackCourse) {
        setAssignments(buildFallbackAssignments(fallbackCourse));
      }

      if (myAssignmentsResponse.status === 'fulfilled') {
        const submissionMap = new Map(
          myAssignmentsResponse.value.assignments.map((assignment) => [assignment.id, assignment.submission || null])
        );
        setAssignments((current) =>
          current.map((assignment) => ({
            ...assignment,
            submission: submissionMap.get(assignment.id) ?? assignment.submission ?? null
          }))
        );
      }

      if (liveClassesResponse.status === 'fulfilled') {
        setLiveClasses(liveClassesResponse.value.liveClasses);
      } else if (fallbackCourse) {
        setLiveClasses(buildFallbackLiveClasses(fallbackCourse));
      }

      const startingLesson =
        resolvedEnrollment?.nextLesson?.id ||
        resolvedEnrollment?.lastLessonId ||
        resolvedCourse?.lessons[0]?.id ||
        '';

      setSelectedLessonId(startingLesson);
      setSelectedAssignmentId((assignmentsResponse.status === 'fulfilled' ? assignmentsResponse.value.assignments[0]?.id : buildFallbackAssignments(fallbackCourse || enrolledCourses[0])[0]?.id) || '');
      setSelectedQuizId((quizzesResponse.status === 'fulfilled' ? quizzesResponse.value.quizzes[0]?.$id : '') || '');

      if (courseResponse.status === 'rejected' && !fallbackCourse) {
        setError('Course not found.');
      }

      setLoading(false);
    }

    loadCourse();

    return () => {
      cancelled = true;
    };
  }, [courseId]);

  const lessons = courseData?.lessons || [];
  const selectedLesson = useMemo(
    () => lessons.find((lesson) => lesson.id === selectedLessonId) || lessons[0] || null,
    [lessons, selectedLessonId]
  );

  const selectedAssignment = useMemo(
    () => assignments.find((assignment) => assignment.id === selectedAssignmentId) || assignments[0] || null,
    [assignments, selectedAssignmentId]
  );

  const selectedQuiz = useMemo(
    () => quizzes.find((quiz) => quiz.$id === selectedQuizId) || quizzes[0] || null,
    [quizzes, selectedQuizId]
  );

  const selectedQuizAttempt = useMemo(
    () => selectedQuiz ? quizAttempts.find(a => a.quizId === selectedQuiz.$id) || null : null,
    [quizAttempts, selectedQuiz]
  );

  const completedCount = enrollment?.completedLessons || 0;
  const progressPercent =
    enrollment?.progress || (lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0);

  const selectedLessonIndex = selectedLesson ? lessons.findIndex((lesson) => lesson.id === selectedLesson.id) : -1;
  const isLessonCompleted = selectedLesson ? lessonProgress.some((p) => p.lessonId === selectedLesson.id && p.isCompleted) || (selectedLessonIndex >= 0 && selectedLessonIndex < completedCount) : false;
  const nextLesson = lessons[Math.min(completedCount, Math.max(lessons.length - 1, 0))] || null;
  const isEnrolled = Boolean(enrollment);
  const assignmentStatusLabel = selectedAssignment?.submission
    ? selectedAssignment.submission.status
    : 'Not submitted';

  const handleEnroll = async () => {
    if (!courseId) return;

    try {
      setActionLoading(true);
      setError('');
      const response = await enrollInAcademyCourse(courseId);
      setEnrollment(response.enrollment);
      setSuccess('You are now enrolled in this course.');
    } catch (err: any) {
      setError(err?.message || 'Unable to enroll in this course.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!courseId || !selectedLesson || !isEnrolled) return;

    try {
      setActionLoading(true);
      setError('');
      setSuccess('');

      await updateLessonProgress(selectedLesson.id, { courseId, isCompleted: true });
      setLessonProgress((prev) => {
        const exists = prev.find(p => p.lessonId === selectedLesson?.id);
        if (exists) return prev.map(p => p.lessonId === selectedLesson?.id ? { ...p, isCompleted: true } : p);
        return [...prev, { lessonId: selectedLesson.id, courseId, studentId: '', isCompleted: true }];
      });

      const newCompletedCount = lessonProgress.filter(p => p.isCompleted).length + (lessonProgress.some(p => p.lessonId === selectedLesson.id && p.isCompleted) ? 0 : 1);
      const nextCompletedLessons = Math.max(completedCount, selectedLessonIndex + 1, newCompletedCount);
      const updated = await updateAcademyCourseProgress(courseId, {
        progress: lessons.length ? Math.round((nextCompletedLessons / lessons.length) * 100) : 0,
        completedLessons: nextCompletedLessons,
        lastLessonId: selectedLesson.id
      });

      setEnrollment(updated.enrollment);

      const nextLessonIndex = Math.min(updated.enrollment.completedLessons, lessons.length - 1);
      if (lessons[nextLessonIndex]) {
        setSelectedLessonId(lessons[nextLessonIndex].id);
      }

      setSuccess('Lesson progress saved.');
    } catch (err: any) {
      setError(err?.message || 'Unable to update lesson progress.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitAssignment = async () => {
    if (!selectedAssignment) return;

    const fileUrls = assignmentFiles
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    if (fileUrls.length === 0) {
      setError('Please add at least one file URL before submitting.');
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      setSuccess('');
      const response = await submitAcademyAssignment(selectedAssignment.id, {
        fileUrls,
        studentNote: assignmentNote
      });

      setAssignments((current) =>
        current.map((assignment) =>
          assignment.id === selectedAssignment.id
            ? { ...assignment, submission: response.submission }
            : assignment
        )
      );
      setSuccess('Assignment submitted successfully.');
      setAssignmentFiles('');
      setAssignmentNote('');
    } catch (err: any) {
      setError(err?.message || 'Unable to submit assignment.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!selectedQuiz || !courseId) return;
    
    try {
      setActionLoading(true);
      setError('');
      setSuccess('');
      
      const parsedQuestions = JSON.parse(selectedQuiz.questions || '[]');
      let correctCount = 0;
      parsedQuestions.forEach((q: any, i: number) => {
        if (activeQuizAnswers[i] === q.correctAnswerIndex) correctCount++;
      });
      
      const score = Math.round((correctCount / parsedQuestions.length) * 100);
      const passed = score >= selectedQuiz.passingScore;
      
      const response = await submitQuizAttempt(selectedQuiz.$id as string, {
        courseId,
        score,
        passed,
        startedAt: new Date().toISOString(),
        answers: JSON.stringify(activeQuizAnswers)
      });
      
      setQuizAttempts(prev => [response.attempt, ...prev]);
      setSuccess(`Quiz submitted! You scored ${score}%.`);
    } catch (err: any) {
      setError(err?.message || 'Unable to submit quiz.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTestimonialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) return;

    try {
      setActionLoading(true);
      setError('');
      setSuccess('');
      await submitTestimonial(courseId, { rating: testimonialRating, content: testimonialContent });
      setSuccess('Review submitted! Thank you for your feedback.');
      setShowTestimonialModal(false);
    } catch (err: any) {
      setError(err?.message || 'Unable to submit review.');
    } finally {
      setActionLoading(false);
    }
  };

  if (!profile) {
    return null;
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto rounded-3xl border border-white/5 bg-slate-900/30 p-10 text-center">
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-indigo-400" />
        <p className="mt-3 text-sm text-slate-400">Loading course workspace...</p>
      </div>
    );
  }

  if (error && !courseData) {
    return (
      <div className="max-w-3xl mx-auto rounded-3xl border border-rose-500/20 bg-rose-500/10 p-8 text-center">
        <p className="text-lg font-semibold text-white">{error}</p>
        <Link href={`${portalBasePath}/courses`} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-950/70 px-4 py-2 text-sm font-semibold text-slate-200">
          <ArrowLeft className="h-4 w-4" />
          Back to Courses
        </Link>
      </div>
    );
  }

  if (!courseData) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <Link href={`${portalBasePath}/courses`} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Academy
        </Link>
        <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
          <Sparkles className="h-3.5 w-3.5" />
          {academyOverview.title}
        </span>
      </div>

      <section className="rounded-[2rem] border border-white/5 bg-slate-950/70 overflow-hidden shadow-2xl">
        <div className="grid gap-0 lg:grid-cols-[1.7fr_1fr]">
          <div className="relative p-6 lg:p-8 bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-slate-950">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.18),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(34,211,238,0.12),_transparent_35%)]" />
            <div className="relative z-10 space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">
                <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1">{courseData.course.category || 'Academy'}</span>
                <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1">{courseData.course.level || 'All Levels'}</span>
                <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1">{formatPrice(courseData.course.price)}</span>
              </div>

              <div>
                <h1 className="text-3xl lg:text-5xl font-black tracking-tight text-white">
                  {courseData.course.title}
                </h1>
                <p className="mt-4 max-w-2xl text-sm lg:text-base text-slate-300 leading-relaxed">
                  {courseData.course.summary || courseData.course.description}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-slate-900/70 px-3 py-1.5">
                  <BookOpen className="h-4 w-4 text-indigo-400" />
                  {courseData.course.lessonCount} lessons
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-slate-900/70 px-3 py-1.5">
                  <ShieldCheck className="h-4 w-4 text-cyan-400" />
                  Instructor: {courseData.course.instructorName}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-slate-900/70 px-3 py-1.5">
                  <Clock3 className="h-4 w-4 text-emerald-400" />
                  {progressPercent}% complete
                </span>
              </div>
            </div>
          </div>

          <aside className="border-t lg:border-t-0 lg:border-l border-white/5 bg-slate-900/55 p-6 lg:p-8 space-y-5">
            <div className="rounded-2xl border border-white/5 bg-slate-950/60 p-4">
              <div className="flex items-center justify-between text-xs uppercase tracking-wider text-slate-500">
                <span>Your Progress</span>
                <span className="font-bold text-indigo-300">{progressPercent}%</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-slate-800 overflow-hidden relative">
                <style>{`#progress-${courseId} { width: ${progressPercent}%; }`}</style>
                <div id={`progress-${courseId}`} className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400" />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-white/5 bg-slate-900/70 p-3">
                  <span className="block text-slate-500">Completed</span>
                  <span className="mt-1 block text-lg font-bold text-white">{completedCount}</span>
                </div>
                <div className="rounded-xl border border-white/5 bg-slate-900/70 p-3">
                  <span className="block text-slate-500">Lessons</span>
                  <span className="mt-1 block text-lg font-bold text-white">{lessons.length}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-slate-950/60 p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500">
                <Video className="h-4 w-4 text-indigo-400" />
                Next lesson
              </div>
              {nextLesson ? (
                <div>
                  <h3 className="text-sm font-semibold text-white">{nextLesson.title}</h3>
                  <p className="mt-1 text-xs text-slate-400">
                    {nextLesson.durationMinutes || 0} min
                    {nextLesson.isPreview ? ' · Preview' : ''}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-slate-400">No next lesson available yet.</p>
              )}

              {!isEnrolled ? (
                <button
                  onClick={handleEnroll}
                  disabled={actionLoading}
                  className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3 text-sm font-semibold text-white transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
                  Enroll and Start
                </button>
              ) : (
                <button
                  onClick={handleMarkComplete}
                  disabled={actionLoading || !selectedLesson}
                  className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3 text-sm font-semibold text-white transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  Mark Lesson Complete
                </button>
              )}

              {progressPercent === 100 && (
                <button
                  onClick={() => setShowTestimonialModal(true)}
                  className="w-full mt-3 rounded-xl bg-purple-600 hover:bg-purple-500 py-3 text-sm font-semibold text-white transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Leave a Review
                </button>
              )}
            </div>

            {error && (
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                {success}
              </div>
            )}
          </aside>
        </div>
      </section>

      <div className="flex flex-wrap gap-2 rounded-2xl border border-white/5 bg-slate-900/30 p-2">
        {[
          { key: 'lessons', label: 'Lessons', icon: Video },
          { key: 'assignments', label: 'Assignments', icon: FileText },
          { key: 'quizzes', label: 'Quizzes', icon: CheckCircle2 },
          { key: 'live', label: 'Live Classes', icon: MessageSquare }
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as CourseTab)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                active
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'lessons' && (
        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <section className="rounded-3xl border border-white/5 bg-slate-900/30 p-6 lg:p-8 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Lesson Playback</h2>
              {selectedLesson?.isPreview ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                  Preview available
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/60 px-3 py-1 text-xs font-semibold text-slate-400">
                  Premium lesson
                </span>
              )}
            </div>

            {selectedLesson ? (
              <>
                <div className="overflow-hidden rounded-2xl border border-white/5 bg-slate-950/70">
                  <div className="aspect-video relative bg-black">
                    {(() => {
                      const url = selectedLesson.videoUrl || '';
                      // YouTube
                      const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
                      // Vimeo
                      const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
                      // Direct video file
                      const isDirectVideo = url.match(/\.(mp4|webm|ogg)(\?|$)/i);

                      if (ytMatch) {
                        return (
                          <iframe
                            key={selectedLesson.id}
                            src={`https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0&rel=0&modestbranding=1&enablejsapi=1`}
                            title={selectedLesson.title}
                            className="absolute inset-0 h-full w-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          />
                        );
                      } else if (vimeoMatch) {
                        return (
                          <iframe
                            key={selectedLesson.id}
                            src={`https://player.vimeo.com/video/${vimeoMatch[1]}?color=6366f1&title=0&byline=0&portrait=0`}
                            title={selectedLesson.title}
                            className="absolute inset-0 h-full w-full"
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                          />
                        );
                      } else if (isDirectVideo) {
                        return (
                          <video
                            key={selectedLesson.id}
                            src={url}
                            controls
                            className="absolute inset-0 h-full w-full"
                            onEnded={isEnrolled ? handleMarkComplete : undefined}
                          >
                            Your browser does not support the video tag.
                          </video>
                        );
                      } else if (url) {
                        // Generic iframe for other embed URLs
                        return (
                          <iframe
                            key={selectedLesson.id}
                            src={url}
                            title={selectedLesson.title}
                            className="absolute inset-0 h-full w-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        );
                      } else {
                        return (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                            <div className="w-20 h-20 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
                              <Video className="h-10 w-10 text-indigo-400/60" />
                            </div>
                            <p className="text-slate-300 font-semibold">No video attached</p>
                            <p className="mt-1 text-xs text-slate-500 max-w-xs">
                              The instructor hasn't uploaded a video for this lesson yet. Read the lesson content below.
                            </p>
                          </div>
                        );
                      }
                    })()}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">
                    <span className="rounded-full border border-white/10 bg-slate-950/70 px-2.5 py-1">
                      Lesson {selectedLesson.order}
                    </span>
                    <span className="rounded-full border border-white/10 bg-slate-950/70 px-2.5 py-1">
                      {selectedLesson.durationMinutes || 0} min
                    </span>
                    {isLessonCompleted && (
                      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-emerald-300">
                        Completed
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-white">{selectedLesson.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-300">
                    {selectedLesson.content || 'This lesson does not have written content yet.'}
                  </p>
                </div>

                {/* Previous / Next navigation */}
                <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/5">
                  <button
                    disabled={selectedLessonIndex <= 0}
                    onClick={() => {
                      if (selectedLessonIndex > 0) setSelectedLessonId(lessons[selectedLessonIndex - 1].id);
                    }}
                    className="flex items-center gap-2 rounded-xl border border-white/5 bg-slate-950/60 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-900 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Previous
                  </button>
                  {isEnrolled && !isLessonCompleted && (
                    <button
                      onClick={handleMarkComplete}
                      disabled={actionLoading}
                      className="flex items-center gap-2 rounded-xl bg-emerald-600/20 border border-emerald-500/30 px-4 py-2.5 text-sm font-semibold text-emerald-300 hover:bg-emerald-600/30 transition-colors disabled:opacity-60"
                    >
                      {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                      Mark Complete
                    </button>
                  )}
                  <button
                    disabled={selectedLessonIndex >= lessons.length - 1}
                    onClick={() => {
                      if (selectedLessonIndex < lessons.length - 1) setSelectedLessonId(lessons[selectedLessonIndex + 1].id);
                    }}
                    className="flex items-center gap-2 rounded-xl border border-white/5 bg-slate-950/60 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-900 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Next
                    <ArrowLeft className="h-4 w-4 rotate-180" />
                  </button>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/50 p-8 text-center">
                <Video className="mx-auto h-12 w-12 text-slate-700" />
                <p className="mt-3 text-sm text-slate-400">Select a lesson to start playback.</p>
              </div>
            )}
          </section>

          <aside className="rounded-3xl border border-white/5 bg-slate-900/30 p-6 lg:p-8 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white">Lesson Queue</h2>
              <p className="mt-1 text-sm text-slate-400">Tap a lesson to preview its details and mark it complete once you finish.</p>
            </div>

            <div className="space-y-3">
              {lessons.map((lesson) => {
                const active = lesson.id === selectedLessonId;
                const completed = lessonProgress.some(p => p.lessonId === lesson.id && p.isCompleted) || (lesson.order <= completedCount);

                return (
                  <button
                    key={lesson.id}
                    onClick={() => setSelectedLessonId(lesson.id)}
                    className={`w-full rounded-2xl border p-4 text-left transition-all ${
                      active
                        ? 'border-indigo-500/30 bg-indigo-500/10'
                        : 'border-white/5 bg-slate-950/40 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
                          <span>Lesson {lesson.order}</span>
                          {lesson.isPreview && (
                            <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-cyan-300">
                              Preview
                            </span>
                          )}
                        </div>
                        <h3 className="mt-2 text-sm font-semibold text-white">{lesson.title}</h3>
                        <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                          {lesson.content || 'No lesson content yet.'}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2 text-xs">
                        {completed ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <Lock className="h-4 w-4 text-slate-600" />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-3xl border border-white/5 bg-slate-900/30 p-6 lg:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Course Assignments</h2>
              <span className="text-xs uppercase tracking-wider text-slate-500">{assignments.length} tasks</span>
            </div>

            <div className="space-y-3">
              {assignments.map((assignment) => {
                const submitted = Boolean(assignment.submission);
                const active = assignment.id === selectedAssignmentId;

                return (
                  <button
                    key={assignment.id}
                    onClick={() => setSelectedAssignmentId(assignment.id)}
                    className={`w-full rounded-2xl border p-4 text-left transition-all ${
                      active
                        ? 'border-indigo-500/30 bg-indigo-500/10'
                        : 'border-white/5 bg-slate-950/40 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
                          <span>{formatDateTime(assignment.dueDate)}</span>
                          <span className="rounded-full border border-white/10 bg-slate-950/70 px-2 py-0.5 text-slate-400">
                            {assignment.maxPoints} points
                          </span>
                        </div>
                        <h3 className="mt-2 text-sm font-semibold text-white">{assignment.title}</h3>
                        <p className="mt-1 text-xs text-slate-400 line-clamp-2">{assignment.instructions}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2 text-xs">
                        {submitted ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <Lock className="h-4 w-4 text-slate-600" />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-3xl border border-white/5 bg-slate-900/30 p-6 lg:p-8 space-y-5">
            {selectedAssignment ? (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedAssignment.title}</h2>
                    <p className="mt-2 text-sm text-slate-400 leading-relaxed">{selectedAssignment.instructions}</p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-xs font-semibold text-slate-300">
                    {assignmentStatusLabel}
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/5 bg-slate-950/50 p-4">
                    <span className="text-xs uppercase tracking-wider text-slate-500">Due date</span>
                    <p className="mt-2 text-sm font-semibold text-white">{formatDateTime(selectedAssignment.dueDate)}</p>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-slate-950/50 p-4">
                    <span className="text-xs uppercase tracking-wider text-slate-500">Max points</span>
                    <p className="mt-2 text-sm font-semibold text-white">{selectedAssignment.maxPoints}</p>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-slate-950/50 p-4">
                    <span className="text-xs uppercase tracking-wider text-slate-500">Submission</span>
                    <p className="mt-2 text-sm font-semibold text-white">{selectedAssignment.submission ? 'Received' : 'Pending'}</p>
                  </div>
                </div>

                <div className="space-y-3 rounded-2xl border border-white/5 bg-slate-950/50 p-4">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500">
                    <Upload className="h-4 w-4 text-indigo-400" />
                    Submit files
                  </div>
                  <textarea
                    value={assignmentFiles}
                    onChange={(e) => setAssignmentFiles(e.target.value)}
                    rows={4}
                    className="w-full resize-none rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                    placeholder="Paste one file URL per line. Example:
https://drive.google.com/...
https://github.com/.../pull/123"
                  />
                  <textarea
                    value={assignmentNote}
                    onChange={(e) => setAssignmentNote(e.target.value)}
                    rows={3}
                    className="w-full resize-none rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                    placeholder="Add a short note for your instructor..."
                  />
                  <button
                    onClick={handleSubmitAssignment}
                    disabled={actionLoading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-60"
                  >
                    {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                    Submit Assignment
                  </button>
                </div>

                {selectedAssignment.submission && (
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
                      <CheckCircle2 className="h-4 w-4" />
                      Submission received
                    </div>
                    <p className="text-sm text-slate-200">
                      Status: {selectedAssignment.submission.status}. Submitted at{' '}
                      {selectedAssignment.submission.submittedAt ? formatDateTime(selectedAssignment.submission.submittedAt) : 'unknown time'}.
                    </p>
                    {selectedAssignment.submission.feedback && (
                      <p className="text-sm text-slate-300">{selectedAssignment.submission.feedback}</p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/50 p-8 text-center">
                <FileText className="mx-auto h-12 w-12 text-slate-700" />
                <p className="mt-3 text-sm text-slate-400">No assignment selected.</p>
              </div>
            )}
          </section>
        </div>
      )}

      {activeTab === 'quizzes' && (
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-3xl border border-white/5 bg-slate-900/30 p-6 lg:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Course Quizzes</h2>
              <span className="text-xs uppercase tracking-wider text-slate-500">{quizzes.length} quizzes</span>
            </div>

            <div className="space-y-3">
              {quizzes.map((quiz) => {
                const attempt = quizAttempts.find(a => a.quizId === quiz.$id);
                const active = quiz.$id === selectedQuizId;

                return (
                  <button
                    key={quiz.$id}
                    onClick={() => setSelectedQuizId(quiz.$id as string)}
                    className={`w-full rounded-2xl border p-4 text-left transition-all ${
                      active
                        ? 'border-indigo-500/30 bg-indigo-500/10'
                        : 'border-white/5 bg-slate-950/40 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
                          <span>{quiz.timeLimitMinutes} mins</span>
                          <span className="rounded-full border border-white/10 bg-slate-950/70 px-2 py-0.5 text-slate-400">
                            {quiz.passingScore}% to pass
                          </span>
                        </div>
                        <h3 className="mt-2 text-sm font-semibold text-white">{quiz.title}</h3>
                        <p className="mt-1 text-xs text-slate-400 line-clamp-2">{quiz.description}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2 text-xs">
                        {attempt ? (
                          attempt.passed ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <CheckCircle2 className="h-4 w-4 text-rose-400" />
                        ) : (
                          <Lock className="h-4 w-4 text-slate-600" />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-3xl border border-white/5 bg-slate-900/30 p-6 lg:p-8 space-y-5">
            {selectedQuiz ? (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedQuiz.title}</h2>
                    <p className="mt-2 text-sm text-slate-400 leading-relaxed">{selectedQuiz.description}</p>
                  </div>
                  {selectedQuizAttempt ? (
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${selectedQuizAttempt.passed ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300' : 'border-rose-500/20 bg-rose-500/10 text-rose-300'}`}>
                      {selectedQuizAttempt.passed ? 'Passed' : 'Failed'}
                    </span>
                  ) : (
                    <span className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-xs font-semibold text-slate-300">
                      Pending
                    </span>
                  )}
                </div>

                {selectedQuizAttempt ? (
                  <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-6 space-y-4">
                    <h3 className="font-bold text-indigo-300">Your Attempt</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-950/40 p-4 rounded-xl">
                        <span className="text-[10px] uppercase text-slate-400">Score</span>
                        <div className="text-2xl font-black text-white">{selectedQuizAttempt.score}%</div>
                      </div>
                      <div className="bg-slate-950/40 p-4 rounded-xl">
                        <span className="text-[10px] uppercase text-slate-400">Status</span>
                        <div className={`text-lg font-bold ${selectedQuizAttempt.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {selectedQuizAttempt.passed ? 'Passed' : 'Failed'}
                        </div>
                      </div>
                    </div>
                    {!selectedQuizAttempt.passed && (
                      <p className="text-xs text-indigo-200 mt-2">You can retake the quiz to improve your score.</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {(() => {
                      const questions = JSON.parse(selectedQuiz.questions || '[]');
                      return (
                        <>
                          <div className="space-y-6">
                            {questions.map((q: any, i: number) => (
                              <div key={i} className="bg-slate-950/40 p-5 rounded-2xl border border-white/5">
                                <h4 className="font-semibold text-sm text-white mb-3">{i + 1}. {q.question}</h4>
                                <div className="space-y-2">
                                  {q.options.map((opt: string, optIdx: number) => (
                                    <label key={optIdx} className="flex items-center gap-3 p-3 rounded-xl border border-white/5 hover:bg-white/5 cursor-pointer transition-colors">
                                      <input
                                        type="radio"
                                        name={`q-${i}`}
                                        value={optIdx}
                                        checked={activeQuizAnswers[i] === optIdx}
                                        onChange={() => setActiveQuizAnswers(prev => ({ ...prev, [i]: optIdx }))}
                                        className="text-indigo-500 focus:ring-indigo-500"
                                      />
                                      <span className="text-sm text-slate-300">{opt}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                          <button
                            onClick={handleSubmitQuiz}
                            disabled={actionLoading || Object.keys(activeQuizAnswers).length < questions.length}
                            className="w-full justify-center inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-60"
                          >
                            {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                            Submit Answers
                          </button>
                        </>
                      );
                    })()}
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/50 p-8 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-slate-700" />
                <p className="mt-3 text-sm text-slate-400">No quiz selected.</p>
              </div>
            )}
          </section>
        </div>
      )}

      {activeTab === 'live' && (
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-3xl border border-white/5 bg-slate-900/30 p-6 lg:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Live Classes</h2>
              <span className="text-xs uppercase tracking-wider text-slate-500">{liveClasses.length} sessions</span>
            </div>

            <div className="space-y-3">
              {liveClasses.map((liveClass) => {
                const active = liveClass.id === liveClasses[0]?.id;
                return (
                  <button
                    key={liveClass.id}
                    onClick={() => setSelectedLessonId(selectedLessonId || lessons[0]?.id || '')}
                    className={`w-full rounded-2xl border p-4 text-left transition-all ${
                      active
                        ? 'border-indigo-500/30 bg-indigo-500/10'
                        : 'border-white/5 bg-slate-950/40 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
                          <span>{formatDateTime(liveClass.scheduledAt)}</span>
                          <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-cyan-300">
                            {liveClass.status}
                          </span>
                        </div>
                        <h3 className="mt-2 text-sm font-semibold text-white">{liveClass.title}</h3>
                        <p className="mt-1 text-xs text-slate-400">{liveClass.durationMinutes} minute session</p>
                      </div>
                      <MessageSquare className="h-4 w-4 text-slate-500" />
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-3xl border border-white/5 bg-slate-900/30 p-6 lg:p-8 space-y-5">
            {liveClasses[0] ? (
              <>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white">{liveClasses[0].title}</h2>
                  <p className="text-sm text-slate-400">
                    Join the live session to ask questions, review the assignment, and watch a guided build.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/5 bg-slate-950/50 p-4">
                    <span className="text-xs uppercase tracking-wider text-slate-500">Scheduled for</span>
                    <p className="mt-2 text-sm font-semibold text-white">{formatDateTime(liveClasses[0].scheduledAt)}</p>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-slate-950/50 p-4">
                    <span className="text-xs uppercase tracking-wider text-slate-500">Duration</span>
                    <p className="mt-2 text-sm font-semibold text-white">{liveClasses[0].durationMinutes} minutes</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/5 bg-slate-950/50 p-4">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500">
                    <MessageSquare className="h-4 w-4 text-indigo-400" />
                    Join link
                  </div>
                  <a
                    href={liveClasses[0].meetingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
                  >
                    <Video className="h-4 w-4" />
                    Open Meeting Link
                  </a>
                </div>

                <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-sm text-cyan-100">
                  Live classes are designed for coaching, debugging, and accountability. Save your notes here after the session.
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/50 p-8 text-center">
                <Video className="mx-auto h-12 w-12 text-slate-700" />
                <p className="mt-3 text-sm text-slate-400">No live classes are scheduled for this course yet.</p>
              </div>
            )}
          </section>
        </div>
      )}

      {/* Testimonial Modal */}
      {showTestimonialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowTestimonialModal(false)} />
          <div className="relative z-10 w-full max-w-lg glass-panel rounded-3xl p-8 border border-white/10 shadow-2xl bg-slate-900/90 backdrop-blur-md">
            <h3 className="text-xl font-bold text-white mb-6">Rate this Course</h3>
            <form onSubmit={handleTestimonialSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Rating (1 to 5)</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setTestimonialRating(star)}
                      className={`h-10 w-10 flex items-center justify-center rounded-xl transition-colors ${
                        star <= testimonialRating ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-950 text-slate-600 hover:bg-slate-800'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Your Review</label>
                <textarea
                  rows={4}
                  required
                  placeholder="How did this course help you?"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 resize-none"
                  value={testimonialContent}
                  onChange={(e) => setTestimonialContent(e.target.value)}
                />
              </div>

              <div className="flex gap-4 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setShowTestimonialModal(false)}
                  className="rounded-xl border border-slate-850 px-5 py-2.5 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 px-5 py-2.5 text-xs font-bold text-white"
                >
                  {actionLoading ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
