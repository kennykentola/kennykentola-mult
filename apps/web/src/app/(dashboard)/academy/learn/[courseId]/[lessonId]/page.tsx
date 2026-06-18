'use client';

import { useEffect, useState, use } from 'react';
import { useAuth } from '@/lib/auth';
import { client } from '@/lib/appwrite';
import { Databases, ID, Query } from 'appwrite';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Course, Lesson } from '@company/shared';
import { VideoPlayer } from '@/components/academy/VideoPlayer';

export default function LessonPlayerPage({ params }: { params: Promise<{ courseId: string, lessonId: string }> }) {
  const resolvedParams = use(params);
  const { user } = useAuth();
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  
  // Progress tracking
  const [progressLog, setProgressLog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingComplete, setMarkingComplete] = useState(false);

  useEffect(() => {
    if (user && resolvedParams.courseId && resolvedParams.lessonId) {
      fetchLearningData();
    }
  }, [user, resolvedParams.courseId, resolvedParams.lessonId]);

  const fetchLearningData = async () => {
    try {
      const databases = new Databases(client);
      const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'multicompany';

      // 1. Fetch Course
      const courseRes = await databases.getDocument(dbId, 'courses', resolvedParams.courseId);
      setCourse(courseRes as unknown as Course);

      // 2. Fetch Lessons
      const lessonsRes = await databases.listDocuments(dbId, 'lessons', [
        Query.equal('courseId', resolvedParams.courseId),
        Query.orderAsc('order')
      ]);
      const fetchedLessons = lessonsRes.documents as unknown as Lesson[];
      setLessons(fetchedLessons);

      const activeLesson = fetchedLessons.find(l => l.$id === resolvedParams.lessonId);
      if (activeLesson) setCurrentLesson(activeLesson);

      // 3. Fetch User Progress for this course
      const progressRes = await databases.listDocuments(dbId, 'lesson_progress', [
        Query.equal('studentId', user!.$id),
        Query.equal('courseId', resolvedParams.courseId)
      ]);
      setProgressLog(progressRes.documents);

    } catch (err) {
      console.error('Failed to load learning environment:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    setMarkingComplete(true);
    try {
      const databases = new Databases(client);
      const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'multicompany';

      // Check if progress document already exists for this lesson
      const existing = progressLog.find(p => p.lessonId === currentLesson!.$id);

      if (existing) {
        if (!existing.isCompleted) {
          await databases.updateDocument(dbId, 'lesson_progress', existing.$id, {
            isCompleted: true,
            completedAt: new Date().toISOString()
          });
        }
      } else {
        await databases.createDocument(dbId, 'lesson_progress', ID.unique(), {
          studentId: user!.$id,
          courseId: course!.$id,
          lessonId: currentLesson!.$id,
          isCompleted: true,
          completedAt: new Date().toISOString()
        });
      }

      // Refresh data to unlock next lesson
      await fetchLearningData();

      // Find next lesson and auto-navigate
      const currentIndex = lessons.findIndex(l => l.$id === currentLesson!.$id);
      if (currentIndex !== -1 && currentIndex + 1 < lessons.length) {
        router.push(`/dashboard/academy/learn/${course!.$id}/${lessons[currentIndex + 1].$id}`);
      } else {
        alert('Congratulations! You have reached the end of the course.');
      }

    } catch (err) {
      console.error('Failed to mark complete:', err);
      alert('Error saving progress.');
    } finally {
      setMarkingComplete(false);
    }
  };

  // Linear progression logic
  const isLessonUnlocked = (index: number) => {
    if (index === 0) return true; // First lesson always unlocked
    // A lesson is unlocked if the immediate previous lesson is marked as completed
    const previousLesson = lessons[index - 1];
    const prevProgress = progressLog.find(p => p.lessonId === previousLesson.$id);
    return prevProgress?.isCompleted === true;
  };

  if (loading) return <div className="p-8 text-center text-muted">Loading Learning Environment...</div>;
  if (!currentLesson) return <div className="p-8 text-center text-red-400 bg-red-400/10 rounded-xl">Lesson not found.</div>;

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-8rem)]">
      
      {/* Main Video Area */}
      <div className="flex-1 space-y-6">
        <VideoPlayer 
          src="https://www.w3schools.com/html/mov_bbb.mp4" // Placeholder MP4 since YouTube was rejected
          onEnded={() => console.log('Video ended naturally')}
        />

        <div className="glass-panel border border-border rounded-xl p-6 lg:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground tracking-tight">{currentLesson.title}</h1>
              <p className="text-muted mt-1 text-sm">{course?.title} • Module 1</p>
            </div>
            
            <button 
              onClick={handleMarkComplete}
              disabled={markingComplete || progressLog.find(p => p.lessonId === currentLesson.$id)?.isCompleted}
              className="w-full md:w-auto px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] disabled:opacity-50 disabled:shadow-none"
            >
              {progressLog.find(p => p.lessonId === currentLesson.$id)?.isCompleted ? '✓ Completed' : (markingComplete ? 'Saving...' : 'Mark as Complete')}
            </button>
          </div>

          <div className="prose prose-invert max-w-none text-muted">
            <p>{currentLesson.content || 'No text content provided for this lesson.'}</p>
          </div>
        </div>
      </div>

      {/* Course Navigation Sidebar */}
      <div className="w-full lg:w-80 flex-shrink-0 space-y-4">
        <div className="glass-panel border border-border rounded-xl p-4 sticky top-6">
          <h2 className="font-bold text-primary-foreground mb-4 px-2">Course Contents</h2>
          <div className="space-y-1">
            {lessons.map((lesson, index) => {
              const unlocked = isLessonUnlocked(index);
              const isActive = lesson.$id === currentLesson.$id;
              const isCompleted = progressLog.find(p => p.lessonId === lesson.$id)?.isCompleted;

              return (
                <div key={lesson.$id}>
                  {unlocked ? (
                    <Link 
                      href={`/dashboard/academy/learn/${course!.$id}/${lesson.$id}`}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        isActive 
                          ? 'bg-primary/20 text-primary border border-primary/30' 
                          : 'hover:bg-white/5 text-muted hover:text-primary-foreground border border-transparent'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isCompleted ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-muted'
                      }`}>
                        {isCompleted ? '✓' : index + 1}
                      </div>
                      <span className="font-medium text-sm line-clamp-2 flex-1">{lesson.title}</span>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-3 p-3 rounded-lg opacity-50 cursor-not-allowed">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs bg-white/5 text-muted/50">
                        🔒
                      </div>
                      <span className="font-medium text-sm line-clamp-2 flex-1 text-muted">{lesson.title}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}
