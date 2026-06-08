'use client';

import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Plus, 
  Search, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw,
  User,
  BookOpen
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('session_jwt') : null;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(data.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueForm, setIssueForm] = useState({
    studentId: '',
    courseId: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadCertificates();
    loadSelectorData();
  }, []);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchWithAuth(`${API_BASE}/academy/admin/certificates`);
      setCertificates(data.certificates || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load certificates.');
    } finally {
      setLoading(false);
    }
  };

  const loadSelectorData = async () => {
    try {
      const [coursesData, usersData] = await Promise.all([
        fetchWithAuth(`${API_BASE}/academy/courses`),
        fetchWithAuth(`${API_BASE}/auth/admin/users`)
      ]);
      setCourses(coursesData.courses || []);
      // Filter users to only those with role Student or Instructor (or just show all users so you can issue to anyone)
      setStudents(usersData.users || []);
    } catch (err) {
      console.error('Failed to load selector data', err);
    }
  };

  const handleIssueCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueForm.studentId || !issueForm.courseId) {
      setError('Please select both a student and a course.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      await fetchWithAuth(`${API_BASE}/academy/admin/certificates/issue`, {
        method: 'POST',
        body: JSON.stringify(issueForm)
      });
      setSuccessMsg('Certificate generation queued successfully!');
      setIssueForm({ studentId: '', courseId: '' });
      setTimeout(() => {
        setShowIssueModal(false);
        setSuccessMsg('');
        loadCertificates();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to manually issue certificate.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCerts = certificates.filter(c => 
    c.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.courseTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.certificateNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Manual Certificate Control</h1>
          <p className="text-slate-400 text-sm mt-1">Audit student credentials, generate pdf outputs, and trigger manual issuance overrides.</p>
        </div>
        <button
          onClick={() => setShowIssueModal(true)}
          className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 transition-opacity text-white px-5 py-3 text-xs font-bold flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Issue Manually
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Directory Workspace */}
      <div className="glass-panel border border-white/5 bg-slate-900/20 rounded-3xl p-6 lg:p-8 space-y-6">
        {/* Search & Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-900 pb-6">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by student, course, or certificate number..."
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">Showing {filteredCerts.length} total certificates</span>
        </div>

        {/* Certificates Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-sm animate-pulse">Loading certificates...</p>
          </div>
        ) : filteredCerts.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/10 border border-white/5 rounded-2xl">
            <Award className="h-12 w-12 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-semibold">No certificates match the query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-900 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-4 px-4">Certificate Number</th>
                  <th className="py-4 px-4">Student Name</th>
                  <th className="py-4 px-4">Course Title</th>
                  <th className="py-4 px-4">Date Issued</th>
                  <th className="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/50">
                {filteredCerts.map((cert) => (
                  <tr key={cert.id} className="hover:bg-slate-900/25 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-white">{cert.certificateNumber}</td>
                    <td className="py-4 px-4 text-slate-300 font-semibold">{cert.studentName}</td>
                    <td className="py-4 px-4 text-slate-400 font-semibold">{cert.courseTitle}</td>
                    <td className="py-4 px-4 text-slate-500">{new Date(cert.issuedAt).toLocaleDateString()}</td>
                    <td className="py-4 px-4 text-right">
                      {cert.pdfUrl ? (
                        <a
                          href={cert.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center justify-end gap-1.5 ml-auto text-[10px]"
                        >
                          <ExternalLink className="h-3 w-3" /> View PDF
                        </a>
                      ) : (
                        <span className="text-[10px] text-slate-600 italic">Processing</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Issue Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowIssueModal(false)} />
          <div className="relative z-10 w-full max-w-md glass-panel rounded-3xl p-8 border border-white/10 shadow-2xl bg-slate-900/90 backdrop-blur-md">
            <h3 className="text-xl font-bold text-white mb-6">Manually Issue Certificate</h3>
            <form onSubmit={handleIssueCertificate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Select Student</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <select
                    title="Select Student"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                    value={issueForm.studentId}
                    onChange={(e) => setIssueForm({ ...issueForm, studentId: e.target.value })}
                  >
                    <option value="">-- Choose Student --</option>
                    {students.map((stud) => (
                      <option key={stud.id} value={stud.userId}>
                        {stud.name} ({stud.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Select Course</label>
                <div className="relative">
                  <BookOpen className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <select
                    title="Select Course"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                    value={issueForm.courseId}
                    onChange={(e) => setIssueForm({ ...issueForm, courseId: e.target.value })}
                  >
                    <option value="">-- Choose Course --</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {successMsg && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="flex gap-4 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="rounded-xl border border-slate-850 px-5 py-2.5 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-650 px-5 py-2.5 text-xs font-bold text-white"
                >
                  {submitting ? 'Issuing...' : 'Issue Certificate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
