import React from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Zap, Users, BookOpen, MessageSquare, Award, Star } from 'lucide-react';
import { Footer } from '../../components/Footer';
import { client } from '@/lib/appwrite';
import { Databases, Query } from 'appwrite';

export const metadata = {
  title: 'Pricing — KennyKentola Academy',
  description: 'Flexible pricing for courses, bootcamps, and professional services at KennyKentola.',
};

export const revalidate = 60; // Revalidate every 60 seconds

async function fetchSiteSettingsMap() {
  const db = new Databases(client);
  try {
    const res = await db.listDocuments('multicompany', 'site_settings', [Query.limit(100)]);
    const map: Record<string, string> = {};
    for (const doc of res.documents) {
      map[doc.key] = doc.value;
    }
    return map;
  } catch (err) {
    console.error('Failed to fetch pricing settings:', err);
    return {};
  }
}

export default async function PricingPage() {
  const settings = await fetchSiteSettingsMap();

  const plans = [
    {
      name: 'Free',
      price: '₦0',
      period: 'forever',
      tagline: 'Start learning today',
      color: 'border-slate-700',
      badge: null,
      cta: 'Get Started Free',
      ctaHref: '/register',
      ctaStyle: 'bg-slate-800 hover:bg-slate-700 text-white',
      features: [
        'Browse all published courses',
        'Access free preview lessons',
        'Community forum access',
        'Basic profile & dashboard',
      ],
      notIncluded: ['Full course access', 'Assignments & grading', 'Certificates', 'Live classes', 'Instructor messages'],
    },
    {
      name: 'Pro Student',
      price: `₦${settings.price_pro_student || '5,000'}`,
      period: 'per course',
      tagline: 'Full access to one course',
      color: 'border-indigo-500/50',
      badge: 'Most Popular',
      cta: 'Enroll in a Course',
      ctaHref: '/dashboard/courses',
      ctaStyle: 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 text-white',
      features: [
        'Full course access (all lessons)',
        'Video lessons + notes',
        'Assignment portal',
        'Instructor grading & feedback',
        'Course certificate on completion',
        'Access to live classes',
        'Community forum access',
      ],
      notIncluded: ['All-courses access', 'Priority support'],
    },
    {
      name: 'Bootcamp',
      price: `₦${settings.price_bootcamp || '35,000'}`,
      period: 'per cohort',
      tagline: 'Intensive program — 3 months',
      color: 'border-emerald-500/30',
      badge: 'Best Value',
      cta: 'Apply for Bootcamp',
      ctaHref: '/bootcamps',
      ctaStyle: 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 text-white',
      features: [
        'Access to full bootcamp curriculum',
        'Weekly live coaching sessions',
        'Dedicated instructor + mentorship',
        'Real-world project portfolio',
        'Assignment grading & feedback',
        'Job-ready certificate',
        'Community + alumni network',
        'Priority instructor messaging',
      ],
      notIncluded: [],
    },
  ];

  const serviceRates = [
    { service: 'Black & White Print', price: `₦${settings.price_print_bw || '30'} / page` },
    { service: 'Color Print', price: `₦${settings.price_print_color || '80'} / page` },
    { service: 'Document Binding', price: `₦${settings.price_binding || '500'}+` },
    { service: 'ID Card Design & Print', price: `₦${settings.price_id_card || '2,000'}` },
    { service: 'Custom Software MVP', price: `From ₦${settings.price_mvp || '150,000'}` },
    { service: 'Website Design', price: `From ₦${settings.price_website || '80,000'}` },
    { service: 'Solar Installation Quote', price: 'Free site survey' },
  ];
  return (
    <div className="relative min-h-screen bg-slate-950 text-white font-sans">
      <div className="absolute top-0 left-0 w-[40%] h-[40%] rounded-full bg-indigo-900/20 blur-[100px] pointer-events-none" />

      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl flex h-16 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center font-bold text-white">K</div>
            <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">KennyKentola</span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/login" className="text-slate-400 hover:text-white transition-colors">Login</Link>
            <Link href="/register" className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2 font-semibold text-white hover:opacity-90 transition-opacity">Get Started</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/5 px-4 py-1.5 text-xs font-semibold text-indigo-300 mb-6">Simple, Transparent Pricing</div>
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
          Pay Only for{' '}
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">What You Need</span>
        </h1>
        <p className="mt-6 text-lg text-slate-400 max-w-xl mx-auto">No subscriptions. No hidden fees. Enroll course-by-course, or go all-in with a bootcamp cohort.</p>
      </section>

      {/* Plans */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.name} className={`relative rounded-3xl border ${plan.color} bg-slate-900/40 p-8 flex flex-col`}>
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500 px-3 py-1 text-[11px] font-bold text-white">
                    <Star className="h-3 w-3" /> {plan.badge}
                  </span>
                </div>
              )}
              <div className="mb-6">
                <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">{plan.name}</div>
                <div className="text-4xl font-black text-white">{plan.price}</div>
                <div className="text-xs text-slate-500 mt-1">{plan.period}</div>
                <p className="text-sm text-slate-300 mt-3">{plan.tagline}</p>
              </div>

              <Link href={plan.ctaHref} className={`w-full text-center rounded-xl py-3 text-sm font-bold transition-opacity mb-6 ${plan.ctaStyle}`}>
                {plan.cta}
              </Link>

              <div className="space-y-2.5 flex-1">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-start gap-2 text-sm text-slate-300">
                    <Check className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" /> {f}
                  </div>
                ))}
                {plan.notIncluded.map((f) => (
                  <div key={f} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="mt-1 h-4 w-4 shrink-0 flex items-center justify-center text-slate-700">✕</span> {f}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Other services */}
      <section className="mx-auto max-w-3xl px-6 pb-24">
        <h2 className="text-2xl font-bold text-center mb-10">Other Service Rates</h2>
        <div className="rounded-3xl border border-white/5 bg-slate-900/30 overflow-hidden">
          {serviceRates.map(({ service, price }, i) => (
            <div key={service} className={`flex items-center justify-between px-6 py-4 ${i !== serviceRates.length - 1 ? 'border-b border-slate-800' : ''}`}>
              <span className="text-sm text-slate-300">{service}</span>
              <span className="text-sm font-bold text-white">{price}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 text-center mt-4">* Prices may vary based on project scope. Contact us for a custom quote.</p>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-6 pb-24">
        <h2 className="text-2xl font-bold text-center mb-10">Common Questions</h2>
        <div className="space-y-4">
          {[
            { q: 'How do I pay for a course?', a: 'Make a bank transfer to any of our listed accounts, upload your receipt in the Payments section of your dashboard, and wait for admin verification (usually within a few hours).' },
            { q: 'Can I get a refund?', a: 'Refunds are handled case-by-case within 7 days of enrollment if no lesson progress has been made. Contact us directly.' },
            { q: 'How long do I have access after enrolling?', a: 'Lifetime access. Once you enroll in a course, you can revisit it at any time.' },
            { q: 'Is the certificate recognized?', a: 'Our certificates are issued with a unique certificate number and are verifiable. They are increasingly recognized by local tech employers and NGOs.' },
          ].map(({ q, a }) => (
            <div key={q} className="rounded-2xl border border-white/5 bg-slate-900/30 p-5">
              <div className="font-semibold text-white mb-2">{q}</div>
              <div className="text-sm text-slate-400">{a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-6 pb-24 text-center">
        <h2 className="text-3xl font-bold mb-4">Still have questions?</h2>
        <p className="text-slate-400 mb-6">We're happy to help you find the right plan.</p>
        <Link href="/contact" className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/5 px-8 py-3 font-semibold text-indigo-300 hover:bg-indigo-500/10 transition-colors">
          Contact Us <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <Footer />
    </div>
  );
}
