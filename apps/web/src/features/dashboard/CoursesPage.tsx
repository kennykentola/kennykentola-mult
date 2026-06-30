/* eslint-disable react/forbid-dom-props */
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Loader2, Play, Search, Sparkles, Star } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import {
  academyOverview,
  catalogCourses as fallbackCatalogCourses,
  enrolledCourses as fallbackEnrolledCourses
} from '../academy/content';
import {
  AcademyCatalogResponse,
  AcademyProgressResponse,
  enrollInAcademyCourse,
  fetchAcademyCatalog,
  fetchAcademyProgress,
  fetchCourseRatingsAggregate
} from '../academy/api';

const coverColors = [
  'from-violet-600 to-indigo-600',
  'from-blue-600 to-cyan-600',
  'from-emerald-600 to-teal-600',
  'from-rose-600 to-pink-600',
  'from-amber-600 to-orange-600'
];

type CatalogCourse = AcademyCatalogResponse['courses'][number] | (typeof fallbackCatalogCourses)[number];

function getProgressWidth(progress: number) {
  return `${Math.min(Math.max(progress || 0, 0), 100)}%`;
}

function getCourseInstructor(course: CatalogCourse) {
  return 'instructorName' in course ? course.instructorName : course.instructor;
}

function getCoursePriceLabel(course: CatalogCourse) {
  const price = course.price;
  if (typeof price === 'number') return price === 0 ? 'Free' : `$${price}`;
  return price;
}

function getCourseLessonCount(course: CatalogCourse) {
  return 'lessonCount' in course ? course.lessonCount : course.lessons;
}

