'use client';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Jenkins',
    role: 'CEO, TechFlow SaaS',
    content: 'They delivered our entire MVP in just 6 weeks. The code quality is pristine, and the UI design blew our investors away. Highly recommended for any serious startup.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80'
  },
  {
    name: 'David Okafor',
    role: 'Director, Zenith Logistics',
    content: 'We needed a complex logistics routing algorithm integrated with a driver mobile app. The team handled it flawlessly. It has completely transformed our operations.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80'
  },
  {
    name: 'Elena Rodriguez',
    role: 'Founder, Medico Health',
    content: 'Security was our #1 concern for our healthcare platform. Their knowledge of backend architecture and cloud deployment gave us total peace of mind.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80'
  }
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-[#050505]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-white mb-4">Don't Just Take Our Word</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">We partner with ambitious startups and global enterprises.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="p-8 rounded-3xl bg-slate-900 border border-white/5 relative">
              <Quote className="absolute top-6 right-6 w-10 h-10 text-white/5" />
              <div className="flex items-center gap-4 mb-6">
                <img src={t.image} alt={t.name} className="w-14 h-14 rounded-full object-cover border-2 border-indigo-500/30" />
                <div>
                  <h4 className="text-white font-bold">{t.name}</h4>
                  <div className="text-sm text-indigo-400">{t.role}</div>
                </div>
              </div>
              <p className="text-slate-300 leading-relaxed text-sm italic">"{t.content}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
