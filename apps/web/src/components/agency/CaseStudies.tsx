'use client';
import Link from 'next/link';
import { ArrowRight, BarChart, TrendingUp, Users } from 'lucide-react';

export function CaseStudies() {
  return (
    <section id="case-studies" className="py-24 bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-extrabold text-white mb-4">Case Studies</h2>
            <p className="text-slate-400">Deep dives into how we solved complex engineering problems for our clients, resulting in measurable business growth.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Case Study 1 */}
          <div className="rounded-3xl border border-white/5 bg-slate-900/50 p-8 md:p-12">
            <div className="text-indigo-400 font-bold uppercase tracking-wider text-xs mb-4">Logistics & Supply Chain</div>
            <h3 className="text-3xl font-bold text-white mb-6">Scaling Zenith Logistics from 1k to 50k deliveries per day.</h3>
            <p className="text-slate-400 leading-relaxed mb-8">
              We rebuilt their monolithic PHP system into a highly scalable Node.js microservices architecture, paired with a real-time React Native driver app.
            </p>
            <div className="grid grid-cols-3 gap-4 border-y border-white/5 py-6 mb-8">
              <div>
                <div className="text-2xl font-bold text-white flex items-center gap-2"><TrendingUp className="w-5 h-5 text-emerald-400" /> 50x</div>
                <div className="text-xs text-slate-500 uppercase">Scale Increase</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white flex items-center gap-2"><Users className="w-5 h-5 text-indigo-400" /> 10k+</div>
                <div className="text-xs text-slate-500 uppercase">Active Drivers</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white flex items-center gap-2"><BarChart className="w-5 h-5 text-cyan-400" /> 99.9%</div>
                <div className="text-xs text-slate-500 uppercase">Uptime</div>
              </div>
            </div>
            <Link href="/agency/dashboard" className="text-indigo-400 font-bold hover:text-white flex items-center gap-2 transition-colors">
              Start Similar Project <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Case Study 2 */}
          <div className="rounded-3xl border border-white/5 bg-slate-900/50 p-8 md:p-12">
            <div className="text-emerald-400 font-bold uppercase tracking-wider text-xs mb-4">Healthcare SaaS</div>
            <h3 className="text-3xl font-bold text-white mb-6">HIPAA-Compliant AI Patient Triage System for Medico.</h3>
            <p className="text-slate-400 leading-relaxed mb-8">
              Integrated OpenAI's GPT-4 with a custom trained vector database to triage patients automatically before they see a doctor, saving thousands of clinical hours.
            </p>
            <div className="grid grid-cols-3 gap-4 border-y border-white/5 py-6 mb-8">
              <div>
                <div className="text-2xl font-bold text-white flex items-center gap-2"><TrendingUp className="w-5 h-5 text-emerald-400" /> 80%</div>
                <div className="text-xs text-slate-500 uppercase">Time Saved</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white flex items-center gap-2"><Users className="w-5 h-5 text-indigo-400" /> 250k</div>
                <div className="text-xs text-slate-500 uppercase">Patients Processed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white flex items-center gap-2"><BarChart className="w-5 h-5 text-cyan-400" /> $1.2M</div>
                <div className="text-xs text-slate-500 uppercase">Cost Reduction</div>
              </div>
            </div>
            <Link href="/agency/dashboard" className="text-emerald-400 font-bold hover:text-white flex items-center gap-2 transition-colors">
              Start Similar Project <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
