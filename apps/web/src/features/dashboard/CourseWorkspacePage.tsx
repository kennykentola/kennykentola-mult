'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { BookOpen, Calendar, CheckCircle2, FileText, Loader2, MessageSquare, Play, Video, Lock } from 'lucide-react';
import {
  AcademyAssignmentDto,
  AcademyCourseDetailResponse,
  AcademyLiveClassDto,
  fetchAcademyCourse,
  fetchAcademyLiveClasses,
  fetchMyAcademyAssignments,
  submitAcademyAssignment,
  updateAcademyCourseProgress,
  fetchCourseQuizzes,
  fetchMyQuizAttempts,
  QuizDto,
  QuizAttemptDto,
  submitCoursePayment,
  fetchWorkspaceCode,
  saveWorkspaceCode
} from '../academy/api';
import Link from 'next/link';
import Editor from '@monaco-editor/react';
import AITutorChat from '../academy/AITutorChat';

type Tab = 'lessons' | 'assignments' | 'live' | 'quizzes';

function formatDateTime(value?: string) {
  if (!value) return 'Not scheduled';
  return new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
}

export default function CourseWorkspacePage() {
  const getDefaultCode = (lang: string) => {
    if (lang === 'python') return '# Write your Python code here...';
    if (lang === 'html') return '<!-- Write your HTML code here... -->';
    return '// Write your code here...';
  };

  const params = useParams<{ courseId: string }>();
  const courseId = params?.courseId;
  const [courseData, setCourseData] = useState<AcademyCourseDetailResponse | null>(null);
  const [assignments, setAssignments] = useState<AcademyAssignmentDto[]>([]);
  const [liveClasses, setLiveClasses] = useState<AcademyLiveClassDto[]>([]);
  const [quizzes, setQuizzes] = useState<QuizDto[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttemptDto[]>([]);
  const [activeLessonId, setActiveLessonId] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('lessons');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [studentNote, setStudentNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Workspace State
  const [editorCode, setEditorCode] = useState(getDefaultCode('javascript'));
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [executionCount, setExecutionCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadCourse() {
      if (!courseId) return;
      setLoading(true);
      setError('');

      try {
        const [courseResponse, assignmentsResponse, liveResponse, quizzesResponse, attemptsResponse] = await Promise.all([
          fetchAcademyCourse(courseId),
          fetchMyAcademyAssignments(courseId),
          fetchAcademyLiveClasses(courseId),
          fetchCourseQuizzes(courseId),
          fetchMyQuizAttempts(courseId)
        ]);
        if (cancelled) return;
        setCourseData(courseResponse);
        setAssignments(assignmentsResponse.assignments);
        setLiveClasses(liveResponse.liveClasses);
        setQuizzes(quizzesResponse.quizzes.filter(q => q.isPublished));
        setQuizAttempts(attemptsResponse.attempts);
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

  useEffect(() => {
    if (!courseId || !activeLesson?.id) return;
    let cancelled = false;
    async function loadWorkspace() {
      try {
        const res = await fetchWorkspaceCode(courseId!, activeLesson!.id);
        if (cancelled) return;
        if (res.workspace) {
          setEditorCode(res.workspace.code || '');
          setSelectedLanguage(res.workspace.language || 'javascript');
          setOutput('');
        } else {
          setEditorCode(getDefaultCode('javascript'));
          setOutput('');
        }
      } catch (err) {
        console.error('Failed to load workspace', err);
      }
    }
    loadWorkspace();
    return () => { cancelled = true; };
  }, [courseId, activeLesson?.id]);

  async function handleRunCode() {
    setIsExecuting(true);
    setExecutionCount(c => c + 1);
    try {
      if (selectedLanguage === 'html') {
        setOutput(editorCode);
      } else if (selectedLanguage === 'javascript' || selectedLanguage === 'typescript') {
        const logs: string[] = [];
        const _origLog = console.log;
        const _origErr = console.error;
        const _origWarn = console.warn;
        console.log = (...a: any[]) => { logs.push(a.map(v => typeof v === 'object' ? JSON.stringify(v, null, 2) : String(v)).join(' ')); };
        console.error = (...a: any[]) => { logs.push('[ERROR] ' + a.map(v => typeof v === 'object' ? JSON.stringify(v, null, 2) : String(v)).join(' ')); };
        console.warn = (...a: any[]) => { logs.push('[WARN] ' + a.map(v => typeof v === 'object' ? JSON.stringify(v, null, 2) : String(v)).join(' ')); };
        try {
          // eslint-disable-next-line no-new-func
          const fn = new Function(editorCode);
          fn();
        } catch (err: any) {
          logs.push('[ERROR] ' + (err?.message || String(err)));
        } finally {
          console.log = _origLog;
          console.error = _origErr;
          console.warn = _origWarn;
        }
        setOutput(logs.length > 0 ? logs.join('\n') : '(No output)');
      } else if (selectedLanguage === 'python') {
        setOutput('⏳ Loading Python engine... (first run may take a few seconds)');
        try {
          // Load Pyodide in the main thread (cached after first load)
          const win = window as any;
          if (!win._pyodideReady) {
            if (!win._pyodideLoading) {
              win._pyodideLoading = (async () => {
                // Dynamically add the Pyodide script if not already loaded
                if (!win.loadPyodide) {
                  await new Promise<void>((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js';
                    script.onload = () => resolve();
                    script.onerror = () => reject(new Error('Failed to load Pyodide script'));
                    document.head.appendChild(script);
                  });
                }
                win._pyodideInstance = await win.loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/' });
                win._pyodideReady = true;
              })();
            }
            await win._pyodideLoading;
          }
          const pyodide = win._pyodideInstance;
          const pyLogs: string[] = [];
          pyodide.setStdout({ batched: (msg: string) => { pyLogs.push(msg); } });
          pyodide.setStderr({ batched: (msg: string) => { pyLogs.push('[ERROR] ' + msg); } });
          await pyodide.runPythonAsync(editorCode);
          setOutput(pyLogs.length > 0 ? pyLogs.join('\n') : '(No output)');
        } catch (pyErr: any) {
          setOutput('[ERROR] ' + (pyErr?.message || String(pyErr)));
        }
      } else {
        setOutput(`Executing ${selectedLanguage} on remote server...`);
        try {
          const { getSessionJwt } = require('@/lib/sessionJwt');
          const token = await getSessionJwt();
          const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
          
          const res = await fetch(`${apiBase}/execute/execute-code`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ language: selectedLanguage, sourceCode: editorCode })
          });
          
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || `Server error: ${res.status}`);
          }
          
          const data = await res.json();
          setOutput(data.run?.output || data.run?.stdout || data.run?.stderr || '(No output)');
        } catch (err: any) {
          setOutput(`[ERROR] ${err.message || 'Remote execution failed'}`);
        }
      }
    } finally {
      setIsExecuting(false);
      // Auto-scroll to the output panel so the user sees results (especially on mobile)
      setTimeout(() => {
        document.getElementById('terminal-output-panel')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }

  async function handleSaveCode() {
    if (!courseId || !activeLesson?.id) return;
    setIsSaving(true);
    try {
      await saveWorkspaceCode(courseId, activeLesson.id, editorCode, selectedLanguage);
      setMessage('Workspace saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setError(err?.message || 'Failed to save workspace');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsSaving(false);
    }
  }

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
    let uploadedUrls: string[] = [];
    if (selectedFiles.length === 0 && !studentNote.trim()) {
      setError('Please add at least one file or a note before submitting.');
      return;
    }

    setActionLoading(true);
    setMessage('');
    setError('');

    try {
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          const cloudFormData = new FormData();
          cloudFormData.append('file', file);
          cloudFormData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default');

          const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`, {
            method: 'POST',
            body: cloudFormData,
          });

          if (!res.ok) {
            throw new Error('Failed to upload one or more files.');
          }

          const data = await res.json();
          uploadedUrls.push(data.secure_url);
        }
      }

      const response = await submitAcademyAssignment(assignmentId, { fileUrls: uploadedUrls, studentNote });
      setAssignments((current) =>
        current.map((assignment) => assignment.id === assignmentId ? { ...assignment, submission: response.submission } : assignment)
      );
      setSelectedFiles([]);
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
          { key: 'live', label: 'Live Classes', icon: MessageSquare },
          { key: 'quizzes', label: 'Quizzes', icon: CheckCircle2 }
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
              activeLesson.isLocked ? (
                <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl bg-slate-950 border border-slate-800">
                  <Lock className="h-16 w-16 text-slate-500 mb-4" />
                  <h3 className="text-2xl font-bold text-white">Premium Content Locked</h3>
                  <p className="text-slate-400 mt-2 mb-8 max-w-md">This lesson is locked. You need to purchase the course to access the full Scrimba-style interactive workspace.</p>
                  
                  {courseData.enrollment?.paymentStatus === 'verifying' ? (
                    <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-6 py-4 rounded-xl font-semibold">
                      Your payment receipt is being verified by an admin. Access will be granted shortly.
                    </div>
                  ) : (
                    <div className="w-full max-w-md space-y-4 text-left border border-slate-800 bg-slate-900 p-6 rounded-2xl">
                       <h4 className="font-bold text-white text-lg border-b border-slate-800 pb-2">Unlock Course (N {courseData.course.price.toLocaleString()})</h4>
                       <p className="text-sm text-slate-400">1. Transfer to: <strong className="text-white">UBA - 200XXXXXXX (KennyKentola)</strong></p>
                       <p className="text-sm text-slate-400">2. Upload your payment receipt screenshot below:</p>
                       <input 
                         aria-label="Upload Payment Receipt"
                         type="file" 
                         accept="image/*" 
                         id="receipt-upload"
                         disabled={actionLoading}
                         className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                       />
                       <button
                         disabled={actionLoading}
                         onClick={async () => {
                           const input = document.getElementById('receipt-upload') as HTMLInputElement;
                           const file = input?.files?.[0];
                           if (!file) {
                             setError('Please select a receipt image to upload.');
                             return;
                           }
                           setActionLoading(true);
                           setMessage('');
                           setError('');
                           try {
                             const reader = new FileReader();
                             reader.onloadend = async () => {
                               try {
                                 await submitCoursePayment(courseData.course.id, reader.result as string, courseData.course.price);
                                 setMessage('Payment receipt submitted successfully! Pending admin verification.');
                                 // Update local state
                                 if (courseData.enrollment) {
                                   courseData.enrollment.paymentStatus = 'verifying';
                                 }
                               } catch (err: any) {
                                 setError(err.message || 'Failed to submit payment.');
                               } finally {
                                 setActionLoading(false);
                               }
                             };
                             reader.readAsDataURL(file);
                           } catch (err: any) {
                             setError(err.message);
                             setActionLoading(false);
                           }
                         }}
                         className="mt-4 w-full rounded-xl bg-indigo-600 py-3 font-bold text-white transition hover:bg-indigo-500 disabled:opacity-50"
                       >
                         {actionLoading ? 'Submitting...' : 'Submit Receipt'}
                       </button>
                       {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
                       {message && <p className="text-sm text-green-400 mt-2">{message}</p>}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col xl:flex-row gap-6">
                  <div className="flex-1">
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
                  </div>
                  
                  {/* Scrimba-style Interactive Editor Panel */}
                  <div className="flex-1 flex flex-col rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 min-h-[500px]">
                    <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 text-xs font-semibold text-slate-400 flex flex-col sm:flex-row justify-between sm:items-center gap-3 shrink-0">
                      <div className="flex items-center justify-between sm:justify-start gap-4 w-full sm:w-auto">
                        <span className="text-indigo-400 font-bold tracking-wider uppercase truncate">Code Workspace</span>
                        <select 
                          title="Programming Language" 
                          aria-label="Programming Language" 
                          className="bg-slate-800 rounded px-2 py-1.5 border-none outline-none text-slate-300 cursor-pointer shrink-0"
                          value={selectedLanguage}
                          onChange={(e) => {
                            const newLang = e.target.value;
                            if (!editorCode || editorCode === getDefaultCode(selectedLanguage) || editorCode === '// Write your code here...') {
                              setEditorCode(getDefaultCode(newLang));
                            }
                            setSelectedLanguage(newLang);
                          }}
                        >
                          <option value="javascript">JavaScript</option>
                          <option value="typescript">TypeScript</option>
                          <option value="python">Python</option>
                          <option value="html">HTML/CSS</option>
                          <option value="java">Java</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
                        <button 
                          onClick={handleSaveCode} 
                          disabled={isSaving}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded transition-colors disabled:opacity-50"
                        >
                          {isSaving ? 'Saving...' : 'Save'}
                        </button>
                        <button 
                          onClick={handleRunCode}
                          disabled={isExecuting} 
                          className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded flex items-center gap-1 transition-colors disabled:opacity-50"
                        >
                          <Play className="w-3 h-3" />
                          {isExecuting ? 'Running...' : 'Run Code'}
                        </button>
                      </div>
                    </div>
                    <div className="h-[400px] w-full">
                        <Editor
                          height="400px"
                          language={selectedLanguage === 'html' ? 'html' : selectedLanguage}
                          theme="vs-dark"
                          value={editorCode}
                          onChange={(val) => setEditorCode(val || '')}
                        options={{ 
                          minimap: { enabled: false }, 
                          fontSize: 14,
                          padding: { top: 16 },
                          scrollBeyondLastLine: false,
                          automaticLayout: true
                        }}
                      />
                    </div>
                    {/* Output Panel */}
                    <div className="bg-[#1e1e1e] border-t-2 border-indigo-500/50 flex flex-col" id="terminal-output-panel">
                      <div className="bg-[#2d2d2d] px-4 py-2 text-xs font-mono text-slate-400 uppercase tracking-wider flex justify-between items-center shrink-0">
                        <span className="flex items-center gap-2">
                          Terminal Output
                          {output && <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
                        </span>
                        {output && (
                          <button onClick={() => setOutput('')} className="text-[10px] text-slate-500 hover:text-white transition-colors">Clear</button>
                        )}
                      </div>
                      <div className="h-[200px] overflow-y-auto">
                        {selectedLanguage === 'html' ? (
                          <iframe 
                            title="Code Output" 
                            sandbox="allow-scripts"
                            key={executionCount}
                            className="w-full h-full bg-[#1e1e1e] border-none"
                            srcDoc={output || `<!DOCTYPE html><html><head><style>body{background:#1e1e1e;color:#34d399;font-family:monospace;font-size:14px;padding:10px;margin:0;}</style></head><body>Ready. Waiting for execution...</body></html>`}
                          />
                        ) : (
                          <pre className="bg-[#1e1e1e] text-emerald-400 font-mono text-sm p-4 whitespace-pre-wrap break-words m-0 min-h-full">{output || '▶ Ready. Click "Run Code" to see output here.'}</pre>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
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
                <div className="border-2 border-dashed border-slate-800 rounded-xl p-4 hover:bg-slate-900/50 transition-colors">
                  <p className="text-sm text-slate-400 mb-2">Upload Files (PDF, ZIP, DOCX, Images)</p>
                  <input
                    type="file"
                    multiple
                    title="Upload Assignment Files"
                    onChange={(e) => {
                      if (e.target.files) {
                        setSelectedFiles(Array.from(e.target.files));
                      }
                    }}
                    className="w-full text-xs text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20 cursor-pointer"
                  />
                  {selectedFiles.length > 0 && (
                    <ul className="mt-3 text-xs text-slate-400 space-y-1">
                      {selectedFiles.map((f, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <FileText className="h-3 w-3" />
                          {f.name} ({(f.size / 1024 / 1024).toFixed(2)} MB)
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <textarea value={studentNote} onChange={(event) => setStudentNote(event.target.value)} placeholder="Notes to instructor (e.g. Github Repo Link)" className="h-20 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500" />
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
      {activeTab === 'quizzes' && (
        <div className="grid gap-4 md:grid-cols-2">
          {quizzes.map((quiz) => {
            const attempt = quizAttempts.find(a => a.quizId === quiz.$id);
            return (
              <div key={quiz.$id} className="rounded-3xl border border-white/5 bg-slate-900/30 p-6 flex flex-col h-full">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-bold text-white">{quiz.title}</h2>
                  {attempt ? (
                    <span className={`rounded-full px-3 py-1 text-[10px] font-bold border ${attempt.passed ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-rose-500/30 bg-rose-500/10 text-rose-400'}`}>
                      {attempt.passed ? 'PASSED' : 'FAILED'}
                    </span>
                  ) : (
                    <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-[10px] font-bold text-indigo-400">
                      TODO
                    </span>
                  )}
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-400 flex-1">{quiz.description}</p>
                <p className="mt-3 text-xs text-slate-500 font-semibold">{quiz.timeLimitMinutes} Mins • {quiz.passingScore}% to pass</p>
                
                {attempt ? (
                  <div className="mt-5 rounded-xl border border-white/5 bg-slate-950/50 p-4">
                    <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Your Score</div>
                    <div className="text-2xl font-black text-white">{attempt.score}%</div>
                    <Link
                      href={`/student/courses/${courseId}/quizzes/${quiz.$id}/take`}
                      className="mt-3 block text-center rounded-xl bg-slate-800 hover:bg-slate-700 px-5 py-2.5 text-xs font-bold text-white transition-colors"
                    >
                      View Results
                    </Link>
                  </div>
                ) : (
                  <Link
                    href={`/student/courses/${courseId}/quizzes/${quiz.$id}/take`}
                    className="mt-5 text-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-500 transition-colors"
                  >
                    Start Quiz
                  </Link>
                )}
              </div>
            );
          })}
          {quizzes.length === 0 && <p className="text-sm text-slate-400 col-span-2">No quizzes are available for this course yet.</p>}
        </div>
      )}

      {/* AI Tutor Chat */}
      <AITutorChat 
        courseTitle={courseData?.course?.title} 
        lessonTitle={activeLesson?.title} 
      />
    </div>
  );
}
