'use client';

import React, { useEffect, useState } from 'react';

function getProgressWidthClass(progress: number): string {
  if (progress <= 0) return 'w-0';
  if (progress <= 5) return 'w-[5%]';
  if (progress <= 10) return 'w-[10%]';
  if (progress <= 15) return 'w-[15%]';
  if (progress <= 20) return 'w-1/5';
  if (progress <= 25) return 'w-1/4';
  if (progress <= 30) return 'w-[30%]';
  if (progress <= 33) return 'w-1/3';
  if (progress <= 40) return 'w-2/5';
  if (progress <= 50) return 'w-1/2';
  if (progress <= 60) return 'w-3/5';
  if (progress <= 66) return 'w-2/3';
  if (progress <= 70) return 'w-[70%]';
  if (progress <= 75) return 'w-3/4';
  if (progress <= 80) return 'w-4/5';
  if (progress <= 85) return 'w-[85%]';
  if (progress <= 90) return 'w-[90%]';
  if (progress <= 95) return 'w-[95%]';
  return 'w-full';
}
import { 
  Users, 
  Search, 
  BookOpen, 
  TrendingUp, 
  Calendar,
  AlertCircle,
  Loader2,
  GraduationCap
} from 'lucide-react';
import { getInstructorStudents } from '../../../features/instructor/instructorService';

type EnrolledStudent = {
  id: string;
  userId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseTitle: string;
  progress: number;
  completedLessons: number;
  status: string;
  updatedAt: string;
};

export default function InstructorStudentsPage() {
  const [enrollments, setEnrollments] = useState<EnrolledStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadStudents() {
      try {
        const data = await getInstructorStudents();
        if (!cancelled) {
          setEnrollments(data || []);
          setLoading(false);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || 'Failed to load students progress.');
          setLoading(false);
        }
      }
    }

    loadStudents();

    return () => {
      cancelled = true;
    };
  }, []);

  // Filter enrollments based on search query
  const filteredEnrollments = enrollments.filter(e => 
    e.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.courseTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Compute metrics
  const totalStudents = enrollments.length;
  const avgProgress = totalStudents > 0 
    ? Math.round(enrollments.reduce((acc, curr) => acc + curr.progress, 0) / totalStudents)
    : 0;
  const completedCount = enrollments.filter(e => e.progress === 100).length;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto rounded-3xl border border-white/5 bg-slate-900/30 p-12 text-center">
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-indigo-400" />
        <p className="mt-3 text-sm text-slate-400">Loading student management workspace...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
            <Users className="h-3.5 w-3.5" />
            Instructor Workspace
          </span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white">
            Student Management
          </h1>
          <p className="mt-2 text-slate-400 text-sm">
            Track student enrollment progress, completion rates, and learning engagement.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-300 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Enrolled</span>
            <span className="block text-2xl font-black text-white">{totalStudents}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Progress</span>
            <span className="block text-2xl font-black text-white">{avgProgress}%</span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed Courses</span>
            <span className="block text-2xl font-black text-white">{completedCount}</span>
          </div>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-md">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-500" />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-white/5 bg-slate-900/20 hover:bg-slate-900/30 pl-10 pr-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none transition-all"
          placeholder="Search student name or course..."
        />
      </div>

      {/* Student List Table */}
      {filteredEnrollments.length === 0 ? (
        <div className="rounded-3xl border border-white/5 bg-slate-900/20 p-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-slate-700" />
          <h3 className="mt-4 text-lg font-bold text-white">No students found</h3>
          <p className="mt-2 text-slate-400 text-sm">
            There are currently no active students matching your search criteria.
          </p>
        </div>
      ) : (
        <div className="rounded-3xl border border-white/5 bg-slate-900/10 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-900 bg-slate-900/40 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-6">Student</th>
                  <th className="py-4 px-6">Course Enrolled</th>
                  <th className="py-4 px-6">Progress</th>
                  <th className="py-4 px-6">Lessons Done</th>
                  <th className="py-4 px-6">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/40 text-sm">
                {filteredEnrollments.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-900/10 transition-colors">
                    <td className="py-4 px-6">
                      <div>
                        <span className="block font-bold text-white">{student.studentName}</span>
                        <span className="block text-xs text-slate-500">{student.studentEmail}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/10 bg-indigo-500/5 px-2.5 py-1 text-xs font-semibold text-indigo-300">
                        {student.courseTitle}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${getProgressWidthClass(student.progress)} ${
                              student.progress === 100 
                                ? 'bg-emerald-500' 
                                : 'bg-indigo-500'
                            }`}
                          />
                        </div>
                        <span className="font-bold text-xs text-slate-300">{student.progress}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-slate-300">{student.completedLessons} lessons</span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-500" />
                        {new Date(student.updatedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
