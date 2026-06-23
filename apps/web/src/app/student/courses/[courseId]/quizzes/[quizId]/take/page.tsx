'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle, Clock, ChevronRight, ChevronLeft, Award } from 'lucide-react';
import { 
  fetchCourseQuizzes, 
  fetchQuizQuestions, 
  fetchQuizAttempt, 
  submitQuizAttempt,
  QuizDto,
  QuizQuestionDto,
  QuizAttemptDto
} from '../../../../../../../features/academy/api';
// @ts-ignore
import confetti from 'canvas-confetti';

const getProgressWidthClass = (progress: number) => {
  const rounded = Math.round((progress || 0) / 5) * 5;
  switch (rounded) {
    case 5: return 'w-[5%]';
    case 10: return 'w-[10%]';
    case 15: return 'w-[15%]';
    case 20: return 'w-[20%]';
    case 25: return 'w-[25%]';
    case 30: return 'w-[30%]';
    case 35: return 'w-[35%]';
    case 40: return 'w-[40%]';
    case 45: return 'w-[45%]';
    case 50: return 'w-[50%]';
    case 55: return 'w-[55%]';
    case 60: return 'w-[60%]';
    case 65: return 'w-[65%]';
    case 70: return 'w-[70%]';
    case 75: return 'w-[75%]';
    case 80: return 'w-[80%]';
    case 85: return 'w-[85%]';
    case 90: return 'w-[90%]';
    case 95: return 'w-[95%]';
    case 100: return 'w-full';
    default: return 'w-0';
  }
};

