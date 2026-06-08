'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Play, Search, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../../../features/auth/AuthContext';

const getProgressWidthClass = (progress: number) => {
  const rounded = Math.round((progress || 0) / 10) * 10;
  switch (rounded) {
    case 10: return 'w-[10%]';
    case 20: return 'w-[20%]';
    case 30: return 'w-[30%]';
    case 40: return 'w-[40%]';
    case 50: return 'w-[50%]';
    case 60: return 'w-[60%]';
    case 70: return 'w-[70%]';
    case 75: return 'w-[75%]';
    case 80: return 'w-[80%]';
    case 90: return 'w-[90%]';
    case 100: return 'w-full';
    default: return 'w-0';
  }
};
import {
  academyOverview,
  catalogCourses as fallbackCatalogCourses,
  enrolledCourses as fallbackEnrolledCourses
} from '../../../features/academy/content';
import {
  AcademyCatalogResponse,
  AcademyProgressResponse,
  enrollInAcademyCourse,
  fetchAcademyCatalog,
  fetchAcademyProgress
} from '../../../features/academy/api';

const coverColors = [
  'from-violet-600 to-indigo-600',
  'from-blue-600 to-cyan-600',
  'from-emerald-600 to-teal-600',
  'from-rose-600 to-pink-600',
  'from-amber-600 to-orange-600'
];

type CatalogCourse = AcademyCatalogResponse['courses'][number] | (typeof fallbackCatalogCourses)[number];

const getCourseInstructor = (course: CatalogCourse) =>
  'instructorName' in course ? course.instructorName : course.instructor;

const getCoursePriceLabel = (course: CatalogCourse) => {
  const price = course.price;
  if (typeof price === 'number') {
    return price === 0 ? 'Free' : `$${price}`;
  }
  return price;
};

const getCourseLessonCount = (course: CatalogCourse) =>
  'lessonCount' in course ? course.lessonCount : course.lessons;

