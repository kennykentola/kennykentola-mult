'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus, Trash2, Edit2, AlertCircle, CheckCircle2, Copy } from 'lucide-react';
import { 
  fetchAcademyCourse, 
  updateQuiz, 
  fetchQuizQuestions, 
  addQuizQuestion, 
  updateQuizQuestion, 
  deleteQuizQuestion,
  QuizDto,
  QuizQuestionDto
} from '../../../../../../features/academy/api';

export default function QuizBuilder() {
  const params = useParams() as Record<string, string>;
  const router = useRouter();
  const courseId = params?.courseId as string;
  const quizId = params?.quizId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  // Settings
  const [quizSettings, setQuizSettings] = useState<Partial<QuizDto>>({
    title: '',
    description: '',
    timeLimitMinutes: 30,
    passingScore: 70,
    isPublished: false
  });

  // Questions
  const [questions, setQuestions] = useState<QuizQuestionDto[]>([]);
  
  // Question Modal
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [questionForm, setQuestionForm] = useState<Partial<QuizQuestionDto>>({
    question: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctOption: 'A',
    points: 1
  });

  useEffect(() => {
    loadData();
  }, [courseId, quizId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // We need to fetch the course to get its quizzes, and then find our quiz.
      // Alternatively, we could add a `fetchQuiz(quizId)` API, but `fetchCourse` or `fetchCourseQuizzes` works.
      const { quizzes } = await import('../../../../../../features/academy/api').then(m => m.fetchCourseQuizzes(courseId));
      const qz = quizzes.find(q => q.$id === quizId);
      if (qz) {
        setQuizSettings(qz);
      } else {
        throw new Error('Quiz not found');
      }

      const qRes = await fetchQuizQuestions(quizId);
      // Sort by order or just the order they were returned
      const sortedQ = (qRes.questions || []).sort((a, b) => (a.order || 0) - (b.order || 0));
      setQuestions(sortedQ);
    } catch (err: any) {
      setError(err.message || 'Failed to load quiz details');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await updateQuiz(quizId, {
        title: quizSettings.title,
        description: quizSettings.description,
        timeLimitMinutes: Number(quizSettings.timeLimitMinutes),
        passingScore: Number(quizSettings.passingScore),
        isPublished: quizSettings.isPublished
      });
      // show success toast or similar (we'll just use a small local state if needed)
    } catch (err: any) {
      alert(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenQuestionModal = (q?: QuizQuestionDto) => {
    if (q) {
      setEditingQuestionId(q.$id!);
      setQuestionForm(q);
    } else {
      setEditingQuestionId(null);
      setQuestionForm({
        question: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctOption: 'A',
        points: 1
      });
    }
    setShowQuestionModal(true);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingQuestionId) {
        await updateQuizQuestion(editingQuestionId, questionForm);
      } else {
        await addQuizQuestion(quizId, {
          ...questionForm,
          order: questions.length + 1
        });
      }
      setShowQuestionModal(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to save question');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuestion = async (qId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      await deleteQuizQuestion(qId);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete question');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-20">
      {/* Header */}
      <div className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/instructor/courses')}
              aria-label="Back to courses"
              className="p-2 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-3">
                Quiz Builder
                {quizSettings.isPublished ? (
                  <span className="text-[10px] uppercase font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">Published</span>
                ) : (
                  <span className="text-[10px] uppercase font-bold bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">Draft</span>
                )}
              </h1>
              <p className="text-xs text-slate-500 font-medium">Configure settings and add questions</p>
            </div>
          </div>
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Settings */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel rounded-3xl p-6 border border-white/5 bg-slate-900/30">
            <h2 className="text-lg font-bold text-white mb-6">Quiz Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="quizTitle" className="text-xs font-semibold text-slate-400 block mb-1.5">Quiz Title</label>
                <input
                  id="quizTitle"
                  type="text"
                  value={quizSettings.title || ''}
                  onChange={e => setQuizSettings({...quizSettings, title: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <div>
                <label htmlFor="quizDescription" className="text-xs font-semibold text-slate-400 block mb-1.5">Description</label>
                <textarea
                  id="quizDescription"
                  rows={3}
                  value={quizSettings.description || ''}
                  onChange={e => setQuizSettings({...quizSettings, description: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="timeLimit" className="text-xs font-semibold text-slate-400 block mb-1.5">Time Limit (mins)</label>
                  <input
                    id="timeLimit"
                    type="number"
                    min="1"
                    value={quizSettings.timeLimitMinutes || 0}
                    onChange={e => setQuizSettings({...quizSettings, timeLimitMinutes: Number(e.target.value)})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
                <div>
                  <label htmlFor="passingScore" className="text-xs font-semibold text-slate-400 block mb-1.5">Passing Score (%)</label>
                  <input
                    id="passingScore"
                    type="number"
                    min="1"
                    max="100"
                    value={quizSettings.passingScore || 0}
                    onChange={e => setQuizSettings({...quizSettings, passingScore: Number(e.target.value)})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-10 h-5 rounded-full flex items-center p-1 transition-colors ${quizSettings.isPublished ? 'bg-indigo-500' : 'bg-slate-800'}`}>
                    <div className={`w-3 h-3 rounded-full bg-white transition-transform ${quizSettings.isPublished ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">Publish Quiz</div>
                    <div className="text-[10px] text-slate-500">Make it visible to students</div>
                  </div>
                  <input 
                    type="checkbox" 
                    className="hidden"
                    checked={quizSettings.isPublished || false}
                    onChange={e => setQuizSettings({...quizSettings, isPublished: e.target.checked})}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Questions */}
        <div className="lg:col-span-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Questions <span className="text-xs font-semibold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">{questions.length}</span>
            </h2>
            <button
              onClick={() => handleOpenQuestionModal()}
              className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 px-4 py-2 text-xs font-bold flex items-center gap-2 transition-all"
            >
              <Plus className="h-4 w-4" />
              Add Question
            </button>
          </div>

          {questions.length === 0 ? (
            <div className="glass-panel border border-dashed border-white/10 rounded-3xl p-12 text-center bg-slate-900/20">
              <div className="h-16 w-16 bg-slate-800/50 text-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3">
                <Plus className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-white">No questions yet</h3>
              <p className="text-slate-400 text-sm mt-2 max-w-sm mx-auto">Build your assessment by adding multiple-choice questions.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((q, idx) => (
                <div key={q.$id} className="glass-panel border border-white/5 rounded-2xl p-5 bg-slate-900/30 group hover:border-indigo-500/30 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-black text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-md">Q{idx + 1}</span>
                        <span className="text-[10px] font-semibold text-slate-500">{q.points} {q.points === 1 ? 'Point' : 'Points'}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-white leading-relaxed">{q.question}</h4>
                      
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {['A', 'B', 'C', 'D'].map(opt => {
                          const val = q[`option${opt}` as keyof QuizQuestionDto];
                          if (!val) return null;
                          const isCorrect = q.correctOption === opt;
                          return (
                            <div key={opt} className={`flex items-start gap-3 p-2.5 rounded-xl border text-xs ${isCorrect ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-100' : 'bg-slate-950/50 border-white/5 text-slate-400'}`}>
                              <span className={`font-bold ${isCorrect ? 'text-emerald-400' : 'text-slate-600'}`}>{opt}</span>
                              <span className="flex-1">{val as string}</span>
                              {isCorrect && <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenQuestionModal(q)} aria-label="Edit Question" className="p-2 bg-slate-800 hover:bg-indigo-500 text-slate-400 hover:text-white rounded-lg transition-colors">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDeleteQuestion(q.$id!)} aria-label="Delete Question" className="p-2 bg-slate-800 hover:bg-rose-500 text-slate-400 hover:text-white rounded-lg transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Question Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowQuestionModal(false)} />
          <div className="relative z-10 w-full max-w-2xl glass-panel rounded-3xl border border-white/10 shadow-2xl bg-slate-900/90 backdrop-blur-md max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <h3 className="text-xl font-bold text-white mb-6">{editingQuestionId ? 'Edit Question' : 'Add Question'}</h3>
              
              <form onSubmit={handleSaveQuestion} className="space-y-6">
                <div>
                  <label htmlFor="questionText" className="text-xs font-semibold text-slate-400 block mb-1.5">Question Text</label>
                  <textarea
                    id="questionText"
                    required
                    rows={3}
                    placeholder="E.g., What is the primary purpose of a useEffect hook?"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 resize-none"
                    value={questionForm.question}
                    onChange={e => setQuestionForm({...questionForm, question: e.target.value})}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-semibold text-slate-400 block">Options & Correct Answer</label>
                  
                  {['A', 'B', 'C', 'D'].map((opt) => (
                    <div key={opt} className={`flex items-center gap-3 p-3 rounded-xl border ${questionForm.correctOption === opt ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-slate-950 border-slate-800'}`}>
                      <label className="flex items-center gap-2 cursor-pointer pl-1 shrink-0">
                        <input 
                          type="radio" 
                          name="correctOption" 
                          checked={questionForm.correctOption === opt}
                          onChange={() => setQuestionForm({...questionForm, correctOption: opt as any})}
                          className="text-emerald-500 focus:ring-emerald-500 h-4 w-4 bg-slate-900 border-slate-700"
                        />
                        <span className={`font-bold text-xs ${questionForm.correctOption === opt ? 'text-emerald-400' : 'text-slate-500'}`}>{opt}</span>
                      </label>
                      <input
                        type="text"
                        required={opt === 'A' || opt === 'B'}
                        placeholder={opt === 'A' || opt === 'B' ? 'Required option' : 'Optional'}
                        className="flex-1 bg-transparent border-none text-sm text-white focus:outline-none focus:ring-0 placeholder:text-slate-600"
                        value={questionForm[`option${opt}` as keyof QuizQuestionDto] as string || ''}
                        onChange={e => setQuestionForm({...questionForm, [`option${opt}`]: e.target.value})}
                      />
                    </div>
                  ))}
                  <p className="text-[10px] text-slate-500 pl-1 mt-1">Select the radio button next to the correct answer. Options C and D are optional.</p>
                </div>

                <div>
                  <label htmlFor="points" className="text-xs font-semibold text-slate-400 block mb-1.5">Points</label>
                  <input
                    id="points"
                    type="number"
                    min="1"
                    required
                    className="w-full sm:w-1/3 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                    value={questionForm.points}
                    onChange={e => setQuestionForm({...questionForm, points: Number(e.target.value)})}
                  />
                </div>

                <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-800 mt-8">
                  <button
                    type="button"
                    onClick={() => setShowQuestionModal(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Question'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
