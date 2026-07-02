'use client';
import { Smartphone, Globe, PenTool, Database, Cpu, Layout, Cloud, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

const services = [
  { icon: Globe, title: 'Web Development', desc: 'Scalable, SEO-optimized enterprise web applications built with React & Next.js.', color: 'text-blue-400' },
  { icon: Smartphone, title: 'Mobile Apps', desc: 'Native & Cross-platform apps for iOS and Android that users love.', color: 'text-indigo-400' },
  { icon: PenTool, title: 'UI/UX Design', desc: 'Award-winning interfaces designed for maximum conversion and engagement.', color: 'text-pink-400' },
  { icon: Layout, title: 'SaaS Platforms', desc: 'End-to-end architecture and development for your SaaS product idea.', color: 'text-emerald-400' },
  { icon: Cpu, title: 'AI Solutions', desc: 'Integrating LLMs, computer vision, and machine learning into your business.', color: 'text-violet-400' },
  { icon: Database, title: 'API Development', desc: 'Robust, secure, and fast RESTful & GraphQL APIs.', color: 'text-cyan-400' },
  { icon: Cloud, title: 'Cloud Solutions', desc: 'AWS, GCP, and Azure architecture, deployment, and DevOps.', color: 'text-amber-400' },
  { icon: ShieldCheck, title: 'Maintenance', desc: '24/7 SLA support, security patching, and continuous delivery.', color: 'text-rose-400' },
];

export function ServicesOverview() {
  return (
    <section id="services" className="py-24 bg-[#050505]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-white mb-4">Our Expertise</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">We are a full-stack powerhouse capable of handling every stage of the software development lifecycle.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((svc, i) => {
            const Icon = svc.icon;
            return (
              <div key={i} className="group p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all cursor-pointer">
                <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${svc.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{svc.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">{svc.desc}</p>
                <Link href="/agency/dashboard" className="text-xs font-bold uppercase tracking-wider text-indigo-400 hover:text-white transition-colors">
                  Learn More &rarr;
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
