'use client';

import { useEffect, useState, use } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { client } from '@/lib/appwrite';
import { Databases, ID, Query } from 'appwrite';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Course, Lesson } from '@company/shared';
import { fetchCourseTestimonials, TestimonialDto } from '@/features/academy/api';
import { Star } from 'lucide-react';

export default function CourseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { user } = useAuth();
  const router = useRouter();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [loading, setLoading] = useState(true);
  const [testimonials, setTestimonials] = useState<TestimonialDto[]>([]);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    if (user && resolvedParams.id) {
      fetchCourseData();
    }
  }, [user, resolvedParams.id]);

  const fetchCourseData = async () => {
    try {
      const databases = new Databases(client);
      const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'multicompany';

      // 1. Fetch Course
      const courseRes = await databases.getDocument(dbId, 'courses', resolvedParams.id);
      setCourse(courseRes as unknown as Course);

      // 2. Fetch Lessons
      const lessonsRes = await databases.listDocuments(dbId, 'lessons', [
        Query.equal('courseId', resolvedParams.id),
        Query.orderAsc('order')
      ]);
      setLessons(lessonsRes.documents as unknown as Lesson[]);

      // 3. Check Enrollment Status
      const enrollRes = await databases.listDocuments(dbId, 'course_enrollments', [
        Query.equal('courseId', resolvedParams.id),
        Query.equal('userId', user!.id)
      ]);
      if (enrollRes.documents.length > 0) {
        setIsEnrolled(true);
      }

      // 4. Fetch Testimonials
      try {
        const testRes = await fetchCourseTestimonials(resolvedParams.id);
        setTestimonials(testRes.testimonials);
        if (testRes.testimonials.length > 0) {
          const avg = testRes.testimonials.reduce((sum, t) => sum + t.rating, 0) / testRes.testimonials.length;
          setAverageRating(Math.round(avg * 10) / 10);
        }
      } catch (err) {
        console.error('Failed to load testimonials', err);
      }

    } catch (err) {
      console.error('Failed to load course details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      const databases = new Databases(client);
      const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'multicompany';

      if (course?.price && course.price > 0) {
        // Mock payment flow redirect
        alert('Redirecting to payment gateway...');
        return;
      }

      // Free course: Enroll instantly
      await databases.createDocument(dbId, 'course_enrollments', ID.unique(), {
        userId: user!.id,
        courseId: course!.$id,
        progress: 0,
        completedLessons: 0,
        status: 'active',
        enrolledAt: new Date().toISOString()
      });

      setIsEnrolled(true);
      
      // Navigate straight to lesson 1
      if (lessons.length > 0) {
        router.push(`/dashboard/academy/learn/${course!.$id}/${lessons[0].$id}`);
      }
    } catch (err) {
      console.error('Enrollment failed:', err);
      alert('Failed to enroll. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-muted">Loading Syllabus...</div>;
  if (!course) return <div className="p-8 text-center text-red-400 bg-red-400/10 rounded-xl">Course not found.</div>;

  return (
    <div className="space-y-8">
      <Link href="/dashboard/academy" className="text-sm text-muted hover:text-primary transition-colors flex items-center space-x-1 mb-4">
        <span>&larr;</span> <span>Back to Catalog</span>
      </Link>

      {/* Hero Section */}
      <div className="glass-panel border border-border rounded-2xl p-8 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-sm font-semibold text-primary uppercase tracking-wider block">
                {(course as any).category || 'Software Engineering'}
              </span>
              {testimonials.length > 0 && (
                <div className="flex items-center gap-1 text-amber-400">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm font-bold text-white">{averageRating}</span>
                  <span className="text-sm text-slate-400">({testimonials.length} reviews)</span>
                </div>
              )}
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-primary-foreground tracking-tight mb-6 leading-tight">
              {course.title}
            </h1>
            <p className="text-lg text-muted mb-8 leading-relaxed">
              {course.description}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {isEnrolled ? (
                <Link 
                  href={lessons.length > 0 ? `/dashboard/academy/learn/${course.$id}/${lessons[0].$id}` : '#'}
                  className="w-full sm:w-auto px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg transition-all shadow-[0_0_20px_rgba(var(--primary),0.3)] text-center"
                >
                  Continue Learning
                </Link>
              ) : (
                <button 
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="w-full sm:w-auto px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg transition-all shadow-[0_0_20px_rgba(var(--primary),0.3)] disabled:opacity-50"
                >
                  {enrolling ? 'Processing...' : `Enroll Now • ${course.price === 0 ? 'Free' : '$'+course.price}`}
                </button>
              )}
            </div>
          </div>
          
          <div className="hidden lg:block w-full aspect-video bg-white/5 rounded-xl border border-border flex items-center justify-center">
             <span className="text-6xl">🎓</span>
          </div>
        </div>
      </div>

      {/* Syllabus */}
      <div>
        <h2 className="text-2xl font-bold text-primary-foreground mb-6">Course Syllabus</h2>
        <div className="glass-panel border border-border rounded-xl overflow-hidden divide-y divide-border">
          {lessons.length === 0 ? (
            <div className="p-8 text-center text-muted">No lessons published yet.</div>
          ) : (
            lessons.map((lesson, index) => (
              <div key={lesson.$id} className="p-6 flex items-start gap-4 hover:bg-white/5 transition-colors">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-bold text-primary-foreground mb-1">{lesson.title}</h3>
                  <p className="text-sm text-muted">{(lesson as any).durationMinutes || '10'} mins</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <div className="pt-8">
          <h2 className="text-2xl font-bold text-primary-foreground mb-6">Student Testimonials</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((t) => (
              <div key={t.$id} className="glass-panel border border-border rounded-xl p-6 relative flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-white">{t.authorName || 'Anonymous'}</span>
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < t.rating ? 'fill-current' : 'text-slate-700'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-slate-300 italic mb-6">"{t.content}"</p>
                <span className="text-xs text-slate-500 mt-auto text-right">
                  {new Date(t.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
