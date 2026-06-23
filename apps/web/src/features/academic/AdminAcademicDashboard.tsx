'use client';

import React, { useEffect, useState } from 'react';
import { AcademicProjectDto, fetchAllAcademicProjects, updateAcademicProject } from './academicService';
import { Loader2, GraduationCap, DollarSign, Edit, CheckCircle, ExternalLink } from 'lucide-react';

export default function AdminAcademicDashboard() {
  const [projects, setProjects] = useState<AcademicProjectDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<AcademicProjectDto>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadProjects() {
      try {
        const data = await fetchAllAcademicProjects();
        if (!cancelled) setProjects(data);
      } catch (err: any) {
        if (!cancelled) setError(err.message || 'Failed to load projects.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadProjects();
    return () => { cancelled = true; };
  }, []);

  const handleEditClick = (project: AcademicProjectDto) => {
    setEditingId(project.$id);
    setEditForm({
      status: project.status,
      price: project.price,
      assignedDeveloper: project.assignedDeveloper,
      proposalUrl: project.proposalUrl || '',
      documentationUrl: project.documentationUrl || '',
      sourceCodeUrl: project.sourceCodeUrl || ''
    });
  };

  const handleSave = async (id: string) => {
    setSaving(true);
    try {
      const updated = await updateAcademicProject(id, editForm);
      setProjects((prev) => prev.map((p) => p.$id === id ? updated : p));
      setEditingId(null);
    } catch (err: any) {
      alert(err.message || 'Failed to save updates');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-white/5 bg-slate-900/30">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="rounded-xl bg-indigo-500/10 p-2.5 text-indigo-400">
          <GraduationCap className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">CS Student Projects</h1>
          <p className="text-sm text-slate-400">Manage university thesis, docs, and implementation requests.</p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-400">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-white/5 bg-slate-900/30 shadow-xl">
        <table className="w-full text-left text-sm text-slate-400">
          <thead className="border-b border-white/5 bg-slate-950/50 text-xs font-semibold uppercase text-slate-300">
            <tr>
              <th className="px-6 py-4">Student Project</th>
              <th className="px-6 py-4">Requirements</th>
              <th className="px-6 py-4">Status & Price</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {projects.map((project) => (
              <tr key={project.$id} className="hover:bg-slate-900/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-white">{project.title}</div>
                  <div className="mt-1 text-xs">By User: {project.studentId}</div>
                  <div className="mt-1 flex gap-2 text-[10px] font-semibold text-indigo-300">
                    <span className="rounded bg-indigo-500/10 px-2 py-0.5 border border-indigo-500/20">{project.degree} - {project.level}</span>
                    <span className="rounded bg-slate-800 px-2 py-0.5">{project.universityName || 'No Uni Provided'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 max-w-xs">
                  <span className="inline-block mb-1 rounded bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-400 border border-purple-500/20">
                    Scope: {project.serviceScope}
                  </span>
                  <p className="text-xs line-clamp-3">{project.description}</p>
                </td>
                <td className="px-6 py-4">
                  {editingId === project.$id ? (
                    <div className="space-y-2">
                      <select 
                        title="Status"
                        aria-label="Status"
                        className="w-full rounded bg-slate-950 border border-slate-700 px-2 py-1 text-xs text-white"
                        value={editForm.status}
                        onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                      >
                        <option value="pending-proposal">Pending Proposal</option>
                        <option value="quoting">Quoting</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                      <input 
                        type="number"
                        className="w-full rounded bg-slate-950 border border-slate-700 px-2 py-1 text-xs text-white"
                        placeholder="Price"
                        value={editForm.price}
                        onChange={(e) => setEditForm({...editForm, price: Number(e.target.value)})}
                      />
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <span className="inline-block rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-300">
                        {project.status.replace('-', ' ')}
                      </span>
                      <div className="flex items-center gap-1 font-bold text-emerald-400">
                        <DollarSign className="h-3.5 w-3.5" />
                        {project.price.toLocaleString()}
                      </div>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {editingId === project.$id ? (
                    <div className="flex flex-col gap-2 items-end">
                      <input 
                        type="text" 
                        placeholder="Proposal URL" 
                        className="w-48 rounded bg-slate-950 border border-slate-700 px-2 py-1 text-xs text-white"
                        value={editForm.proposalUrl}
                        onChange={(e) => setEditForm({...editForm, proposalUrl: e.target.value})}
                      />
                      <input 
                        type="text" 
                        placeholder="Thesis Doc URL" 
                        className="w-48 rounded bg-slate-950 border border-slate-700 px-2 py-1 text-xs text-white"
                        value={editForm.documentationUrl}
                        onChange={(e) => setEditForm({...editForm, documentationUrl: e.target.value})}
                      />
                      <input 
                        type="text" 
                        placeholder="Source Code URL" 
                        className="w-48 rounded bg-slate-950 border border-slate-700 px-2 py-1 text-xs text-white"
                        value={editForm.sourceCodeUrl}
                        onChange={(e) => setEditForm({...editForm, sourceCodeUrl: e.target.value})}
                      />
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => setEditingId(null)} className="text-xs text-slate-500 hover:text-white">Cancel</button>
                        <button 
                          onClick={() => handleSave(project.$id)} 
                          disabled={saving}
                          className="flex items-center gap-1 rounded bg-indigo-600 px-3 py-1 text-xs font-bold text-white hover:bg-indigo-500"
                        >
                          {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-end gap-2">
                      <button 
                        onClick={() => handleEditClick(project)}
                        className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                      >
                        <Edit className="h-3.5 w-3.5" /> Edit & Attach
                      </button>
                      {(project.proposalUrl || project.documentationUrl || project.sourceCodeUrl) && (
                        <div className="text-[10px] text-emerald-500/70 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> Deliverables Attached
                        </div>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                  No academic projects found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
