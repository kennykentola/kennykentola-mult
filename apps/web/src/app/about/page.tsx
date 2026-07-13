import React from 'react';
import Link from 'next/link';
import { ArrowRight, Users, BookOpen, Code, Award, Heart, Target, Zap } from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';

export const metadata = {
  title: 'About KennyKentola — Our Story & Mission',
  description: 'Learn about KennyKentola, a multi-service digital platform for programming education, software development, printing, and solar energy in Nigeria.',
};

const team = [
  { name: 'Kenny Kentola', role: 'Founder & Lead Instructor', initials: 'KK', color: 'from-indigo-500 to-purple-600', logo: true },
  { name: 'Academy Team', role: 'Instructors & Mentors', initials: 'AT', color: 'from-emerald-500 to-teal-600' },
  { name: 'Dev Team', role: 'Software Engineers', initials: 'DT', color: 'from-cyan-500 to-blue-600' },
];

const values = [
  { icon: Heart, title: 'Student-First', desc: 'Every decision starts with what helps students learn and succeed.' },
  { icon: Target, title: 'Practical Skills', desc: 'We teach what employers and the real world demand — not theory alone.' },
  { icon: Zap, title: 'Fast Results', desc: 'Structured bootcamps designed to take you from beginner to employable in months.' },
  { icon: Award, title: 'Certified Excellence', desc: 'Auto-generated certificates on course completion, recognized by hiring partners.' },
];

export default function AboutPage() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-white font-sans">
      <Navbar />
      <div className="absolute top-0 left-0 w-[40%] h-[40%] rounded-full bg-indigo-900/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[40%] h-[40%] rounded-full bg-purple-900/10 blur-[100px] pointer-events-none" />

      {/* Hero */}
      <section className="relative mx-auto max-w-4xl px-6 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/5 px-4 py-1.5 text-xs font-semibold text-indigo-300 mb-6">Our Story</div>
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
          Built to{' '}
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Transform</span>{' '}
          Nigerian Tech Talent
        </h1>
        <p className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          KennyKentola is a full-service digital platform combining programming education, custom software development, professional printing, and solar energy services — built to empower individuals and businesses across Nigeria.
        </p>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Students Enrolled', value: '500+' },
            { label: 'Courses Available', value: '20+' },
            { label: 'Projects Delivered', value: '50+' },
            { label: 'Completion Rate', value: '95%' },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-2xl border border-white/5 bg-slate-900/30 p-6 text-center">
              <div className="text-3xl font-black text-white">{value}</div>
              <div className="text-xs text-slate-500 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="rounded-3xl border border-indigo-500/10 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 p-10">
          <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
          <p className="text-slate-300 text-lg leading-relaxed max-w-3xl">
            To democratize access to world-class technology education and services in Nigeria, providing students with the skills, certifications, and professional opportunities they need to compete globally — while helping businesses build, grow, and power their operations with clean energy.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <h2 className="text-3xl font-bold text-center mb-12">What We Stand For</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {values.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-white/5 bg-slate-900/30 p-6 flex gap-4">
              <div className="h-12 w-12 shrink-0 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Icon className="h-6 w-6 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">{title}</h3>
                <p className="text-slate-400 text-sm mt-1">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <h2 className="text-3xl font-bold text-center mb-12">The Team Behind It</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {team.map(({ name, role, initials, color, logo }) => (
            <div key={name} className="rounded-2xl border border-white/5 bg-slate-900/30 p-6 text-center">
              {logo ? (
                <div className="h-16 w-16 mx-auto mb-4 bg-[#0A0A0A] rounded-2xl border border-white/10 shadow-xl overflow-hidden p-1">
                  <img src="/8aa52611-294c-4f56-9132-f6a62f271095-Photoroom.png" alt={name} className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className={`h-16 w-16 rounded-2xl bg-gradient-to-tr ${color} flex items-center justify-center text-white text-xl font-black mx-auto mb-4`}>{initials}</div>
              )}
              <div className="font-bold text-white">{name}</div>
              <div className="text-xs text-slate-500 mt-1">{role}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-6 pb-24 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
        <p className="text-slate-400 mb-8">Join 500+ students already learning and growing with KennyKentola.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register" className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-3 font-semibold text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
            Get Started Free <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/contact" className="rounded-full border border-slate-700 px-8 py-3 font-semibold text-slate-300 hover:text-white hover:border-slate-500 transition-colors">
            Contact Us
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
