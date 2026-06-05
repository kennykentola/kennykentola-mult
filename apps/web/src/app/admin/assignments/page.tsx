'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock3,
  Loader2,
  MessageSquare,
  Search,
  Star,
  FileText,
  Link as LinkIcon
} from 'lucide-react';
import { useAuth } from '../../../features/auth/AuthContext';
import {
  AcademySubmissionReviewDto,
  fetchAcademySubmissions,
  gradeAcademySubmission
} from '../../../features/academy/api';

export default function AdminAcademyReviewPage() {
  const { profile } = useAuth();
  const [submissions, setSubmissions] = useState<AcademySubmissionReviewDto[]>([]);
  const [activeSubmissionId, setActiveSubmissionId] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'graded'>('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [pointsAwarded, setPointsAwarded] = useState('');
  const [feedback, setFeedback] = useState('');
  const [gradeStatus, setGradeStatus] = useState<'graded' | 'pending'>('graded');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadSubmissions() {
      setLoading(true);
      setError('');

      try {
        const data = await fetchAcademySubmissions({
          status: statusFilter,
          courseId: courseFilter === 'all' ? undefined : courseFilter,
          limit: 100
        });

        if (cancelled) return;

        setSubmissions(data.submissions);
        setActiveSubmissionId((current) => {
          if (data.submissions.some((item) => item.id === current)) return current;
          return data.submissions[0]?.id || '';
        });
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || 'Unable to load assignment submissions.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadSubmissions();

    return () => {
      cancelled = true;
    };
  }, [statusFilter, courseFilter]);

  const filteredBySearch = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return submissions;
    return submissions.filter((submission) =>
      `${submission.studentName} ${submission.course.title} ${submission.assignment.title} ${submission.studentNote || ''}`
        .toLowerCase()
        .includes(q)
    );
  }, [submissions, searchQuery]);

  const activeSubmission = filteredBySearch.find((item) => item.id === activeSubmissionId) || filteredBySearch[0] || null;

  useEffect(() => {
    if (!activeSubmission) return;
    setPointsAwarded(activeSubmission.pointsAwarded?.toString() || '');
    setFeedback(activeSubmission.feedback || '');
    setGradeStatus(activeSubmission.status === 'graded' ? 'graded' : 'pending');
  }, [activeSubmission?.id]);

  const courseOptions = useMemo(() => {
    const map = new Map<string, string>();
    submissions.forEach((submission) => {
      map.set(submission.course.id, submission.course.title);
    });
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [submissions]);

  const metrics = useMemo(() => {
    const total = submissions.length;
    const pending = submissions.filter((item) => item.status !== 'graded').length;
    const graded = submissions.filter((item) => item.status === 'graded').length;
    const average =
      graded > 0
        ? Math.round(
            submissions
              .filter((item) => typeof item.pointsAwarded === 'number')
              .reduce((sum, item) => sum + Number(item.pointsAwarded || 0), 0) / graded
          )
        : 0;

    return { total, pending, graded, average };
  }, [submissions]);

  const handleGradeSubmission = async () => {
    if (!activeSubmission) return;

    try {
      setActionLoading(true);
      setError('');
      setSuccess('');

      const payload = {
        pointsAwarded: pointsAwarded ? Number(pointsAwarded) : undefined,
        feedback,
        status: gradeStatus
      };

      await gradeAcademySubmission(activeSubmission.id, payload);

      setSubmissions((current) =>
        current.map((submission) =>
          submission.id === activeSubmission.id
            ? {
                ...submission,
                pointsAwarded: payload.pointsAwarded ?? submission.pointsAwarded,
                feedback: payload.feedback,
                status: payload.status,
                updatedAt: new Date().toISOString()
              }
            : submission
        )
      );
      setSuccess('Submission graded successfully.');
    } catch (err: any) {
      setError(err?.message || 'Unable to save the grade.');
    } finally {
      setActionLoading(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Academy Review Desk</h1>
          <p className="text-slate-400 text-sm mt-1">
            Review student assignments, leave feedback, and close the loop on course progress.
          </p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-slate-900/40 px-4 py-3 text-xs text-slate-400">
          Signed in as <span className="text-white font-semibold">{profile.firstName} {profile.lastName}</span>
        </div>
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

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total Submissions', value: metrics.total, icon: FileText, color: 'text-indigo-400' },
          { label: 'Pending Review', value: metrics.pending, icon: Clock3, color: 'text-amber-400' },
          { label: 'Graded', value: metrics.graded, icon: CheckCircle2, color: 'text-emerald-400' },
          { label: 'Average Score', value: `${metrics.average}`, icon: Star, color: 'text-cyan-400' }
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-2xl border border-white/5 bg-slate-900/30 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs uppercase tracking-wider text-slate-500 block">{card.label}</span>
                  <span className="mt-2 block text-3xl font-extrabold text-white">{card.value}</span>
                </div>
                <Icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.65fr_0.35fr]">
        <section className="rounded-3xl border border-white/5 bg-slate-900/20 p-6 lg:p-8 space-y-5">
          <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by student, course, or assignment..."
                className="w-full rounded-xl border border-slate-800 bg-slate-950/60 pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'graded')}
                className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs text-white"
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="graded">Graded</option>
              </select>

              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs text-white"
              >
                <option value="all">All courses</option>
                {courseOptions.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-10 text-center">
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-indigo-400" />
              <p className="mt-3 text-sm text-slate-400">Loading assignment submissions...</p>
            </div>
          ) : filteredBySearch.length > 0 ? (
            <div className="space-y-3">
              {filteredBySearch.map((submission) => {
                const active = submission.id === activeSubmissionId;
                const statusLabel = submission.status === 'graded' ? 'Graded' : 'Pending';

                return (
                  <button
                    key={submission.id}
                    onClick={() => setActiveSubmissionId(submission.id)}
                    className={`w-full rounded-2xl border p-4 text-left transition-all ${
                      active
                        ? 'border-indigo-500/30 bg-indigo-500/10'
                        : 'border-white/5 bg-slate-950/40 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
                          <span>{submission.course.title}</span>
                          <span>·</span>
                          <span>{submission.assignment.title}</span>
                        </div>
                        <h3 className="mt-2 text-lg font-semibold text-white">{submission.studentName}</h3>
                        <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                          {submission.studentNote || 'No note added with the submission.'}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-slate-300">
                          {statusLabel}
                        </span>
                        <span className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-slate-300">
                          {submission.pointsAwarded ?? 0} / {submission.assignment.maxPoints}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-10 text-center">
              <Award className="mx-auto h-10 w-10 text-slate-700" />
              <p className="mt-3 text-sm text-slate-400">No submissions found with the current filters.</p>
            </div>
          )}
        </section>

        <aside className="rounded-3xl border border-white/5 bg-slate-900/20 p-6 lg:p-8 space-y-5">
          {activeSubmission ? (
            <>
              <div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500">Reviewing</p>
                    <h2 className="mt-1 text-2xl font-bold text-white">{activeSubmission.studentName}</h2>
                  </div>
                  <span className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-xs text-slate-300">
                    {activeSubmission.status}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-400">
                  {activeSubmission.course.title} · {activeSubmission.assignment.title}
                </p>
              </div>

              <div className="space-y-3 rounded-2xl border border-white/5 bg-slate-950/50 p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500">
                  <BookOpen className="h-4 w-4 text-indigo-400" />
                  Submitted files
                </div>
                <div className="space-y-2">
                  {activeSubmission.fileUrls.map((fileUrl, idx) => (
                    <a
                      key={`${fileUrl}-${idx}`}
                      href={fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs text-slate-300 hover:border-indigo-500/30 hover:text-white"
                    >
                      <span className="truncate">{fileUrl}</span>
                      <LinkIcon className="h-3.5 w-3.5 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 text-xs">
                <div className="rounded-2xl border border-white/5 bg-slate-950/50 p-4">
                  <span className="text-slate-500 uppercase tracking-wider">Due date</span>
                  <p className="mt-2 text-sm text-white">{activeSubmission.assignment.dueDate}</p>
                </div>
                <div className="rounded-2xl border border-white/5 bg-slate-950/50 p-4">
                  <span className="text-slate-500 uppercase tracking-wider">Submitted at</span>
                  <p className="mt-2 text-sm text-white">{activeSubmission.submittedAt || 'Unknown'}</p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Score</label>
                <input
                  type="number"
                  value={pointsAwarded}
                  onChange={(e) => setPointsAwarded(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                  placeholder={`Max ${activeSubmission.assignment.maxPoints}`}
                />
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Feedback</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={5}
                  className="w-full resize-none rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                  placeholder="Leave grading notes, corrections, and next steps..."
                />
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Review Status</label>
                <select
                  value={gradeStatus}
                  onChange={(e) => setGradeStatus(e.target.value as 'graded' | 'pending')}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                >
                  <option value="graded">Graded</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <button
                onClick={handleGradeSubmission}
                disabled={actionLoading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-rose-500 disabled:opacity-60"
              >
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
                Save Review
              </button>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-10 text-center">
              <Award className="mx-auto h-10 w-10 text-slate-700" />
              <p className="mt-3 text-sm text-slate-400">Select a submission to start reviewing.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