export default function CoursesPage() {
  const pathname = usePathname();
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'my-courses' | 'browse'>('my-courses');
  const [searchQuery, setSearchQuery] = useState('');
  const [catalog, setCatalog] = useState<AcademyCatalogResponse['courses'] | null>(null);
  const [progress, setProgress] = useState<AcademyProgressResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const portalBasePath = pathname?.startsWith('/student') ? '/student' : '/dashboard';

  useEffect(() => {
    let cancelled = false;

    async function loadAcademyData() {
      if (!profile) return;

      setLoading(true);
      setError('');

      try {
        const [catalogData, progressData] = await Promise.all([
          fetchAcademyCatalog(),
          fetchAcademyProgress()
        ]);

        if (cancelled) return;

        setCatalog(catalogData.courses);
        setProgress(progressData);
      } catch (err: any) {
        if (cancelled) return;

        setCatalog(null);
        setProgress(null);
        setError(err?.message || 'Unable to load academy data.');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAcademyData();

    return () => {
      cancelled = true;
    };
  }, [profile?.userId]);

  const normalizedQuery = searchQuery.toLowerCase().trim();
  const courseCatalog: CatalogCourse[] = catalog ?? fallbackCatalogCourses;
  const enrolledCards = progress
    ? progress.enrollments.map((enrollment, index) => ({
        id: enrollment.id,
        title: enrollment.course.title,
        description: enrollment.course.description,
        instructor: enrollment.course.instructorName,
        progress: enrollment.progress || 0,
        lessons: enrollment.course.lessonCount || 0,
        completedLessons: enrollment.completedLessons || 0,
        activeLesson: enrollment.nextLesson
          ? `Lesson ${enrollment.nextLesson.order}: ${enrollment.nextLesson.title}`
          : 'Next lesson unavailable',
        coverColor: coverColors[index % coverColors.length],
        category: enrollment.course.category || 'Academy'
      }))
    : fallbackEnrolledCourses;

  const filteredEnrolled = enrolledCards.filter((course) =>
    `${course.title} ${course.description} ${course.instructor}`.toLowerCase().includes(normalizedQuery)
  );

  const filteredCatalog = courseCatalog.filter((course) =>
    `${course.title} ${course.description} ${getCourseInstructor(course)}`.toLowerCase().includes(normalizedQuery)
  );

  const enrolledIds = useMemo(() => {
    return new Set((progress?.enrollments || []).map((enrollment) => enrollment.courseId));
  }, [progress]);

  const handleEnroll = async (courseId: string) => {
    try {
      setEnrollingCourseId(courseId);
      setError('');
      await enrollInAcademyCourse(courseId);
      const updatedProgress = await fetchAcademyProgress();
      setProgress(updatedProgress);
      setActiveTab('my-courses');
    } catch (err: any) {
      setError(err?.message || 'Unable to enroll in the selected course.');
    } finally {
      setEnrollingCourseId(null);
    }
  };

  if (!profile) {
    return null;
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">{academyOverview.title}</h1>
          <p className="text-slate-400 text-sm mt-1">{academyOverview.heroCopy}</p>
        </div>

        <div className="flex bg-slate-900/60 p-1 border border-white/5 rounded-xl self-start">
          <button
            onClick={() => setActiveTab('my-courses')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'my-courses' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            My Courses
          </button>
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'browse' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Explore Catalog
          </button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
        <input
          type="text"
          placeholder="Search course titles, instructors, or descriptions..."
          className="w-full bg-slate-900/40 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-white/5 bg-slate-900/30 p-10 text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-indigo-400" />
          <p className="mt-3 text-sm text-slate-400">Loading academy courses from the backend...</p>
        </div>
      ) : activeTab === 'my-courses' ? (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredEnrolled.length > 0 ? (
            filteredEnrolled.map((course) => (
              <div
                key={course.id}
                className="group relative rounded-2xl border border-white/5 bg-slate-900/30 overflow-hidden flex flex-col justify-between hover:scale-[1.01] hover:border-indigo-500/30 transition-all duration-300"
              >
                <div className={`h-24 bg-gradient-to-r ${course.coverColor} p-6 flex flex-col justify-end relative`}>
                  <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px]" />
                  <span className="relative z-10 text-[10px] font-bold uppercase tracking-wider text-white/80 bg-black/20 self-start px-2 py-0.5 rounded border border-white/10">
                    Instructor: {course.instructor}
                  </span>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <Link href={`${portalBasePath}/courses/${course.id}`} className="block">
                      <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {course.title}
                      </h3>
                    </Link>
                    <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                      {course.description}
                    </p>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div>
                      <div className="flex justify-between items-center text-xs mb-1.5">
                        <span className="text-slate-500 font-medium flex items-center gap-1">
                          <BookOpen className="h-3.5 w-3.5" /> {course.completedLessons || 0}/{course.lessons} Lessons
                        </span>
                        <span className="font-bold text-indigo-400">{course.progress || 0}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full ${getProgressWidthClass(course.progress || 0)}`}
                        />
                      </div>
                    </div>

                    <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3 text-xs font-bold text-white transition-colors">
                      <Play className="h-3.5 w-3.5 fill-current" /> Resume Class
                    </button>
                    <Link
                      href={`${portalBasePath}/courses/${course.id}`}
                      className="block w-full rounded-xl border border-slate-800 bg-slate-950/70 hover:bg-slate-900 py-3 text-center text-xs font-bold text-slate-300 transition-colors"
                    >
                      Open Course
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-12 border border-dashed border-slate-800 rounded-2xl">
              <BookOpen className="mx-auto h-12 w-12 text-slate-700 mb-3" />
              <p className="text-slate-400 text-sm">No enrolled courses yet. Browse the catalog and enroll in a course.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCatalog.length > 0 ? (
            filteredCatalog.map((course, index) => (
              <div
                key={course.id}
                className="group relative rounded-2xl border border-white/5 bg-slate-900/30 overflow-hidden flex flex-col justify-between hover:scale-[1.01] hover:border-indigo-500/30 transition-all duration-300"
              >
                <div className={`h-28 bg-gradient-to-r ${coverColors[index % coverColors.length]} p-6 flex flex-col justify-between relative`}>
                  <div className="absolute inset-0 bg-slate-950/20" />
                  <div className="relative z-10 flex justify-between items-start">
                    {course.category ? (
                      <span className="text-[9px] font-extrabold uppercase tracking-wide bg-indigo-500 text-white px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <Sparkles className="h-2.5 w-2.5" /> {course.category}
                      </span>
                    ) : (
                      <span />
                    )}
                    <span className="text-xs font-extrabold text-white bg-slate-950/80 px-2.5 py-1 rounded-lg border border-white/5">
                      {getCoursePriceLabel(course)}
                    </span>
                  </div>
                  <span className="relative z-10 text-[10px] font-semibold text-white/80">
                    Instructor: {getCourseInstructor(course)}
                  </span>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <Link href={`${portalBasePath}/courses/${course.id}`} className="block">
                      <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {course.title}
                      </h3>
                    </Link>
                    <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                      {course.description}
                    </p>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="text-xs text-slate-500">
                      <span>{getCourseLessonCount(course)} lessons - Full Lifetime Access</span>
                    </div>
                    <button
                      onClick={() => handleEnroll(course.id)}
                      disabled={enrollingCourseId === course.id || enrolledIds.has(course.id)}
                      className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 py-3 text-xs font-bold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {enrollingCourseId === course.id ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Enrolling...
                        </>
                      ) : enrolledIds.has(course.id) ? (
                        'Already Enrolled'
                      ) : (
                        'Enroll Course'
                      )}
                    </button>
                    <Link
                      href={`${portalBasePath}/courses/${course.id}`}
                      className="block w-full rounded-xl border border-slate-800 bg-slate-950/70 hover:bg-slate-900 py-3 text-center text-xs font-bold text-slate-300 transition-colors"
                    >
                      View Lessons
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 border border-dashed border-slate-800 rounded-2xl">
              <BookOpen className="mx-auto h-12 w-12 text-slate-700 mb-3" />
              <p className="text-slate-400 text-sm">No courses matching your search.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