export default function QuizTaker() {
  const params = useParams() as Record<string, string>;
  const router = useRouter();
  const courseId = params?.courseId as string;
  const quizId = params?.quizId as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [quiz, setQuiz] = useState<QuizDto | null>(null);
  const [questions, setQuestions] = useState<QuizQuestionDto[]>([]);
  const [attempt, setAttempt] = useState<QuizAttemptDto | null>(null);

  // Quiz State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({}); // questionId -> 'A'|'B'|'C'|'D'

  useEffect(() => {
    loadQuizData();
  }, [courseId, quizId]);

  const loadQuizData = async () => {
    setLoading(true);
    try {
      // Fetch quiz details
      const { quizzes } = await fetchCourseQuizzes(courseId);
      const qz = quizzes.find(q => q.$id === quizId);
      if (!qz) throw new Error('Quiz not found or not available.');
      setQuiz(qz);

      // Fetch questions
      const qRes = await fetchQuizQuestions(quizId);
      const sortedQ = (qRes.questions || []).sort((a, b) => (a.order || 0) - (b.order || 0));
      setQuestions(sortedQ);

      // Check for previous attempt
      try {
        const attRes = await fetchQuizAttempt(quizId);
        if (attRes.attempt) {
          setAttempt(attRes.attempt);
        }
      } catch (e) {
        // No attempt yet, totally fine
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId: string, option: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      if (!confirm('You have unanswered questions. Are you sure you want to submit?')) return;
    }

    setSubmitting(true);
    try {
      const res = await submitQuizAttempt(quizId, {
        courseId,
        answers: JSON.stringify(answers)
      });
      setAttempt(res.attempt);
      
      if (res.attempt.passed) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#3b82f6', '#8b5cf6']
        });
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-6">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="mx-auto h-12 w-12 text-rose-500" />
          <h2 className="text-xl font-bold">Quiz Error</h2>
          <p className="text-slate-400 text-sm">{error || 'Quiz could not be loaded.'}</p>
          <button onClick={() => router.push(`/student/courses/${courseId}`)} className="mt-4 px-6 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold hover:bg-slate-800 transition-colors">
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  // --- RESULTS SCREEN ---
  if (attempt) {
    const isPassed = attempt.passed;
    const scorePercentage = attempt.score; // Assumes score is a percentage 0-100 in the schema, wait. The schema says score is an integer. Let's assume it's calculated correctly by backend.
    
    // Parse answers to show review
    let studentAnswers: Record<string, string> = {};
    try { studentAnswers = JSON.parse(attempt.answers || '{}'); } catch(e){}

    return (
      <div className="min-h-screen bg-slate-950 font-sans text-slate-200 py-12 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto space-y-8">
          
          <button onClick={() => router.push(`/student/courses/${courseId}`)} className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Course
          </button>

          <div className={`glass-panel rounded-3xl p-8 sm:p-12 text-center border relative overflow-hidden ${isPassed ? 'border-emerald-500/30 bg-emerald-950/10' : 'border-rose-500/30 bg-rose-950/10'}`}>
            <div className={`absolute top-0 left-0 w-full h-1 ${isPassed ? 'bg-gradient-to-r from-emerald-400 to-teal-400' : 'bg-gradient-to-r from-rose-500 to-orange-500'}`} />
            
            <div className="flex justify-center mb-6">
              {isPassed ? (
                <div className="h-20 w-20 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)]">
                  <Award className="h-10 w-10 text-emerald-400" />
                </div>
              ) : (
                <div className="h-20 w-20 rounded-full bg-rose-500/20 flex items-center justify-center border border-rose-500/30">
                  <XCircle className="h-10 w-10 text-rose-400" />
                </div>
              )}
            </div>

            <h1 className="text-3xl font-black text-white mb-2">{isPassed ? 'Congratulations!' : 'Keep trying!'}</h1>
            <p className="text-slate-400 mb-8 max-w-sm mx-auto">{isPassed ? `You successfully passed ${quiz.title}.` : `You did not meet the ${quiz.passingScore}% requirement to pass ${quiz.title}.`}</p>

            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Your Score</div>
                <div className={`text-4xl font-black ${isPassed ? 'text-emerald-400' : 'text-rose-400'}`}>{attempt.score}%</div>
              </div>
              <div className="w-px h-12 bg-slate-800" />
              <div className="text-center">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Required</div>
                <div className="text-4xl font-black text-slate-300">{quiz.passingScore}%</div>
              </div>
            </div>
          </div>

          {/* Question Review */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-6">Review your answers</h3>
            {questions.map((q, idx) => {
              const selectedOpt = studentAnswers[q.$id!];
              const isCorrect = selectedOpt === q.correctOption;
              
              return (
                <div key={q.$id} className="glass-panel border border-white/5 rounded-2xl p-6 bg-slate-900/30">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="shrink-0 mt-1">
                      {isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-rose-500" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white leading-relaxed">{idx + 1}. {q.question}</h4>
                      
                      <div className="mt-4 space-y-2">
                        {['A', 'B', 'C', 'D'].map(opt => {
                          const val = q[`option${opt}` as keyof QuizQuestionDto];
                          if (!val) return null;
                          
                          let optClass = 'bg-slate-950/50 border-white/5 text-slate-500';
                          if (q.correctOption === opt) {
                            optClass = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold';
                          } else if (selectedOpt === opt) {
                            optClass = 'bg-rose-500/10 border-rose-500/30 text-rose-400';
                          }

                          return (
                            <div key={opt} className={`flex items-center gap-3 p-3 rounded-xl border text-xs ${optClass}`}>
                              <span className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center border border-white/5 shrink-0">{opt}</span>
                              <span>{val as string}</span>
                              {q.correctOption === opt && <CheckCircle2 className="h-4 w-4 ml-auto" />}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    );
  }

  // --- WIZARD SCREEN ---
  const currentQuestion = questions[currentIndex];
  const progressPercentage = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-950 font-sans flex flex-col relative text-slate-200">
      
      {/* Top Progress Bar */}
      <div className="h-1.5 w-full bg-slate-900 absolute top-0 left-0 z-50">
        <div 
          className={`h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out ${getProgressWidthClass(progressPercentage)}`}
        />
      </div>

      {/* Header */}
      <header className="h-20 px-6 sm:px-12 flex items-center justify-between border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push(`/student/courses/${courseId}`)}
            className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Exit
          </button>
          <div className="h-6 w-px bg-slate-800 hidden sm:block" />
          <h1 className="text-sm sm:text-base font-bold text-white truncate max-w-[200px] sm:max-w-md">{quiz.title}</h1>
        </div>
        
        <div className="flex items-center gap-3 glass-panel px-4 py-2 rounded-full border border-white/5">
          <Clock className="h-4 w-4 text-indigo-400" />
          <span className="text-xs font-bold text-slate-300">{quiz.timeLimitMinutes} Mins</span>
        </div>
      </header>

      {/* Question Content */}
      <main className="flex-1 flex flex-col justify-center items-center p-6 pb-32">
        <div className="w-full max-w-3xl">
          
          {/* Question Counter */}
          <div className="text-center mb-8">
            <span className="text-[10px] uppercase tracking-widest font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              Question {currentIndex + 1} of {questions.length}
            </span>
          </div>

          {currentQuestion ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-12 text-center">
                {currentQuestion.question}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {['A', 'B', 'C', 'D'].map((opt) => {
                  const val = currentQuestion[`option${opt}` as keyof QuizQuestionDto];
                  if (!val) return null;
                  
                  const isSelected = answers[currentQuestion.$id!] === opt;

                  return (
                    <button
                      key={opt}
                      onClick={() => handleSelectOption(currentQuestion.$id!, opt)}
                      className={`text-left p-5 rounded-2xl border transition-all duration-200 group flex items-start gap-4 ${
                        isSelected 
                          ? 'bg-indigo-600 border-indigo-400 shadow-[0_0_30px_-10px_rgba(99,102,241,0.5)]' 
                          : 'bg-slate-900/50 border-white/5 hover:border-indigo-500/30 hover:bg-slate-800/80'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border text-xs font-bold transition-colors ${
                        isSelected ? 'bg-indigo-800 border-indigo-400 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 group-hover:text-indigo-400 group-hover:border-indigo-500/50'
                      }`}>
                        {opt}
                      </div>
                      <span className={`text-sm mt-1.5 ${isSelected ? 'text-white font-semibold' : 'text-slate-300'}`}>
                        {val as string}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-500">No questions found for this quiz.</div>
          )}

        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="fixed bottom-0 left-0 w-full glass-panel border-t border-white/5 bg-slate-950/80 backdrop-blur-xl p-4 sm:px-12 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-800 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-900 transition-all disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>

          {currentIndex === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-xs font-bold text-white transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Quiz'} <CheckCircle2 className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
              className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-slate-100 hover:bg-white text-xs font-bold text-slate-900 transition-all"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </footer>

    </div>
  );
}
