'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { BookOpen, Calendar, CheckCircle2, FileText, Loader2, MessageSquare, Play, Video } from 'lucide-react';
import {
  AcademyAssignmentDto,
  AcademyCourseDetailResponse,
  AcademyLiveClassDto,
  fetchAcademyCourse,
  fetchAcademyLiveClasses,
  fetchMyAcademyAssignments,
  submitAcademyAssignment,
  updateAcademyCourseProgress
} from '../academy/api';

type Tab = 'lessons' | 'assignments' | 'live';

function formatDateTime(value?: string) {
  if (!value) return 'Not scheduled';
  return new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
}

export default function CourseWorkspacePage() {
  const params = useParams<{ courseId: string }>();
  const courseId = params?.courseId;
  const [courseData, setCourseData] = useState<AcademyCourseDetailResponse | null>(null);
  const [assignments, setAssignments] = useState<AcademyAssignmentDto[]>([]);
  const [liveClasses, setLiveClasses] = useState<AcademyLiveClassDto[]>([]);
  const [activeLessonId, setActiveLessonId] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('lessons');
  const [fileUrls, setFileUrls] = useState('');
  const [studentNote, setStudentNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadCourse() {
      if (!courseId) return;
      setLoading(true);
      setError('');

      try {
        const [courseResponse, assignmentsResponse, liveResponse] = await Promise.all([
          fetchAcademyCourse(courseId),
          fetchMyAcademyAssignments(courseId),
          fetchAcademyLiveClasses(courseId)
        ]);
        if (cancelled) return;
        setCourseData(courseResponse);
        setAssignments(assignmentsResponse.assignments);
        setLiveClasses(liveResponse.liveClasses);
        setActiveLessonId(courseResponse.lessons[0]?.id || '');
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'Unable to load course workspace.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadCourse();
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  const activeLesson = useMemo(
    () => courseData?.lessons.find((lesson) => lesson.id === activeLessonId) || courseData?.lessons[0] || null,
    [courseData, activeLessonId]
  );

  async function markLessonComplete() {
    if (!courseId || !courseData || !activeLesson) return;
    setActionLoading(true);
    setMessage('');
    setError('');

    try {
      const completedLessons = Math.max(activeLesson.order, 1);
      await updateAcademyCourseProgress(courseId, {
        completedLessons,
        progress: Math.round((completedLessons / Math.max(courseData.lessons.length, 1)) * 100)
      });
      setMessage('Lesson progress saved.');
    } catch (err: any) {
      setError(err?.message || 'Unable to save lesson progress.');
    } finally {
      setActionLoading(false);
    }
  }

  async function submitAssignment(assignmentId: string) {
    const urls = fileUrls.split('\n').map((url) => url.trim()).filter(Boolean);
    if (urls.length === 0) {
      setError('Add at least one file URL before submitting.');
      return;
    }

    setActionLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await submitAcademyAssignment(assignmentId, { fileUrls: urls, studentNote });
      setAssignments((current) =>
        current.map((assignment) => assignment.id === assignmentId ? { ...assignment, submission: response.submission } : assignment)
      );
      setFileUrls('');
      setStudentNote('');
      setMessage('Assignment submitted.');
    } catch (err: any) {
      setError(err?.message || 'Unable to submit assignment.');
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/5 bg-slate-900/30 p-10 text-center">
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-indigo-400" />
        <p className="mt-3 text-sm text-slate-400">Loading course workspace...</p>
      </div>
    );
  }

  if (!courseData) {
    return <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-300">{error || 'Course not found.'}</div>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="rounded-3xl border border-white/5 bg-slate-900/30 p-6 lg:p-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
          <BookOpen className="h-3.5 w-3.5" />
          {courseData.course.category || 'Academy'}
        </span>
        <h1 className="mt-4 text-3xl font-extrabold text-white">{courseData.course.title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{courseData.course.description}</p>
      </div>

      {(message || error) && (
        <div className={`rounded-2xl border px-4 py-3 text-sm ${error ? 'border-rose-500/20 bg-rose-500/10 text-rose-300' : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'}`}>
          {error || message}
        </div>
      )}

      <div className="flex flex-wrap gap-2 rounded-2xl border border-white/5 bg-slate-950/50 p-2">
        {[
          { key: 'lessons', label: 'Lessons', icon: Video },
          { key: 'assignments', label: 'Assignments', icon: FileText },
          { key: 'live', label: 'Live Classes', icon: MessageSquare }
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as Tab)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-colors ${active ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'lessons' && (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-2">
            {courseData.lessons.map((lesson) => (
              <button
                key={lesson.id}
                onClick={() => setActiveLessonId(lesson.id)}
                className={`w-full rounded-2xl border p-4 text-left text-sm transition-colors ${activeLesson?.id === lesson.id ? 'border-indigo-500/30 bg-indigo-500/10 text-white' : 'border-white/5 bg-slate-900/30 text-slate-400 hover:text-white'}`}
              >
                <span className="block text-xs font-semibold text-indigo-300">Lesson {lesson.order}</span>
                <span className="mt-1 block font-bold">{lesson.title}</span>
              </button>
            ))}
          </aside>
          <section className="rounded-3xl border border-white/5 bg-slate-900/30 p-6">
            {activeLesson ? (
              <>
                <div className="aspect-video overflow-hidden rounded-2xl bg-slate-950">
                  {activeLesson.videoUrl ? (
                    <iframe src={activeLesson.videoUrl} className="h-full w-full" title={activeLesson.title} allowFullScreen />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center text-slate-500">
                      <Video className="h-12 w-12" />
                      <p className="mt-3 text-sm">No video attached for this lesson yet.</p>
                    </div>
                  )}
                </div>
                <h2 className="mt-6 text-2xl font-bold text-white">{activeLesson.title}</h2>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-300">{activeLesson.content}</p>
                <button
                  onClick={markLessonComplete}
                  disabled={actionLoading}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-500 disabled:opacity-60"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Mark Complete
                </button>
              </>
            ) : (
              <p className="text-sm text-slate-400">No lessons are available yet.</p>
            )}
          </section>
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="grid gap-4 md:grid-cols-2">
          {assignments.map((assignment) => (
            <div key={assignment.id} className="rounded-3xl border border-white/5 bg-slate-900/30 p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-white">{assignment.title}</h2>
                <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
                  {assignment.submission?.status || 'Pending'}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-400">{assignment.instructions}</p>
              <p className="mt-3 text-xs text-slate-500">Due: {formatDateTime(assignment.dueDate)} - {assignment.maxPoints} points</p>
              {assignment.submission?.feedback && <p className="mt-3 rounded-xl bg-slate-950/60 p-3 text-sm text-slate-300">{assignment.submission.feedback}</p>}
              <div className="mt-5 space-y-3">
                <textarea value={fileUrls} onChange={(event) => setFileUrls(event.target.value)} placeholder="One file URL per line" className="h-20 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500" />
                <textarea value={studentNote} onChange={(event) => setStudentNote(event.target.value)} placeholder="Notes to instructor" className="h-20 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500" />
                <button onClick={() => submitAssignment(assignment.id)} disabled={actionLoading} className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-500 disabled:opacity-60">
                  Submit Assignment
                </button>
              </div>
            </div>
          ))}
          {assignments.length === 0 && <p className="text-sm text-slate-400">No assignments are available for this course yet.</p>}
        </div>
      )}

      {activeTab === 'live' && (
        <div className="grid gap-4 md:grid-cols-2">
          {liveClasses.map((liveClass) => (
            <div key={liveClass.id} className="rounded-3xl border border-white/5 bg-slate-900/30 p-6">
              <h2 className="text-lg font-bold text-white">{liveClass.title}</h2>
              <p className="mt-3 flex items-center gap-2 text-sm text-slate-400">
                <Calendar className="h-4 w-4 text-indigo-300" />
                {formatDateTime(liveClass.scheduledAt)}
              </p>
              <p className="mt-2 text-sm text-slate-500">{liveClass.durationMinutes} minutes - {liveClass.status}</p>
              <a href={liveClass.meetingUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-500">
                <Play className="h-4 w-4" />
                Join Session
              </a>
            </div>
          ))}
          {liveClasses.length === 0 && <p className="text-sm text-slate-400">No live classes are scheduled yet.</p>}
        </div>
      )}
    </div>
  );
}
