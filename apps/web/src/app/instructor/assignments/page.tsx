'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileCheck, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  Clock, 
  Award,
  Filter,
  Download,
  BarChart3
} from 'lucide-react';
import { getInstructorSubmissions, gradeSubmission } from '../../../features/instructor/instructorService';

export default function GradingWorkspace() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending'); // pending, graded, all
  
  // Grading fields
  const [points, setPoints] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const analytics = useMemo(() => {
    const total = submissions.length;
    const graded = submissions.filter((sub) => sub.status === 'graded').length;
    const pending = total - graded;
    const scored = submissions.filter((sub) => typeof sub.pointsAwarded === 'number');
    const averageScore = scored.length
      ? Math.round(
          scored.reduce((sum, sub) => {
            const maxPoints = Number(sub.assignment?.maxPoints || 0);
            return sum + (maxPoints > 0 ? (Number(sub.pointsAwarded || 0) / maxPoints) * 100 : 0);
          }, 0) / scored.length
        )
      : 0;

    return { total, graded, pending, averageScore };
  }, [submissions]);

  useEffect(() => {
    loadSubmissions();
  }, [filterStatus]);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getInstructorSubmissions({
        status: filterStatus
      });
      setSubmissions(data || []);
      // Auto-select first one if none selected or if selected is not in current view
      if (data && data.length > 0) {
        setSelectedSubmission(data[0]);
        setPoints(data[0].pointsAwarded !== null && data[0].pointsAwarded !== undefined ? data[0].pointsAwarded : data[0].assignment.maxPoints);
        setFeedback(data[0].feedback || '');
      } else {
        setSelectedSubmission(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch student submissions.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSubmission = (sub: any) => {
    setSelectedSubmission(sub);
    setPoints(sub.pointsAwarded !== null && sub.pointsAwarded !== undefined ? sub.pointsAwarded : sub.assignment.maxPoints);
    setFeedback(sub.feedback || '');
    setSuccessMsg('');
  };

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      await gradeSubmission(selectedSubmission.id, {
        pointsAwarded: Number(points),
        feedback,
        status: 'graded'
      });

      setSuccessMsg('Grade submitted successfully!');
      setTimeout(() => {
        setSuccessMsg('');
        loadSubmissions();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to submit grade.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportCsv = () => {
    const rows = [
      ['Student', 'Course', 'Assignment', 'Status', 'Score', 'Max Points', 'Submitted At'],
      ...submissions.map((sub) => [
        sub.studentName,
        sub.course.title,
        sub.assignment.title,
        sub.status,
        sub.pointsAwarded ?? '',
        sub.assignment.maxPoints,
        sub.submittedAt ? new Date(sub.submittedAt).toISOString() : ''
      ])
    ];

    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `assignment-submissions-${filterStatus}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white">Grading Workspace</h1>
        <p className="text-slate-400 text-sm mt-1">Review student project files, inspect repository submissions, and write developer feedback reports.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Submissions', value: analytics.total, accent: 'text-white' },
          { label: 'Awaiting Review', value: analytics.pending, accent: 'text-amber-400' },
          { label: 'Graded', value: analytics.graded, accent: 'text-emerald-400' },
          { label: 'Average Score', value: analytics.averageScore ? `${analytics.averageScore}%` : 'N/A', accent: 'text-indigo-400' }
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-white/5 bg-slate-900/30 p-5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              <BarChart3 className="h-3.5 w-3.5" />
              {stat.label}
            </div>
            <p className={`mt-2 text-2xl font-extrabold ${stat.accent}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Content Grid */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Side: Submission Queue */}
        <div className="w-full lg:w-1/3 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Submission Queue</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCsv}
                disabled={submissions.length === 0}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-[10px] font-semibold text-slate-350 hover:border-indigo-500/30 hover:text-indigo-300 disabled:cursor-not-allowed disabled:opacity-50"
                title="Export current submissions"
              >
                <Download className="h-3.5 w-3.5" />
                CSV
              </button>
              <Filter className="h-3.5 w-3.5 text-slate-500" />
              <select
                title="Filter Submissions"
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-[10px] text-slate-350 font-semibold focus:outline-none"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="pending">Awaiting Review</option>
                <option value="graded">Graded</option>
                <option value="all">All</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/10 border border-white/5 rounded-2xl">
              <Clock className="h-10 w-10 text-slate-655 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-semibold">No submissions match the filter.</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {submissions.map((sub) => {
                const active = selectedSubmission?.id === sub.id;
                return (
                  <div
                    key={sub.id}
                    onClick={() => handleSelectSubmission(sub)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 text-xs text-left ${
                      active
                        ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                        : 'bg-slate-900/20 border-white/5 text-slate-300 hover:bg-slate-900/40 hover:border-white/10'
                    }`}
                  >
                    <div className="flex justify-between items-start font-semibold">
                      <span className={active ? 'text-indigo-300' : 'text-white'}>{sub.studentName}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        sub.status === 'graded' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {sub.status === 'graded' ? 'Graded' : 'Awaiting'}
                      </span>
                    </div>
                    <div className="text-slate-450 mt-1 font-medium">{sub.assignment.title}</div>
                    <div className="text-[10px] text-slate-500 mt-2 font-bold">{sub.course.title}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Grading Detail Panel */}
        <div className="flex-1">
          {selectedSubmission ? (
            <div className="glass-panel border border-white/5 bg-slate-900/20 rounded-3xl p-6 lg:p-8 space-y-6">
              
              {/* Submission Information */}
              <div className="border-b border-white/5 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-white">{selectedSubmission.studentName}</h3>
                    <p className="text-xs text-indigo-400 mt-0.5 font-semibold">
                      {selectedSubmission.course.title} — {selectedSubmission.assignment.title}
                    </p>
                  </div>
                  <div className="text-right text-[10px] text-slate-500 font-semibold">
                    Submitted: {new Date(selectedSubmission.submittedAt).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Student Submission Contents */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Student Note</h4>
                  <div className="mt-1.5 p-4 rounded-xl border border-white/5 bg-slate-950/40 text-xs text-slate-300 leading-relaxed italic">
                    {selectedSubmission.studentNote || 'No notes provided by student.'}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Submitted Project Resources</h4>
                  <div className="mt-1.5 space-y-2">
                    {selectedSubmission.fileUrls.map((url: string, i: number) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 rounded-xl border border-indigo-500/10 bg-indigo-550/5 hover:bg-indigo-550/10 text-indigo-400 text-xs font-semibold transition-colors"
                      >
                        <span className="truncate max-w-lg">{url}</span>
                        <ExternalLink className="h-4 w-4 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Grading Form */}
              <form onSubmit={handleGradeSubmit} className="border-t border-white/5 pt-6 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-indigo-400" />
                  Evaluate & Report Feedback
                </h4>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <div className="col-span-1">
                    <label htmlFor="points-input" className="text-xs font-semibold text-slate-400 block mb-1.5">Score (Out of {selectedSubmission.assignment.maxPoints})</label>
                    <input
                      id="points-input"
                      type="number"
                      min="0"
                      max={selectedSubmission.assignment.maxPoints}
                      required
                      placeholder="85"
                      title="Points Awarded"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                      value={points}
                      onChange={(e) => setPoints(Number(e.target.value))}
                    />
                  </div>
                  <div className="col-span-2 text-xs text-slate-500 font-semibold self-end pb-3">
                    Award points based on instructions adherence and code logic.
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">Feedback / Code Review</label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Provide constructive review comments on formatting, optimization, and fixes..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 resize-none"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                  />
                </div>

                {successMsg && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-650 hover:opacity-90 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-500/20"
                  >
                    {submitting ? 'Submitting...' : selectedSubmission.status === 'graded' ? 'Update Review' : 'Grade Assignment'}
                  </button>
                </div>
              </form>

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 glass-panel border border-white/5 bg-slate-900/10 rounded-3xl text-center">
              <FileCheck className="h-16 w-16 text-slate-600 mb-4" />
              <h3 className="text-lg font-bold text-white">Select a Submission</h3>
              <p className="text-slate-400 text-sm mt-2 max-w-sm">
                Choose any pending student solution from the queue list to start your review.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
