import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, MessageSquare, Clock, ArrowRight } from 'lucide-react';
import ContactForm from '../../components/ContactForm';
import { Footer } from '../../components/Footer';

export const metadata = {
  title: 'Contact Us — KennyKentola',
  description: 'Get in touch with the KennyKentola team for support, inquiries, or partnerships.',
};

const channels = [
  {
    icon: MessageSquare,
    label: 'WhatsApp',
    value: '+234 816 357 1677, +234 904 808 2076',
    hint: 'Fastest response — usually within 1 hour',
    href: 'https://wa.me/2348163571677',
    color: 'text-emerald-400',
    border: 'border-emerald-500/20 hover:bg-emerald-500/5',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'peterkehindeademola9@gmail.com',
    hint: 'Also: peterkehindeademola@gmail.com, ademolapeter233@gmail.com',
    href: 'mailto:peterkehindeademola9@gmail.com',
    color: 'text-indigo-400',
    border: 'border-indigo-500/20 hover:bg-indigo-500/5',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+234 816 357 1677, +234 904 808 2076',
    hint: 'Monday – Friday, 9am – 6pm (WAT)',
    href: 'tel:+2348163571677',
    color: 'text-cyan-400',
    border: 'border-cyan-500/20 hover:bg-cyan-500/5',
  },
  {
    icon: MapPin,
    label: 'Location',
    value: '25 Elebu Rd, moniya, Ibadan Oyo state nigeria',
    hint: 'Remote-first. In-person sessions available by appointment.',
    href: null,
    color: 'text-rose-400',
    border: 'border-rose-500/20',
  },
];

const topics = [
  'Course enrollment & payments',
  'Bootcamp applications',
  'Custom software project',
  'Printing order inquiry',
  'Solar installation quote',
  'Partnership or sponsorship',
  'Report a platform issue',
  'Other',
];

export default function ContactPage() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-white font-sans">
      <div className="absolute top-0 left-0 w-[40%] h-[40%] rounded-full bg-indigo-900/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[30%] h-[30%] rounded-full bg-cyan-900/10 blur-[100px] pointer-events-none" />

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

      <div className="mx-auto max-w-6xl px-6 pt-24 pb-24">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/5 px-4 py-1.5 text-xs font-semibold text-indigo-300 mb-6">Get in Touch</div>
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
            We're Here to{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Help</span>
          </h1>
          <p className="mt-6 text-lg text-slate-400 max-w-xl mx-auto">
            Whether you have a question about a course, a project idea, or just want to say hello — reach out and we'll get back to you quickly.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact channels */}
          <div>
            <h2 className="text-xl font-bold mb-6">How to Reach Us</h2>
            <div className="space-y-4">
              {channels.map(({ icon: Icon, label, value, hint, href, color, border }) => {
                const content = (
                  <div className={`flex items-start gap-4 p-5 rounded-2xl border ${border} bg-slate-900/20 transition-colors`}>
                    <div className={`h-10 w-10 shrink-0 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center ${color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">{label}</div>
                      <div className="font-semibold text-white">{value}</div>
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-1"><Clock className="h-3 w-3" />{hint}</div>
                    </div>
                  </div>
                );
                return href ? (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer">{content}</a>
                ) : (
                  <div key={label}>{content}</div>
                );
              })}
            </div>
          </div>

          {/* Contact form (interactive) */}
          <ContactForm topics={topics} />
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
