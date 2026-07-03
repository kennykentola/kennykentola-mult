'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Save, X, Image as ImageIcon, Palette } from 'lucide-react';

interface DesignPortfolioItem {
  $id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  status: string;
  createdAt: string;
}

export default function ManageDesignPortfolioPage() {
  const [items, setItems] = useState<DesignPortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    imageUrl: '',
    status: 'active',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/design-portfolio`);
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error('Failed to fetch design portfolio items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadImage = async (file: File): Promise<string | null> => {
    const uploadData = new FormData();
    uploadData.append('file', file);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: uploadData
      });
      if (res.ok) {
        const data = await res.json();
        return data.url;
      }
      return null;
    } catch (err) {
      console.error('Upload failed:', err);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUploading(true);
      let finalImageUrl = formData.imageUrl;
      
      if (imageFile) {
        const uploadedUrl = await handleUploadImage(imageFile);
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
        }
      }

      if (!finalImageUrl) {
        alert("Image is required for design portfolio.");
        setUploading(false);
        return;
      }

      const payload = { ...formData, imageUrl: finalImageUrl };
      
      const url = editingId 
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/design-portfolio/${editingId}`
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/design-portfolio`;
        
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsModalOpen(false);
        setEditingId(null);
        setImageFile(null);
        fetchItems();
      } else {
        alert('Failed to save portfolio item');
      }
    } catch (err) {
      console.error('Error saving item:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this design?')) return;
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/design-portfolio/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (res.ok) {
        fetchItems();
      }
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  };

  const openEdit = (item: DesignPortfolioItem) => {
    setEditingId(item.$id);
    setFormData({
      title: item.title,
      subtitle: item.subtitle || '',
      imageUrl: item.imageUrl || '',
      status: item.status || 'active',
    });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const openNew = () => {
    setEditingId(null);
    setFormData({
      title: '',
      subtitle: '',
      imageUrl: '',
      status: 'active',
    });
    setImageFile(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex justify-between items-center bg-slate-900/50 p-6 rounded-2xl border border-white/10">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Palette className="h-6 w-6 text-rose-400" />
            Design Portfolio
          </h1>
          <p className="text-slate-400 text-sm mt-1">Manage graphic designs shown on the main design page showcase.</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all"
        >
          <Plus className="h-4 w-4" />
          Add Design
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 animate-pulse">Loading designs...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/20 rounded-2xl border border-white/5 text-slate-400">
          No designs found. Create one!
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.$id} className="bg-slate-900/40 border border-white/10 rounded-2xl overflow-hidden hover:bg-slate-900/60 transition-all flex flex-col">
              {item.imageUrl ? (
                <div className="h-40 w-full bg-slate-800 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="h-40 w-full bg-slate-800/50 flex items-center justify-center text-slate-500">
                  <ImageIcon className="h-10 w-10 opacity-20" />
                </div>
              )}
              
              <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-white text-lg line-clamp-1">{item.title}</h3>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => openEdit(item)} title="Edit Design" aria-label="Edit Design" className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(item.$id)} title="Delete Design" aria-label="Delete Design" className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-slate-400 line-clamp-3 mb-4 flex-1">{item.subtitle}</p>
                
                <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-white/5 mt-auto">
                  <span>{item.status}</span>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-200 my-8">
            <div className="flex justify-between items-center p-6 border-b border-slate-800 sticky top-0 bg-slate-900 rounded-t-2xl z-10">
              <h2 className="text-xl font-bold text-white">
                {editingId ? 'Edit Design' : 'New Design'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} title="Close" aria-label="Close" className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">Title</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Brand Identity"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">Subtitle</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Tech Startup"
                />
              </div>

              <div>
                <label htmlFor="designImage" className="block text-sm font-semibold text-slate-300 mb-1.5">Design Image</label>
                {formData.imageUrl && !imageFile && (
                  <div className="mb-2 relative w-full h-32 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={formData.imageUrl} alt="Current" className="w-full h-full object-cover" />
                  </div>
                )}
                <input
                  id="designImage"
                  title="Design Image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setImageFile(e.target.files[0]);
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500 file:mr-4 file:py-1 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-500/20 file:text-indigo-400 hover:file:bg-indigo-500/30"
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
                  disabled={uploading}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                >
                  {uploading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Design
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
