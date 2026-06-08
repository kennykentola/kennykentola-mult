'use client';

import React, { useState } from 'react';
import { Layers, Calendar, DollarSign, User, Award, Plus, CheckCircle2, ChevronRight } from 'lucide-react';

const getProgressWidthClass = (progress: number) => {
  const rounded = Math.round((progress || 0) / 5) * 5;
  switch (rounded) {
    case 5: return 'w-[5%]';
    case 20: return 'w-[20%]';
    case 45: return 'w-[45%]';
    case 50: return 'w-[50%]';
    case 85: return 'w-[85%]';
    case 100: return 'w-full';
    default: return 'w-0';
  }
};

export default function AdminProjectsPage() {
  const [activeProjects, setActiveProjects] = useState([
    {
      id: 'proj-1',
      name: 'Multi-Tenant CRM Web Portal',
      category: 'Software Development',
      client: 'Acme Corp Client',
      status: 'In Development',
      price: '$2,500',
      progress: 45,
      assignee: 'David Miller (Dev)'
    }
  ]);

  const [estimateRequests, setEstimateRequests] = useState([
    {
      id: 'req-101',
      name: 'Residential Solar Installation (10kVA)',
      category: 'Solar & Home Electrical',
      client: 'Solar Dave',
      brief: 'Need 12 solar panels, hybrid inverter, and backup battery bank installed for 4-bedroom duplex.',
      budget: 'Estimate Pending'
    }
  ]);

  const [assigningProjectId, setAssigningProjectId] = useState<string | null>(null);
  const [assignedBudget, setAssignedBudget] = useState('');
  const [assignedDev, setAssignedDev] = useState('');

  const handleApproveEstimate = (reqId: string) => {
    const req = estimateRequests.find(r => r.id === reqId);
    if (!req) return;

    const newProject = {
      id: `proj-${Date.now()}`,
      name: req.name,
      category: req.category,
      client: req.client,
      status: 'Requirement Gathering',
      price: assignedBudget || '$1,500',
      progress: 5,
      assignee: assignedDev || 'Unassigned'
    };

    setActiveProjects([...activeProjects, newProject]);
    setEstimateRequests(estimateRequests.filter(r => r.id !== reqId));
    setAssigningProjectId(null);
    setAssignedBudget('');
    setAssignedDev('');
  };

  const handleUpdateStatus = (projId: string, status: string) => {
    let progress = 5;
    if (status === 'Design') progress = 20;
    else if (status === 'In Development') progress = 50;
    else if (status === 'QA Verification') progress = 85;
    else if (status === 'Delivered') progress = 100;

    const updated = activeProjects.map(p => {
      if (p.id === projId) {
        return { ...p, status, progress };
      }
      return p;
    });
    setActiveProjects(updated);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white">Project Pipeline Board</h1>
        <p className="text-slate-400 text-sm mt-1">Review customer request scopes, assign budget estimation cards, configure project developer leads, and log milestones.</p>
      </div>

      {/* Estimate Requests section */}
      <div className="glass-panel border border-white/5 bg-slate-900/20 rounded-3xl p-6 lg:p-8 space-y-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Incoming Estimate Requests</h3>
        
        {estimateRequests.length > 0 ? (
          <div className="space-y-4">
            {estimateRequests.map((req) => (
              <div key={req.id} className="p-5 rounded-2xl border border-white/5 bg-slate-950/40 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-450 border border-amber-500/20">
                      Pending Estimate
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1.5">{req.name}</h4>
                    <span className="text-[10px] text-slate-500 font-medium">Requested by {req.client} • Category: {req.category}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-400">{req.budget}</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-900">
                  {req.brief}
                </p>

                {assigningProjectId === req.id ? (
                  <div className="pt-4 border-t border-slate-900 flex flex-col sm:flex-row gap-3 items-end">
                    <div className="flex-1">
                      <label className="text-[10px] font-semibold text-slate-500 block mb-1">Set Price Quote (USD)</label>
                      <input
                        type="text"
                        placeholder="e.g. $4,800"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                        value={assignedBudget}
                        onChange={(e) => setAssignedBudget(e.target.value)}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] font-semibold text-slate-500 block mb-1">Assign Tech Lead / Electrician</label>
                      <input
                        type="text"
                        placeholder="e.g. Sarah Jenkins"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                        value={assignedDev}
                        onChange={(e) => setAssignedDev(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveEstimate(req.id)}
                        className="bg-rose-650 hover:bg-rose-600 text-white font-bold px-4 py-2 rounded-lg text-xs transition-colors h-9"
                      >
                        Approve & Start
                      </button>
                      <button
                        onClick={() => setAssigningProjectId(null)}
                        className="bg-slate-900 border border-slate-800 text-slate-400 hover:text-white font-bold px-3 py-2 rounded-lg text-xs transition-colors h-9"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setAssigningProjectId(req.id)}
                    className="rounded-lg bg-rose-600 hover:bg-rose-500 py-2 px-4 text-xs font-bold text-white transition-colors"
                  >
                    Evaluate Scope & Set Pricing
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border border-dashed border-slate-800 rounded-2xl">
            <p className="text-slate-500 text-xs">No pending project estimate requests.</p>
          </div>
        )}
      </div>

      {/* Active Projects List */}
      <div className="glass-panel border border-white/5 bg-slate-900/20 rounded-3xl p-6 lg:p-8 space-y-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Active Pipeline Tracker</h3>
        
        <div className="space-y-4">
          {activeProjects.map((project) => (
            <div key={project.id} className="p-5 rounded-2xl border border-white/5 bg-slate-950/40 text-xs">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-900 pb-4 mb-4 gap-4">
                <div>
                  <h4 className="text-sm font-bold text-white">{project.name}</h4>
                  <span className="text-[10px] text-slate-500 font-medium">Client: {project.client} • Category: {project.category}</span>
                </div>
                <div className="flex gap-2.5 items-center">
                  <span className="text-slate-500">Lead:</span>
                  <span className="font-bold text-slate-350">{project.assignee}</span>
                  <span className="text-rose-450 font-bold bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded ml-2">
                    {project.price}
                  </span>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1.5">
                    <span>Task Completion</span>
                    <span className="font-bold text-rose-400">{project.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-850 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r from-rose-500 to-indigo-500 rounded-full ${getProgressWidthClass(project.progress)}`}
                    />
                  </div>
                </div>

                <div className="flex justify-end items-center gap-2">
                  <span className="text-slate-500">Pipeline Stage:</span>
                  <select
                    title="Pipeline Stage"
                    className="bg-slate-950 border border-slate-800 text-xs rounded px-2 py-1 text-white focus:outline-none focus:border-rose-500"
                    value={project.status}
                    onChange={(e) => handleUpdateStatus(project.id, e.target.value)}
                  >
                    <option value="Requirement Gathering">Requirement Gathering</option>
                    <option value="Design">Design Mockups</option>
                    <option value="In Development">In Development</option>
                    <option value="QA Verification">QA Verification</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
