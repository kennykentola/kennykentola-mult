'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  FileCheck, 
  Calendar, 
  Award, 
  AlertCircle, 
  Clock, 
  ChevronRight, 
  CheckCircle2, 
  ExternalLink,
  BookOpen,
  Loader2
} from 'lucide-react';
import { fetchStudentAssignments, StudentAssignmentDto } from '../../../features/academy/api';

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<StudentAssignmentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');

  useEffect(() => {
    let cancelled = false;

    async function loadAssignments() {
      try {
        const response = await fetchStudentAssignments();
        if (!cancelled) {
          setAssignments(response.assignments || []);
          setLoading(false);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || 'Failed to load assignments.');
          setLoading(false);
        }
      }
    }

    loadAssignments();

    return () => {
      cancelled = true;
    };
  }, []);

  // Compute metrics
  const totalCount = assignments.length;
  const submittedCount = assignments.filter(a => a.submission && a.submission.status === 'pending').length;
  const gradedCount = assignments.filter(a => a.submission && a.submission.status === 'graded').length;
  const notSubmittedCount = assignments.filter(a => !a.submission).length;

  const filteredAssignments = assignments.filter(a => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !a.submission;
    if (filter === 'submitted') return a.submission && a.submission.status === 'pending';
    if (filter === 'graded') return a.submission && a.submission.status === 'graded';
    return true;
  });

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto rounded-3xl border border-white/5 bg-slate-900/30 p-12 text-center">
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-indigo-400" />
        <p className="mt-3 text-sm text-slate-400">Loading assignments workspace...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
          <FileCheck className="h-3.5 w-3.5" />
          Academy Portal
        </span>
        <h1 className="mt-3 text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
          My Assignments
        </h1>
        <p className="mt-2 text-slate-400 text-sm max-w-2xl">
          Track deadlines, submit homework code, and view instructor feedback across all your enrolled courses.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-300 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-5">
          <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Assigned</span>
          <span className="mt-2 block text-3xl font-black text-white">{totalCount}</span>
        </div>
        <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-5">
          <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Not Submitted</span>
          <span className="mt-2 block text-3xl font-black text-rose-400">{notSubmittedCount}</span>
        </div>
        <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-5">
          <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Awaiting Grade</span>
          <span className="mt-2 block text-3xl font-black text-amber-400">{submittedCount}</span>
        </div>
        <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-5">
          <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Graded Tasks</span>
          <span className="mt-2 block text-3xl font-black text-emerald-400">{gradedCount}</span>
        </div>
      </div>

      {/* Tabs and Filters */}
      <div className="flex border-b border-slate-900 overflow-x-auto">
        <button
          onClick={() => setFilter('all')}
          className={`px-5 py-3 border-b-2 font-medium text-sm transition-all whitespace-nowrap ${
            filter === 'all'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          All Assignments ({totalCount})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-5 py-3 border-b-2 font-medium text-sm transition-all whitespace-nowrap ${
            filter === 'pending'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          To Do ({notSubmittedCount})
        </button>
        <button
          onClick={() => setFilter('submitted')}
          className={`px-5 py-3 border-b-2 font-medium text-sm transition-all whitespace-nowrap ${
            filter === 'submitted'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Pending Review ({submittedCount})
        </button>
        <button
          onClick={() => setFilter('graded')}
          className={`px-5 py-3 border-b-2 font-medium text-sm transition-all whitespace-nowrap ${
            filter === 'graded'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Graded ({gradedCount})
        </button>
      </div>

      {/* Assignment Grid */}
      {filteredAssignments.length === 0 ? (
        <div className="rounded-3xl border border-white/5 bg-slate-900/20 p-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-slate-700" />
          <h3 className="mt-4 text-lg font-bold text-white">No assignments found</h3>
          <p className="mt-2 text-slate-400 text-sm max-w-md mx-auto">
            You don't have any assignments matching the current status filter. Explore catalog courses to find more tasks.
          </p>
          <Link
            href="/student/courses"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all"
          >
            Browse Course Catalog
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredAssignments.map((assignment) => {
            const hasSubmission = Boolean(assignment.submission);
            const subStatus = assignment.submission?.status || 'not-submitted';
            const gradePoints = assignment.submission?.pointsAwarded;
            const hasGrade = subStatus === 'graded' && gradePoints !== undefined;

            return (
              <div 
                key={assignment.id}
                className="group relative rounded-3xl border border-white/5 bg-slate-900/20 hover:bg-slate-900/40 p-6 lg:p-8 transition-all duration-300 flex flex-col md:flex-row md:items-start md:justify-between gap-6"
              >
                {/* Decorative border highlight */}
                <div className="absolute inset-px rounded-[22px] bg-gradient-to-r from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <div className="space-y-4 max-w-3xl relative z-10">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-indigo-500/20 bg-indigo-500/5 px-2.5 py-0.5 text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                      {assignment.courseTitle}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Instructor: {assignment.instructorName}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      {assignment.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                      {assignment.instructions}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-slate-500" />
                      Due Date: <span className="font-semibold text-slate-300">{new Date(assignment.dueDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Award className="h-4 w-4 text-slate-500" />
                      Max Score: <span className="font-semibold text-slate-300">{assignment.maxPoints} pts</span>
                    </span>
                  </div>

                  {/* Instructor Feedback Box */}
                  {assignment.submission?.feedback && (
                    <div className="rounded-2xl border border-white/5 bg-slate-950/60 p-4 mt-3">
                      <span className="text-xs font-bold text-indigo-400 uppercase tracking-wide">Instructor Feedback</span>
                      <p className="mt-1 text-xs text-slate-400 italic">
                        "{assignment.submission.feedback}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Right side status / CTA actions */}
                <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end justify-between md:justify-start gap-4 shrink-0 relative z-10 min-w-[180px]">
                  {/* Status Badge */}
                  {!hasSubmission ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300">
                      <Clock className="h-3.5 w-3.5" />
                      To Do
                    </span>
                  ) : subStatus === 'pending' ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300">
                      <Clock className="h-3.5 w-3.5" />
                      Pending Review
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Graded
                    </span>
                  )}

                  {/* Grade Score Display */}
                  {hasGrade && (
                    <div className="text-right">
                      <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Your Score</span>
                      <span className="text-2xl font-black text-emerald-400">
                        {gradePoints} <span className="text-sm font-semibold text-slate-500">/ {assignment.maxPoints}</span>
                      </span>
                    </div>
                  )}

                  <Link
                    href={`/student/courses/${assignment.courseId}`}
                    className="w-full sm:w-auto md:w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 py-2.5 px-4 text-xs font-bold text-slate-200 transition-colors"
                  >
                    Go to Workspace
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
