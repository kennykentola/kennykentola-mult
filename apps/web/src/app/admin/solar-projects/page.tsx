'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { getSolarProjects, createAdminSolarProject, updateAdminSolarProject, deleteAdminSolarProject, SolarProject } from '../../../features/solar/solarProjectsService';

export default function AdminSolarProjectsPage() {
  const [projects, setProjects] = useState<SolarProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProject, setCurrentProject] = useState<Partial<SolarProject>>({});

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await getSolarProjects();
      setProjects(data);
    } catch (err) {
      console.error('Failed to load projects', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (project: SolarProject) => {
    setCurrentProject({ ...project, equipment: project.equipment || [] });
    setIsEditing(true);
  };

  const handleNew = () => {
    setCurrentProject({
      title: '',
      size: '',
      location: '',
      type: 'Commercial',
      savings: '',
      image: '',
      description: '',
      roi: '',
      co2Offset: '',
      gridIndependence: '',
      uptime: '',
      equipment: [],
      timeline: ''
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      if (currentProject.$id) {
        await updateAdminSolarProject(currentProject.$id, currentProject);
      } else {
        await createAdminSolarProject(currentProject as SolarProject);
      }
      setIsEditing(false);
      loadProjects();
    } catch (err) {
      console.error('Failed to save project', err);
      alert('Failed to save project');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await deleteAdminSolarProject(id);
      loadProjects();
    } catch (err) {
      console.error('Failed to delete', err);
      alert('Failed to delete project');
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Solar Projects</h1>
          <p className="text-slate-400 text-sm mt-1">Manage the featured case studies on the solar portfolio page.</p>
        </div>
        <button
          onClick={handleNew}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Project
        </button>
      </div>

      {loading ? (
        <div className="text-slate-400 animate-pulse">Loading projects...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(proj => (
            <div key={proj.$id} className="glass-panel border border-white/5 bg-slate-900/40 rounded-3xl p-6 relative group overflow-hidden">
              <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(proj)} title="Edit Project" className="p-2 bg-blue-500/20 text-blue-400 rounded-full hover:bg-blue-500/40">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(proj.$id!)} title="Delete Project" className="p-2 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/40">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{proj.title}</h3>
              <p className="text-slate-400 text-sm mb-4 line-clamp-2">{proj.description}</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-slate-500">Location</span>
                  <span className="text-white font-medium">{proj.location}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-slate-500">Type</span>
                  <span className="text-white font-medium">{proj.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Size</span>
                  <span className="text-white font-medium">{proj.size}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-2xl w-full my-auto mt-20 max-h-[90vh] overflow-y-auto hide-scrollbar">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">{currentProject.$id ? 'Edit Project' : 'New Project'}</h2>
              <button onClick={() => setIsEditing(false)} title="Close" className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Title</label>
                  <input type="text" title="Title" placeholder="Project Title" className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2 text-white" 
                    value={currentProject.title || ''} onChange={e => setCurrentProject({...currentProject, title: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Location</label>
                  <input type="text" title="Location" placeholder="Location" className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2 text-white" 
                    value={currentProject.location || ''} onChange={e => setCurrentProject({...currentProject, location: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">System Size</label>
                  <input type="text" title="System Size" placeholder="System Size" className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2 text-white" 
                    value={currentProject.size || ''} onChange={e => setCurrentProject({...currentProject, size: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Type</label>
                  <select title="Project Type" className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2 text-white"
                    value={currentProject.type || ''} onChange={e => setCurrentProject({...currentProject, type: e.target.value})}>
                    <option value="Commercial">Commercial</option>
                    <option value="Industrial">Industrial</option>
                    <option value="Residential">Residential</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Est. Savings</label>
                  <input type="text" title="Est. Savings" placeholder="Est. Savings" className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2 text-white" 
                    value={currentProject.savings || ''} onChange={e => setCurrentProject({...currentProject, savings: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Image URL</label>
                  <input type="text" title="Image URL" placeholder="Image URL" className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2 text-white" 
                    value={currentProject.image || ''} onChange={e => setCurrentProject({...currentProject, image: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Description</label>
                <textarea rows={3} title="Description" placeholder="Description" className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2 text-white" 
                  value={currentProject.description || ''} onChange={e => setCurrentProject({...currentProject, description: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">ROI</label>
                  <input type="text" title="ROI" placeholder="ROI" className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2 text-white" 
                    value={currentProject.roi || ''} onChange={e => setCurrentProject({...currentProject, roi: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">CO2 Offset</label>
                  <input type="text" title="CO2 Offset" placeholder="CO2 Offset" className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2 text-white" 
                    value={currentProject.co2Offset || ''} onChange={e => setCurrentProject({...currentProject, co2Offset: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Grid Independence</label>
                  <input type="text" title="Grid Independence" placeholder="Grid Independence" className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2 text-white" 
                    value={currentProject.gridIndependence || ''} onChange={e => setCurrentProject({...currentProject, gridIndependence: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Uptime</label>
                  <input type="text" title="Uptime" placeholder="Uptime" className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2 text-white" 
                    value={currentProject.uptime || ''} onChange={e => setCurrentProject({...currentProject, uptime: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Timeline</label>
                  <input type="text" title="Timeline" placeholder="Timeline" className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2 text-white" 
                    value={currentProject.timeline || ''} onChange={e => setCurrentProject({...currentProject, timeline: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Equipment (comma separated)</label>
                  <input type="text" title="Equipment" placeholder="Equipment (comma separated)" className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2 text-white" 
                    value={(currentProject.equipment || []).join(', ')} 
                    onChange={e => setCurrentProject({...currentProject, equipment: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})} />
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 flex justify-end gap-4">
                <button onClick={() => setIsEditing(false)} className="px-6 py-2 rounded-xl font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                  Cancel
                </button>
                <button onClick={handleSave} className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold flex items-center transition-colors">
                  <Save className="w-4 h-4 mr-2" />
                  Save Project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
