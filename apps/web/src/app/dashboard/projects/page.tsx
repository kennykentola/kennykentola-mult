'use client';

import React, { useState } from 'react';
import { Briefcase, Calendar, CheckSquare, Clock, Plus, Upload, FileText, Send } from 'lucide-react';

export default function ProjectsPage() {
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectCategory, setProjectCategory] = useState('Software Development');
  const [projectBrief, setProjectBrief] = useState('');
  const [budget, setBudget] = useState('');

  const activeProjects = [
    {
      id: 'proj-1',
      name: 'Multi-Tenant CRM Web Portal',
      category: 'Software Development',
      status: 'In Development',
      deliveryDate: 'July 15, 2026',
      price: '$2,500',
      progress: 45,
      milestones: [
        { label: 'Requirements & Design Signoff', date: 'June 10', completed: true },
        { label: 'Database Schema & Auth Config', date: 'June 25', completed: true },
        { label: 'Core Client Modules & API Hooks', date: 'July 5', completed: false },
        { label: 'Verification & QA Testing', date: 'July 12', completed: false }
      ]
    }
  ];

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Project request submitted for "${projectName}". Our project manager will contact you via email within 24 hours.`);
    setProjectName('');
    setProjectBrief('');
    setBudget('');
    setShowRequestForm(false);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Project Tracker</h1>
          <p className="text-slate-400 text-sm mt-1">Track software architecture milestones, agreements, and active developer pipelines.</p>
        </div>

        <button
          onClick={() => setShowRequestForm(!showRequestForm)}
          className="rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-90 transition-opacity px-5 py-3 text-xs font-bold text-white shadow flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Request Estimation
        </button>
      </div>

      {/* Request Form Modal / Section */}
      {showRequestForm && (
        <div className="glass-panel border border-white/10 bg-slate-900/40 rounded-2xl p-6 lg:p-8 animate-in fade-in duration-200">
          <h2 className="text-lg font-bold text-white mb-6">Submit Project Brief</h2>
          <form onSubmit={handleRequestSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solar Power Grid System, Student Handout App"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="proj-cat" className="text-xs font-semibold text-slate-400 block mb-1.5">Project Category</label>
                <select
                  id="proj-cat"
                  title="Project Category"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                  value={projectCategory}
                  onChange={(e) => setProjectCategory(e.target.value)}
                >
                  <option value="Software Development">Software Development (MVP)</option>
                  <option value="App Maintenance">Legacy App Maintenance</option>
                  <option value="CS Student Project">CS Student Project Setup</option>
                  <option value="Solar & Home Electrical">Solar Installation / Electrical Wiring</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">Project Brief & Details</label>
              <textarea
                required
                rows={4}
                placeholder="Briefly describe the features, targets, UI references, or solar grid sizes you want to build."
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors resize-none"
                value={projectBrief}
                onChange={(e) => setProjectBrief(e.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Target Budget (USD)</label>
                <input
                  type="text"
                  placeholder="e.g. $1,500, $5,000"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Attach Scope Files / Mockups</label>
                <div className="flex items-center gap-3">
                  <button type="button" className="rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 px-4 py-2.5 text-xs text-slate-300 font-semibold flex items-center gap-2 transition-colors">
                    <Upload className="h-4 w-4" /> Upload PDF
                  </button>
                  <span className="text-xs text-slate-500">Max size 20MB</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowRequestForm(false)}
                className="rounded-xl bg-slate-900 hover:bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-400 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-cyan-600 hover:bg-cyan-500 px-5 py-2.5 text-xs font-semibold text-white transition-colors flex items-center gap-1.5"
              >
                <Send className="h-3.5 w-3.5" /> Submit Request
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Projects Grid */}
      <div className="space-y-6">
        {activeProjects.map((project) => (
          <div key={project.id} className="glass-panel border border-white/5 bg-slate-900/20 rounded-2xl p-6 lg:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-900 pb-6 mb-6 gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {project.status}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{project.category}</span>
                </div>
                <h3 className="text-xl font-bold text-white mt-3">{project.name}</h3>
              </div>

              <div className="text-left md:text-right">
                <span className="text-xs text-slate-500 block">Total Budget</span>
                <span className="text-xl font-extrabold text-cyan-400 mt-1 block">{project.price}</span>
              </div>
            </div>

            {/* Milestones Flow Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Milestone Roadmap</h4>
                <div className="relative border-l border-slate-850 pl-5 ml-2.5 space-y-5">
                  {project.milestones.map((milestone, mIdx) => (
                    <div key={mIdx} className="relative">
                      {/* Milestone Bullet indicator */}
                      <div className={`absolute left-[-26px] top-1.5 h-3.5 w-3.5 rounded-full border-2 ${
                        milestone.completed 
                          ? 'bg-cyan-500 border-cyan-500' 
                          : 'bg-slate-950 border-slate-700'
                      }`} />
                      <div className="flex justify-between items-start text-xs">
                        <span className={`font-semibold ${milestone.completed ? 'text-white' : 'text-slate-500'}`}>
                          {milestone.label}
                        </span>
                        <span className="text-slate-500">{milestone.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Status Overview</h4>
                <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-5 space-y-4">
                  <div>
                    <div className="flex justify-between items-center text-xs text-slate-400 mb-1.5">
                      <span>Overall Progress</span>
                      <span className="font-bold text-cyan-400">{project.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-850 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full" 
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-2 text-xs">
                    <div className="flex-1">
                      <span className="text-slate-500 block">Est. Delivery</span>
                      <span className="text-white font-semibold flex items-center gap-1.5 mt-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" /> {project.deliveryDate}
                      </span>
                    </div>
                    <div className="flex-1">
                      <span className="text-slate-500 block">Contract Agreement</span>
                      <a href="#" className="text-indigo-400 font-semibold flex items-center gap-1.5 mt-1 hover:underline">
                        <FileText className="h-3.5 w-3.5 text-slate-400" /> View Agreement.pdf
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
