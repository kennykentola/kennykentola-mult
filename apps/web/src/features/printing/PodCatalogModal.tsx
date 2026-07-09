'use client';

import React, { useState, useEffect } from 'react';
import { X, Upload, Package } from 'lucide-react';
import type { PodItem } from './printingService';
import { createPodItem, updatePodItem } from './printingService';

interface PodCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingItem?: PodItem;
  onSuccess: (item: PodItem) => void;
}

export function PodCatalogModal({ isOpen, onClose, existingItem, onSuccess }: PodCatalogModalProps) {
  const [formData, setFormData] = useState<Partial<PodItem>>({
    title: '',
    description: '',
    category: 't-shirt',
    basePrice: 0,
    imageUrl: '',
    status: 'active'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existingItem) {
      setFormData(existingItem);
    } else {
      setFormData({
        title: '',
        description: '',
        category: 't-shirt',
        basePrice: 0,
        imageUrl: '',
        status: 'active'
      });
    }
  }, [existingItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (existingItem?.$id) {
        const updated = await updatePodItem(existingItem.$id, formData);
        onSuccess(updated);
      } else {
        const created = await createPodItem(formData);
        onSuccess(created);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/5 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-8">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-rose-500/20 to-orange-500/20 flex items-center justify-center border border-rose-500/20 mb-4">
            <Package className="h-6 w-6 text-rose-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">
            {existingItem ? 'Edit Merchandise Design' : 'Add Merchandise Design'}
          </h2>
          <p className="text-slate-400 mt-1 text-sm">
            Fill in the details for this print-on-demand item.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
            <input
              type="text"
              required
              value={formData.title || ''}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
              placeholder="e.g., Kennykentola Logo T-Shirt"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
            <textarea
              required
              value={formData.description || ''}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all min-h-[100px]"
              placeholder="Item description, materials, sizes available, etc."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
              <select
                value={formData.category || 't-shirt'}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
              >
                <option value="t-shirt">T-Shirt</option>
                <option value="mug">Mug</option>
                <option value="hoodie">Hoodie</option>
                <option value="sticker">Sticker</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Base Price (₦)</label>
              <input
                type="number"
                min="0"
                required
                value={formData.basePrice || 0}
                onChange={e => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Design Image</label>
            <div className="relative group cursor-pointer h-32 w-full rounded-xl border-2 border-dashed border-slate-700 bg-slate-900/50 hover:bg-slate-800/50 hover:border-rose-500/50 transition-all overflow-hidden flex items-center justify-center">
              {formData.imageUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={formData.imageUrl} alt="Preview" className="h-full w-full object-contain p-2" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-sm font-medium text-white flex items-center gap-2">
                      <Upload className="h-4 w-4" /> Change Image
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-center p-4">
                  <Upload className="h-6 w-6 text-slate-500 mx-auto mb-2" />
                  <span className="text-sm text-slate-400">Click to upload an image</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl font-medium bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white shadow-lg shadow-rose-500/25 transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Design'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
