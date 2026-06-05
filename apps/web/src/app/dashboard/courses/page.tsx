'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Play, Search, Sparkles } from 'lucide-react';
import { academyOverview, catalogCourses, enrolledCourses } from '../../../features/academy/content';

export default function CoursesPage() {
  const [activeTab, setActiveTab] = useState<'my-courses' | 'browse'>('my-courses');
  const [searchQuery, setSearchQuery] = useState('');

  const normalizedQuery = searchQuery.toLowerCase().trim();

  const filteredEnrolled = enrolledCourses.filter((course) =>
    `${course.title} ${course.description} ${course.instructor}`.toLowerCase().includes(normalizedQuery)
  );

  const filteredCatalog = catalogCourses.filter((course) =>
    `${course.title} ${course.description} ${course.instructor}`.toLowerCase().includes(normalizedQuery)
  );

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

      {activeTab === 'my-courses' ? (
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
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {course.title}
                    </h3>
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
                          className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full"
                          style={{ width: `${course.progress || 0}%` }}
                        />
                      </div>
                    </div>

                    <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3 text-xs font-bold text-white transition-colors">
                      <Play className="h-3.5 w-3.5 fill-current" /> Resume Class
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-12 border border-dashed border-slate-800 rounded-2xl">
              <BookOpen className="mx-auto h-12 w-12 text-slate-700 mb-3" />
              <p className="text-slate-400 text-sm">No courses matching your search.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCatalog.length > 0 ? (
            filteredCatalog.map((course) => (
              <div
                key={course.id}
                className="group relative rounded-2xl border border-white/5 bg-slate-900/30 overflow-hidden flex flex-col justify-between hover:scale-[1.01] hover:border-indigo-500/30 transition-all duration-300"
              >
                <div className={`h-28 bg-gradient-to-r ${course.coverColor} p-6 flex flex-col justify-between relative`}>
                  <div className="absolute inset-0 bg-slate-950/20" />
                  <div className="relative z-10 flex justify-between items-start">
                    {course.tag ? (
                      <span className="text-[9px] font-extrabold uppercase tracking-wide bg-indigo-500 text-white px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <Sparkles className="h-2.5 w-2.5" /> {course.tag}
                      </span>
                    ) : (
                      <span />
                    )}
                    <span className="text-xs font-extrabold text-white bg-slate-950/80 px-2.5 py-1 rounded-lg border border-white/5">
                      {course.price}
                    </span>
                  </div>
                  <span className="relative z-10 text-[10px] font-semibold text-white/80">
                    Instructor: {course.instructor}
                  </span>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                      {course.description}
                    </p>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="text-xs text-slate-500">
                      <span>{course.lessons} lectures - Full Lifetime Access</span>
                    </div>
                    <Link
                      href="/register"
                      className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 py-3 text-xs font-bold text-white transition-colors text-center"
                    >
                      Enroll Course
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
