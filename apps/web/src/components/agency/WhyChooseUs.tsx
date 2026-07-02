'use client';
import { Target, Clock, Code, DollarSign, ShieldCheck, Headphones } from 'lucide-react';

const reasons = [
  { icon: Target, title: 'Experienced Team', desc: 'Veterans in software engineering who have built systems processing millions of transactions.' },
  { icon: Clock, title: 'Fast Delivery', desc: 'Agile sprints and rapid prototyping mean you see working software in weeks, not months.' },
  { icon: Code, title: 'Agile Development', desc: 'Total transparency into our Jira boards. You are part of the team.' },
  { icon: DollarSign, title: 'Transparent Pricing', desc: 'No hidden fees. We provide detailed technical proposals and fixed-cost or sprint-based quotes.' },
  { icon: ShieldCheck, title: 'Security First', desc: 'Enterprise-grade encryption, OWASP Top 10 compliance, and rigorous penetration testing.' },
  { icon: Headphones, title: 'Long-Term Support', desc: 'We don\'t just launch and leave. We provide SLA-backed maintenance and scaling support.' },
];

export function WhyChooseUs() {
  return (
    <section className="py-24 bg-[#050505] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-white mb-4">Why Top Companies Choose Us</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">We don't just write code. We architect scalable businesses.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reasons.map((reason, i) => {
            const Icon = reason.icon;
            return (
              <div key={i} className="flex gap-4 p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-colors">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{reason.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{reason.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
