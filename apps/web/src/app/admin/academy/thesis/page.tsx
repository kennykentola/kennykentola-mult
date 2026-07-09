'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Save, X, BookText } from 'lucide-react';

interface ThesisSample {
  $id: string;
  title: string;
  content: string;
  category: string;
  status: string;
  createdAt: string;
}

export default function ManageThesisPage() {
  const [samples, setSamples] = useState<ThesisSample[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Computer Science',
    status: 'active',
  });

  useEffect(() => {
    fetchSamples();
  }, []);

  const fetchSamples = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}` + `/thesis-samples`);
      if (res.ok) {
        const data = await res.json();
        setSamples(data);
      }
    } catch (err) {
      console.error('Failed to fetch thesis samples:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId 
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}` + `/thesis-samples/${editingId}`
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}` + `/thesis-samples`;
        
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
        fetchSamples();
      } else {
        alert('Failed to save thesis sample');
      }
    } catch (err) {
      console.error('Error saving item:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sample?')) return;
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}` + `/thesis-samples/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (res.ok) {
        fetchSamples();
      }
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  };

  const openEdit = (item: ThesisSample) => {
    setEditingId(item.$id);
    setFormData({
      title: item.title,
      content: item.content,
      category: item.category || 'Computer Science',
      status: item.status || 'active',
    });
    setIsModalOpen(true);
  };

  const openNew = () => {
    setEditingId(null);
    setFormData({
      title: '',
      content: '',
      category: 'Computer Science',
      status: 'active',
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex justify-between items-center bg-slate-900/50 p-6 rounded-2xl border border-white/10">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookText className="h-6 w-6 text-sky-400" />
            Thesis Samples
          </h1>
          <p className="text-slate-400 text-sm mt-1">Manage academic write-ups and samples shown to the public.</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all"
        >
          <Plus className="h-4 w-4" />
          Add Sample
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 animate-pulse">Loading thesis samples...</div>
      ) : samples.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/20 rounded-2xl border border-white/5 text-slate-400">
          No thesis samples found. Create one!
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {samples.map((item) => (
            <div key={item.$id} className="bg-slate-900/40 border border-white/10 rounded-2xl p-5 hover:bg-slate-900/60 transition-all flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  {item.category}
                </span>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openEdit(item)} title="Edit Sample" aria-label="Edit Sample" className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(item.$id)} title="Delete Sample" aria-label="Delete Sample" className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <h3 className="font-bold text-white text-lg mb-2">{item.title}</h3>
              <p className="text-sm text-slate-400 line-clamp-4 mb-4 flex-1">
                {item.content.replace(/<[^>]*>?/gm, '').substring(0, 150)}...
              </p>
              
              <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-white/5 mt-auto">
                <span>{item.status}</span>
                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-slate-800 shrink-0">
              <h2 className="text-xl font-bold text-white">
                {editingId ? 'Edit Thesis Sample' : 'New Thesis Sample'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} title="Close" aria-label="Close" className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5">Title</label>
                  <input
                    required
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. AI-Powered Diagnostics in Healthcare"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. Computer Science"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5 flex justify-between">
                  <span>Content (HTML Supported)</span>
                </label>
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-slate-300 focus:outline-none focus:border-indigo-500 min-h-[400px] font-mono text-sm leading-relaxed"
                  placeholder="<h1>Chapter 1</h1><p>Introduction goes here...</p>"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">Status</label>
                <select
                  title="Status"
                  aria-label="Status"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="active">Active (Visible)</option>
                  <option value="hidden">Hidden</option>
                </select>
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
                  Save Sample
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