export default function CoursesPage() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'my-courses' | 'browse'>('my-courses');
  const [searchQuery, setSearchQuery] = useState('');
  const [catalog, setCatalog] = useState<AcademyCatalogResponse['courses'] | null>(null);
  const [progress, setProgress] = useState<AcademyProgressResponse | null>(null);
  const [ratings, setRatings] = useState<Record<string, { averageRating: number; ratingCount: number }>>({});
  const [loading, setLoading] = useState(true);
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadAcademyData() {
      if (!profile) return;
      setLoading(true);
      setError('');

      try {
        const [catalogData, progressData, ratingsData] = await Promise.all([
          fetchAcademyCatalog(),
          fetchAcademyProgress(),
          fetchCourseRatingsAggregate()
        ]);
        if (!cancelled) {
          setCatalog(catalogData.courses);
          setProgress(progressData);
          setRatings(ratingsData.ratings || {});
        }
      } catch (err: any) {
        if (!cancelled) {
          setCatalog(null);
          setProgress(null);
          setError(err?.message || 'Unable to load academy data.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAcademyData();
    return () => {
      cancelled = true;
    };
  }, [profile]);

  const normalizedQuery = searchQuery.toLowerCase().trim();
  const courseCatalog: CatalogCourse[] = catalog ?? fallbackCatalogCourses;
  const enrolledCards = progress
    ? progress.enrollments.map((enrollment, index) => ({
        id: enrollment.courseId,
        title: enrollment.course.title,
        description: enrollment.course.description,
        instructor: enrollment.course.instructorName,
        progress: enrollment.progress || 0,
        lessons: enrollment.course.lessonCount || 0,
        completedLessons: enrollment.completedLessons || 0,
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

  const enrolledIds = useMemo(
    () => new Set((progress?.enrollments || []).map((enrollment) => enrollment.courseId)),
    [progress]
  );

  async function handleEnroll(courseId: string) {
    try {
      setEnrollingCourseId(courseId);
      setError('');
      await enrollInAcademyCourse(courseId);
      setProgress(await fetchAcademyProgress());
      setActiveTab('my-courses');
    } catch (err: any) {
      setError(err?.message || 'Unable to enroll in the selected course.');
    } finally {
      setEnrollingCourseId(null);
    }
  }

  if (!profile) return null;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-white">{academyOverview.title}</h1>
          <p className="mt-1 text-sm text-slate-400">{academyOverview.heroCopy}</p>
        </div>
        <div className="flex self-start rounded-xl border border-white/5 bg-slate-900/60 p-1">
          {(['my-courses', 'browse'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                activeTab === tab ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'my-courses' ? 'My Courses' : 'Explore Catalog'}
            </button>
          ))}
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search course titles, instructors, or descriptions..."
          className="w-full rounded-xl border border-slate-800 bg-slate-900/40 py-3 pl-11 pr-4 text-sm text-white transition-colors focus:border-indigo-500/50 focus:outline-none"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
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
          {filteredEnrolled.map((course) => (
            <CourseCard key={course.id} course={course} href={`/student/courses/${course.id}`} />
          ))}
          {filteredEnrolled.length === 0 && <EmptyCourses message="No enrolled courses yet. Browse the catalog and enroll in a course." />}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCatalog.map((course, index) => (
            <div key={course.id} className="overflow-hidden rounded-2xl border border-white/5 bg-slate-900/30 transition-all duration-300 hover:border-indigo-500/30">
              <div className={`relative flex h-28 flex-col justify-between bg-gradient-to-r ${coverColors[index % coverColors.length]} p-6`}>
                <div className="absolute inset-0 bg-slate-950/20" />
                <div className="relative z-10 flex items-start justify-between">
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-white">
                    <Sparkles className="h-2.5 w-2.5" /> {course.category || 'Academy'}
                  </span>
                  <span className="rounded-lg border border-white/5 bg-slate-950/80 px-2.5 py-1 text-xs font-extrabold text-white">
                    {getCoursePriceLabel(course)}
                  </span>
                </div>
                <span className="relative z-10 text-[10px] font-semibold text-white/80">Instructor: {getCourseInstructor(course)}</span>
              </div>
              <div className="space-y-4 p-6">
                <Link href={`/student/courses/${course.id}`} className="block text-base font-bold text-white hover:text-indigo-300">
                  {course.title}
                </Link>
                <p className="min-h-12 text-xs leading-relaxed text-slate-400">{course.description}</p>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center text-amber-400">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <span className="ml-1 text-xs font-bold text-white">{ratings[course.id]?.averageRating || 'New'}</span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {ratings[course.id]?.ratingCount ? `(${ratings[course.id].ratingCount} reviews)` : ''}
                  </span>
                </div>

                <p className="text-xs text-slate-500">{getCourseLessonCount(course)} lessons - Full Lifetime Access</p>
                <button
                  onClick={() => handleEnroll(course.id)}
                  disabled={enrollingCourseId === course.id || enrolledIds.has(course.id)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900 py-3 text-xs font-bold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {enrollingCourseId === course.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                  {enrolledIds.has(course.id) ? 'Already Enrolled' : enrollingCourseId === course.id ? 'Enrolling...' : 'Enroll Course'}
                </button>
              </div>
            </div>
          ))}
          {filteredCatalog.length === 0 && <EmptyCourses message="No courses matching your search." />}
        </div>
      )}
    </div>
  );
}

function CourseCard({ course, href }: { course: any; href: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/5 bg-slate-900/30 transition-all duration-300 hover:border-indigo-500/30">
      <div className={`relative flex h-24 flex-col justify-end bg-gradient-to-r ${course.coverColor} p-6`}>
        <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px]" />
        <span className="relative z-10 self-start rounded border border-white/10 bg-black/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/80">
          Instructor: {course.instructor}
        </span>
      </div>
      <div className="space-y-5 p-6">
        <Link href={href} className="block text-lg font-bold text-white hover:text-indigo-300">
          {course.title}
        </Link>
        <p className="text-xs leading-relaxed text-slate-400">{course.description}</p>
        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 font-medium text-slate-500">
              <BookOpen className="h-3.5 w-3.5" /> {course.completedLessons || 0}/{course.lessons} Lessons
            </span>
            <span className="font-bold text-indigo-400">{course.progress || 0}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400"
              style={{ width: getProgressWidth(course.progress || 0) }}
            />
          </div>
        </div>
        <Link href={href} className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white transition-colors hover:bg-indigo-500">
          <Play className="h-3.5 w-3.5 fill-current" /> Resume Class
        </Link>
      </div>
    </div>
  );
}

function EmptyCourses({ message }: { message: string }) {
  return (
    <div className="col-span-full rounded-2xl border border-dashed border-slate-800 py-12 text-center">
      <BookOpen className="mx-auto mb-3 h-12 w-12 text-slate-700" />
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  );
}
