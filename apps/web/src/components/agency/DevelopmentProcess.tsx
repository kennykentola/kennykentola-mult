'use client';
import { CheckCircle2 } from 'lucide-react';

const steps = [
  { num: '01', title: 'Discovery & Strategy', desc: 'We analyze your requirements, market context, and technical feasibility to define the MVP scope.' },
  { num: '02', title: 'UI/UX Design', desc: 'Our award-winning designers craft high-fidelity wireframes and interactive prototypes.' },
  { num: '03', title: 'Architecture Planning', desc: 'We design the database schemas, API specs, and select the optimal cloud infrastructure.' },
  { num: '04', title: 'Agile Development', desc: 'Sprints begin. You get a transparent view into our Jira/Kanban board and daily progress.' },
  { num: '05', title: 'QA & Testing', desc: 'Rigorous automated and manual testing ensures zero critical bugs before launch.' },
  { num: '06', title: 'Deployment', desc: 'We handle CI/CD pipelines, containerization, and App Store submissions.' },
  { num: '07', title: 'Maintenance', desc: 'Post-launch SLA support, scaling, and feature additions.' },
];

export function DevelopmentProcess() {
  return (
    <section id="process" className="py-24 bg-[#0A0A0A] border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-12 lg:gap-24">
          <div className="w-full md:w-1/3">
            <h2 className="text-4xl font-extrabold text-white mb-4 sticky top-32">How We Build.</h2>
            <p className="text-slate-400 sticky top-48">A battle-tested, agile methodology that guarantees delivery on-time and on-budget, with total transparency.</p>
          </div>
          
          <div className="w-full md:w-2/3 space-y-8 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-indigo-500/30 before:to-transparent">
            {steps.map((step, i) => (
              <div key={i} className="relative flex items-start gap-6 group">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#050505] border-2 border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold z-10 group-hover:border-indigo-400 group-hover:bg-indigo-500/20 transition-all">
                  {step.num}
                </div>
                <div className="pt-2 pb-8">
                  <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
