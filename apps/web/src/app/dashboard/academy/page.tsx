'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { client } from '@/lib/appwrite';
import { Databases, Query } from 'appwrite';
import Link from 'next/link';
import { Course } from '@company/shared';

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

export default function AcademyDashboardPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAcademyData();
    }
  }, [user]);

  const fetchAcademyData = async () => {
    try {
      const databases = new Databases(client);
      const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'multicompany';

      // Fetch all published courses
      const coursesRes = await databases.listDocuments(dbId, 'courses', [
        Query.equal('isPublished', true)
      ]);
      setCourses(coursesRes.documents as unknown as Course[]);

      // Fetch user enrollments
      const enrollmentsRes = await databases.listDocuments(dbId, 'course_enrollments', [
        Query.equal('userId', user!.$id)
      ]);
      
      // Match enrollments to course details
      const enrolledWithDetails = enrollmentsRes.documents.map(enrollment => {
        const courseMatch = coursesRes.documents.find(c => c.$id === enrollment.courseId);
        return { ...enrollment, course: courseMatch };
      }).filter(e => e.course);

      setEnrolledCourses(enrolledWithDetails);
    } catch (err) {
      console.error('Failed to fetch academy data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-muted">Loading Academy...</div>;

  return (
    <div className="space-y-12">
      
      {/* Enrolled Courses Section */}
      {enrolledCourses.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-primary-foreground mb-6">Continue Learning</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map(enrollment => (
              <div key={enrollment.$id} className="glass-panel border border-border rounded-xl p-6 hover:border-primary/50 transition-colors">
                <h3 className="font-bold text-lg text-primary-foreground mb-2 truncate">
                  {enrollment.course.title}
                </h3>
                <div className="w-full bg-white/5 rounded-full h-2 mb-4 overflow-hidden">
                  <div 
                    className={`bg-primary h-2 rounded-full ${getProgressWidthClass(enrollment.progress)}`} 
                  />
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted">{enrollment.progress}% Completed</span>
                  <Link 
                    href={enrollment.lastLessonId 
                      ? `/dashboard/academy/learn/${enrollment.courseId}/${enrollment.lastLessonId}` 
                      : `/dashboard/academy/courses/${enrollment.courseId}`
                    } 
                    className="text-primary hover:text-primary/80 font-medium"
                  >
                    Resume &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Course Catalog */}
      <section>
        <div>
          <h1 className="text-3xl font-bold text-primary-foreground tracking-tight">Course Catalog</h1>
          <p className="text-muted mt-1 mb-6 text-sm">Discover new skills in Software, Design, and Data.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map(course => (
            <Link key={course.$id} href={`/dashboard/academy/courses/${course.$id}`} className="group block">
              <div className="glass-panel border border-border rounded-xl overflow-hidden h-full flex flex-col transition-all hover:-translate-y-1 hover:shadow-[0_10px_30px_-15px_rgba(var(--primary),0.3)] hover:border-primary/50">
                {/* Course Cover Placeholder */}
                <div className="h-40 bg-white/5 w-full flex items-center justify-center border-b border-border">
                  <span className="text-4xl">📚</span>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
                    {(course as any).category || 'Course'}
                  </span>
                  <h3 className="font-bold text-primary-foreground mb-2 group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-sm text-muted line-clamp-2 mb-4 flex-1">
                    {(course as any).summary || course.description}
                  </p>
                  <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/5">
                    <span className="text-sm font-medium text-primary-foreground">
                      {course.price === 0 ? 'Free' : `$${course.price}`}
                    </span>
                    <span className="text-xs text-muted">
                      {(course as any).level || 'All Levels'}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}
