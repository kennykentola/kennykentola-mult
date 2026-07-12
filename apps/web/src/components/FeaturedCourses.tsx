import React from 'react';
import Link from 'next/link';
import { BookOpen, Star, Clock, PlayCircle } from 'lucide-react';

async function getFeaturedCourses() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/academy/courses`, {
      next: { revalidate: 60 } // Revalidate every minute
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.courses || [];
  } catch (error) {
    console.error('Failed to fetch featured courses:', error);
    return [];
  }
}

export default async function FeaturedCourses() {
  const courses = await getFeaturedCourses();

  if (!courses || courses.length === 0) return null;

  return (
    <div className="py-16 mb-12 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-64 bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="text-center mb-12 relative z-10">
        <h2 className="text-2xl md:text-3xl font-black text-white tracking-widest uppercase flex items-center justify-center gap-4">
          <span className="h-px w-12 bg-indigo-500/50 hidden md:block"></span>
          Featured Tech Courses
          <span className="h-px w-12 bg-indigo-500/50 hidden md:block"></span>
        </h2>
        <p className="text-slate-400 mt-4 max-w-2xl mx-auto">
          Master the most in-demand skills in tech with our premium, interactive courses. Start learning today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
        {courses.slice(0, 3).map((course: any) => (
          <div key={course.id} className="group relative bg-[#0b1b42]/30 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl hover:border-indigo-500/50 transition-all duration-500 hover:-translate-y-2 flex flex-col">
            {/* Cover Image */}
            <div className="relative h-48 w-full overflow-hidden">
              <img 
                src={course.coverImage || 'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&q=80&w=800'} 
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b1b42] to-transparent" />
              <div className="absolute bottom-4 left-4 flex gap-2">
                <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-indigo-600 text-white rounded-full">
                  {course.category}
                </span>
                <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-white/10 backdrop-blur-md text-white rounded-full">
                  {course.level}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-grow">
              <h3 className="text-xl font-bold text-white mb-3 line-clamp-2">{course.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3">
                {course.description || course.summary}
              </p>
              
              {/* Meta */}
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-300 mb-8 mt-auto">
                <div className="flex items-center gap-1.5">
                  <PlayCircle className="w-4 h-4 text-indigo-400" />
                  {course.lessonCount || 0} Lessons
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  5.0
                </div>
              </div>

              {/* Action */}
              <div className="flex items-center justify-between pt-6 border-t border-white/10">
                <div className="text-white font-bold text-lg">
                  {course.price > 0 ? `₦${course.price.toLocaleString()}` : 'Free'}
                </div>
                <Link 
                  href={`/dashboard/academy/courses/${course.id}`}
                  className="px-6 py-2.5 bg-white text-[#0b1b42] font-bold rounded-xl hover:bg-indigo-500 hover:text-white transition-colors"
                >
                  Enroll Now
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-12 text-center relative z-10">
        <Link href="/academy" className="inline-flex items-center gap-2 text-indigo-400 font-bold hover:text-indigo-300 transition-colors">
          View All Courses <BookOpen className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
