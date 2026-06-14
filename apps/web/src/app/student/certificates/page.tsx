'use client';

import React, { useEffect, useState } from 'react';
import { Award, Download, ExternalLink, Calendar, Loader2, AlertCircle } from 'lucide-react';
import { getSessionJwt } from '../../../lib/sessionJwt';

interface Certificate {
  $id: string;
  studentId: string;
  courseId: string;
  certificateNumber: string;
  issuedAt: string;
  pdfUrl: string;
  courseTitle?: string; // We'll map this using courses list or display directly
}

interface Course {
  id: string;
  title: string;
}

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [courses, setCourses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

  const fetchCertificatesAndCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch courses catalog to map titles
      const coursesRes = await fetch(`${API_BASE}/academy/courses`);
      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        const mappedCourses: Record<string, string> = {};
        coursesData.courses.forEach((c: Course) => {
          mappedCourses[c.id] = c.title;
        });
        setCourses(mappedCourses);
      }

      // 2. Fetch certificates
        const certsRes = await fetch(`${API_BASE}/academy/certificates`, {
          headers: {
          Authorization: `Bearer ${await getSessionJwt()}`,
        },
      });

      if (!certsRes.ok) {
        throw new Error('Failed to load certificates');
      }

      const certsData = await certsRes.json();
      setCertificates(certsData.certificates);
    } catch (err: any) {
      console.error('[Certificates] Error fetching certificates:', err);
      setError(err.message || 'Failed to retrieve certificates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificatesAndCourses();
  }, []);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Award className="h-5 w-5 text-white" />
          </div>
          My Certificates
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Download and share your official programming academy completion credentials.
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
          <p className="text-slate-500 text-sm">Loading credentials...</p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm max-w-md">
          {error}
        </div>
      ) : certificates.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {certificates.map((cert) => {
            const courseName = courses[cert.courseId] || 'Completed Course Workspace';
            const formattedDate = new Date(cert.issuedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });

            return (
              <div
                key={cert.$id}
                className="relative overflow-hidden rounded-2xl border border-amber-500/10 bg-slate-900/20 backdrop-blur-md p-6 hover:border-amber-500/30 transition-all duration-300 group"
              >
                {/* Decorative border accent */}
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-amber-500 to-orange-600" />
                
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-3">
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-semibold tracking-wide uppercase">
                      Verified Credential
                    </span>
                    <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors leading-tight">
                      {courseName}
                    </h3>
                    
                    <div className="flex flex-col gap-1.5 text-xs text-slate-400 pt-1">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-500" />
                        Issued on {formattedDate}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider">
                        No: {cert.certificateNumber}
                      </span>
                    </div>
                  </div>

                  <Award className="h-10 w-10 text-amber-500/20 group-hover:text-amber-500/40 group-hover:scale-110 transition-all shrink-0" />
                </div>

                <div className="mt-6 pt-4 border-t border-slate-900 flex justify-end gap-3">
                  <a
                    href={cert.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-300 transition-all"
                  >
                    View Online <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <a
                    href={cert.pdfUrl}
                    download
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-amber-500/10 hover:opacity-90 transition-opacity"
                  >
                    Download PDF <Download className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/30 p-12 text-center max-w-xl mx-auto">
          <Award className="mx-auto h-12 w-12 text-slate-700 mb-4 animate-pulse" />
          <h3 className="text-base font-bold text-white">No Certificates Issued Yet</h3>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed">
            Certificates are automatically awarded when you complete 100% of a course curriculum. Start a course or submit your outstanding assignments to earn your first badge.
          </p>
        </div>
      )}
    </div>
  );
}
