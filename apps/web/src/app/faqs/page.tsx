'use client';

import React, { useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { ChevronDown, MessageSquare } from 'lucide-react';
import Link from 'next/link';

const FAQS = [
  {
    question: "Do you write the final year project code from scratch?",
    answer: "Yes, we implement custom software solutions based on your approved Chapter 3 design. We do not sell pre-made templates unless specifically requested as a learning resource."
  },
  {
    question: "How does the payment structure work?",
    answer: "We use a milestone-based payment structure. You typically pay an initial deposit to start the proposal, and then subsequent payments are tied to the delivery of specific chapters and the software implementation."
  },
  {
    question: "Will you teach me how the code works?",
    answer: "Absolutely. Our core philosophy is that you must understand your project to defend it successfully. We provide code walk-throughs, architecture explanations, and setup guides."
  },
  {
    question: "Do you help with Chapter 1-5 documentation?",
    answer: "Yes. We guide you through the entire research process, from writing a compelling introduction and literature review, to system design, implementation documentation, and the final conclusion."
  },
  {
    question: "What happens if my supervisor requests corrections?",
    answer: "We include a set number of free revisions based on supervisor feedback to ensure your project meets your university's standards."
  }
];

export default function FaqsPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 lg:px-12 pt-32 pb-24">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-sm font-bold uppercase tracking-wider mb-6">
            <MessageSquare className="w-4 h-4" /> Support
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6">Frequently Asked Questions</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">Everything you need to know about our academic guidance, software development, and mentoring services.</p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, i) => (
            <div 
              key={i} 
              className={`border border-white/10 rounded-2xl overflow-hidden transition-all ${openIndex === i ? 'bg-white/5' : 'bg-transparent hover:bg-white/[0.02]'}`}
            >
              <button 
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="text-lg font-bold text-white">{faq.question}</span>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openIndex === i ? 'rotate-180 text-amber-500' : ''}`} />
              </button>
              {openIndex === i && (
                <div className="px-6 pb-6 text-slate-400 leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 p-8 rounded-3xl bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/20 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Still have questions?</h3>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto">Can't find the answer you're looking for? Please chat to our friendly team.</p>
          <Link href="/contact" className="inline-flex px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-colors">
            Get in touch
          </Link>
        </div>
      </main>
    </div>
  );
}
