'use client';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: "How much does a custom app or website cost?",
    a: "Pricing depends entirely on scope, features, and timeline. An MVP might start at $5k-$10k, while a full enterprise platform could be $50k+. We provide a detailed technical quote after you submit a project brief."
  },
  {
    q: "How long does it take to build?",
    a: "Simple websites can take 2-4 weeks. MVPs typically take 6-8 weeks. Complex SaaS or enterprise applications can take 3-6 months. We break development down into 2-week sprints with clear milestones."
  },
  {
    q: "Who owns the code?",
    a: "You do. Once the final invoice is paid, 100% of the Intellectual Property (IP), source code, and assets are transferred to your ownership."
  },
  {
    q: "Do you offer post-launch support and maintenance?",
    a: "Yes! We offer SLA-backed maintenance plans to keep your software secure, handle server scaling, fix any edge-case bugs, and deploy new features."
  }
];

export function FAQs() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="py-24 bg-[#0A0A0A]">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-white mb-4">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-white/5 rounded-xl bg-slate-900/50 overflow-hidden">
              <button 
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none"
              >
                <span className="font-bold text-white text-lg">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-indigo-400 transition-transform ${openIdx === i ? 'rotate-180' : ''}`} />
              </button>
              {openIdx === i && (
                <div className="px-6 pb-6 text-slate-400 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
