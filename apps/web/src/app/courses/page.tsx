'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { Search, ArrowRight } from 'lucide-react';

import { COURSES } from '../../data/courses';

const CATEGORIES = ['All', 'AI', 'Design', 'Development', 'Marketing', 'Business', 'Management', 'Cybersecurity', 'Data'];
const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeLevel, setActiveLevel] = useState('All');

  const filteredCourses = COURSES.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || course.category === activeCategory;
    const matchesLevel = activeLevel === 'All' || course.level === activeLevel;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  return (
    <div className="relative min-h-screen bg-[#050505] font-sans text-slate-200">
      <Navbar />

      <main className="mx-auto w-full max-w-[1280px] px-4 pb-20 pt-28 md:px-6 md:pb-24 lg:pt-36">
        
        {/* HERO SECTION */}
        <section className="flex flex-col items-start justify-start text-left">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-400 md:text-[13px]">
            Live Cohorts
          </p>
          <h1 className="mt-4 max-w-[720px] text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.15] tracking-tight text-white">
            Every course is <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">live and taught.</span>
          </h1>
          <p className="mt-5 max-w-[600px] text-base leading-relaxed text-slate-400 md:text-lg">
            Find the cohort built for where you are and where you want to go. Learn from industry experts in real-time.
          </p>
        </section>

        {/* SEARCH AND FILTERS */}
        <section className="mt-10 w-full md:mt-12">
          {/* Desktop Search */}
          <div className="relative hidden w-full md:block">
            <div className="relative flex items-center gap-2 overflow-hidden rounded-full border border-white/10 bg-white/5 shadow-sm backdrop-blur-md transition-colors duration-200 focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/20">
              <div className="ml-5 shrink-0">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input 
                placeholder="Search courses..." 
                className="h-12 flex-1 bg-transparent pr-4 text-sm text-white outline-none placeholder:text-slate-500 md:h-14 md:text-base md:pr-5" 
                type="search" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Categories */}
          <div className="mt-8 flex flex-wrap justify-start gap-2">
            {CATEGORIES.map(category => (
              <button 
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`rounded-full font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 shrink-0 px-4 py-2.5 text-sm lg:px-5 ${
                  activeCategory === category 
                    ? 'bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 text-white shadow-sm border border-transparent' 
                    : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Levels */}
          <div className="mt-4 flex flex-nowrap justify-start gap-2 md:flex-wrap">
            {LEVELS.map(level => (
              <button 
                key={level}
                onClick={() => setActiveLevel(level)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-[11px] font-medium transition-all duration-200 sm:px-4 sm:py-2 sm:text-[13px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  activeLevel === level 
                    ? 'bg-white text-black shadow-sm' 
                    : 'border border-white/10 bg-transparent text-slate-400 hover:border-white/20 hover:text-white'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
          
          <p className="mt-6 text-sm text-slate-500">
            Showing {filteredCourses.length} of {COURSES.length} courses
          </p>
        </section>

        {/* COURSE GRID */}
        <section className="mt-8 md:mt-10" aria-label="Course listings">
          {filteredCourses.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-slate-400 text-lg">No courses found matching your criteria.</p>
              <button 
                onClick={() => { setSearchQuery(''); setActiveCategory('All'); setActiveLevel('All'); }}
                className="mt-4 text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {filteredCourses.map(course => (
                <article key={course.slug} className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0A] shadow-xl transition-all duration-300 hover:border-indigo-500/30 hover:shadow-[0_16px_48px_rgba(99,102,241,0.15)]">
                  <div className="relative h-[200px] w-full overflow-hidden sm:h-[220px] lg:h-[240px]">
                    <img 
                      alt={course.title} 
                      loading="lazy" 
                      className="object-cover object-center w-full h-full transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100" 
                      src={course.image} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] to-transparent opacity-60" />
                  </div>
                  
                  <div className="flex flex-1 flex-col p-5 sm:p-6 relative">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="rounded-full px-2.5 py-1 text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {course.category}
                      </span>
                      <span className="text-xs text-slate-400">
                        {course.level} · {course.duration}
                      </span>
                    </div>
                    
                    <h2 className="text-xl font-bold leading-snug text-white sm:text-2xl mb-3">
                      {course.title}
                    </h2>
                    
                    <p className="flex-1 text-sm leading-relaxed text-slate-400">
                      {course.description}
                    </p>
                    
                    <Link 
                      href={`/courses/${course.slug}`}
                      className="mt-6 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-indigo-400 transition-colors duration-200 hover:text-indigo-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                      View course
                      <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

      </main>
      
      <Footer />
    </div>
  );
}
