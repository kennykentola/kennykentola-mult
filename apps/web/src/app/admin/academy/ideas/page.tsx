'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Save, X, Lightbulb } from 'lucide-react';

interface Idea {
  $id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  retentionPeriod: string;
  createdAt: string;
}

export default function ManageAcademicIdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General',
    status: 'active',
    retentionPeriod: '1 year'
  });

  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/academic-ideas`);
      if (res.ok) {
        const data = await res.json();
        setIdeas(data);
      }
    } catch (err) {
      console.error('Failed to fetch ideas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId 
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/academic-ideas/${editingId}`
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/academic-ideas`;
        
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setIsModalOpen(false);
        setEditingId(null);
        fetchIdeas();
      } else {
        alert('Failed to save idea');
      }
    } catch (err) {
      console.error('Error saving idea:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this idea?')) return;
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/academic-ideas/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (res.ok) {
        fetchIdeas();
      }
    } catch (err) {
      console.error('Error deleting idea:', err);
    }
  };

  const openEdit = (idea: Idea) => {
    setEditingId(idea.$id);
    setFormData({
      title: idea.title,
      description: idea.description,
      category: idea.category || 'General',
      status: idea.status || 'active',
      retentionPeriod: idea.retentionPeriod || '1 year'
    });
    setIsModalOpen(true);
  };

  const openNew = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      category: 'General',
      status: 'active',
      retentionPeriod: '1 year'
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex justify-between items-center bg-slate-900/50 p-6 rounded-2xl border border-white/10">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-yellow-400" />
            Project Ideas
          </h1>
          <p className="text-slate-400 text-sm mt-1">Manage the list of curated academic project ideas shown on the public site.</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all"
        >
          <Plus className="h-4 w-4" />
          Add Idea
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 animate-pulse">Loading ideas...</div>
      ) : ideas.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/20 rounded-2xl border border-white/5 text-slate-400">
          No project ideas found. Create one!
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {ideas.map((idea) => (
            <div key={idea.$id} className="bg-slate-900/40 border border-white/10 rounded-2xl p-5 hover:bg-slate-900/60 transition-all flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {idea.category}
                </span>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(idea)} className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(idea.$id)} className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <h3 className="font-bold text-white text-lg mb-2">{idea.title}</h3>
              <p className="text-sm text-slate-400 line-clamp-3 mb-4 flex-1">{idea.description}</p>
              
              <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-white/5 mt-auto">
                <span>Expires: {idea.retentionPeriod || '1 year'}</span>
                <span>{new Date(idea.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white">
                {editingId ? 'Edit Project Idea' : 'New Project Idea'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">Topic Title</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. AI-Powered Student Management"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">Description</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500 min-h-[120px]"
                  placeholder="Briefly describe the project..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option>General</option>
                    <option>Artificial Intelligence</option>
                    <option>Web Development</option>
                    <option>Mobile Apps</option>
                    <option>IoT & Hardware</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5">Auto-Delete / Retention</label>
                  <select
                    value={formData.retentionPeriod}
                    onChange={(e) => setFormData({...formData, retentionPeriod: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option>6 months</option>
                    <option>1 year</option>
                    <option>2 years</option>
                    <option>Never</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 transition-colors shadow-lg shadow-indigo-500/20"
                >
                  <Save className="h-4 w-4" />
                  Save Idea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
