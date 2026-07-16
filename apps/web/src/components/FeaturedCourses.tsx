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
        {courses.slice(0, 6).map((course: any) => (
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
                <div className="flex items-center gap-2">
                  <a 
                    href="https://wa.me/2348163571677"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-white shadow-[0_0_15px_-3px_rgba(16,185,129,0.4)] transition hover:opacity-90"
                    title="Enroll via WhatsApp"
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                    </svg>
                  </a>
                  <Link 
                    href={`/dashboard/academy/courses/${course.id}`}
                    className="flex h-11 items-center px-5 bg-white text-[#0b1b42] font-bold rounded-xl hover:bg-indigo-500 hover:text-white transition-colors text-sm"
                  >
                    Enroll Now
                  </Link>
                </div>
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
