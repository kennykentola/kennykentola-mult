'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBlogPost, updateBlogPost } from '../../features/blog/blogService';
import { uploadBlogImage } from '../../features/blog/blogService';
import { FileCheck, Loader2, ArrowLeft, Save, Sparkles, Image as ImageIcon, Upload } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { AIAssistantModal } from '../ai/AIAssistantModal';

interface BlogEditorProps {
  initialData?: any;
  isEdit?: boolean;
}

export function BlogEditor({ initialData, isEdit }: BlogEditorProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingInline, setUploadingInline] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'General',
    excerpt: '',
    content: '',
    authorName: 'KennyKentola Admin',
    isPublished: false,
    coverImageId: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        slug: initialData.slug || '',
        category: initialData.category || 'General',
        excerpt: initialData.excerpt || '',
        content: initialData.content || '',
        authorName: initialData.authorName || 'KennyKentola Admin',
        isPublished: initialData.isPublished || false,
        coverImageId: initialData.coverImageId || ''
      });
    }
  }, [initialData]);

  const generateSlug = (text: string) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setFormData(prev => ({
      ...prev,
      title: newTitle,
      // Auto-generate slug if it's not edit mode or slug is currently empty
      slug: (!isEdit || !prev.slug) ? generateSlug(newTitle) : prev.slug
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      toast.error('Title and content are required');
      return;
    }

    setSaving(true);
    try {
      if (isEdit && initialData?.$id) {
        await updateBlogPost(initialData.$id, formData);
        toast.success('Post updated successfully');
      } else {
        await createBlogPost(formData);
        toast.success('Post created successfully');
      }
      router.push('/admin/blog');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'inline') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'cover') setUploadingCover(true);
    else setUploadingInline(true);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          const res = await uploadBlogImage(base64Data);
          
          if (type === 'cover') {
            setFormData(prev => ({ ...prev, coverImageId: res.url }));
            toast.success('Cover image uploaded');
          } else {
            const markdownImage = `\n![Image](${res.url})\n`;
            setFormData(prev => ({ ...prev, content: prev.content + markdownImage }));
            toast.success('Image inserted into content');
          }
        } catch (err: any) {
          toast.error(err.message || 'Upload failed');
        } finally {
          if (type === 'cover') setUploadingCover(false);
          else setUploadingInline(false);
        }
      };
    } catch (err) {
      toast.error('Failed to process image');
      if (type === 'cover') setUploadingCover(false);
      else setUploadingInline(false);
    }
  };

  return (
    <div className="p-6 lg:p-12 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <Link href="/admin/blog" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Blog Manager
        </Link>
        
        <h1 className="text-3xl font-black text-white mb-8 flex items-center gap-3">
          <FileCheck className="w-8 h-8 text-orange-400" />
          {isEdit ? 'Edit Post' : 'New Post'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="glass-panel border border-white/5 rounded-3xl p-6 md:p-8 bg-slate-900/30">
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="col-span-2">
                <label className="block text-sm font-bold text-slate-300 mb-2">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleTitleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-orange-500 outline-none"
                  placeholder="e.g. How to Choose a Final Year Project"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Slug</label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-orange-500 outline-none"
                  placeholder="e.g. how-to-choose-project"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-bold text-slate-300 mb-2">Category</label>
                <select
                  id="category"
                  title="Category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-orange-500 outline-none"
                >
                  <option value="Academic Guidance">Academic Guidance</option>
                  <option value="Software Development">Software Development</option>
                  <option value="Documentation">Documentation</option>
                  <option value="General">General</option>
                  <option value="Tech News">Tech News</option>
                </select>
              </div>

              <div>
                <label htmlFor="authorName" className="block text-sm font-bold text-slate-300 mb-2">Author Name</label>
                <input
                  id="authorName"
                  title="Author Name"
                  placeholder="Author Name"
                  type="text"
                  required
                  value={formData.authorName}
                  onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-orange-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-8">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="w-5 h-5 rounded border-slate-800 bg-slate-950 text-orange-500 focus:ring-orange-500"
                />
                <label htmlFor="isPublished" className="text-sm font-bold text-white">Publish this post</label>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-bold text-slate-300 mb-2">Cover Image URL</label>
                <div className="flex flex-col md:flex-row gap-4 md:items-start">
                  <input
                    type="text"
                    value={formData.coverImageId}
                    onChange={(e) => setFormData({ ...formData, coverImageId: e.target.value })}
                    className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-orange-500 outline-none"
                    placeholder="https://..."
                  />
                  <div className="relative w-full md:w-auto">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'cover')}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={uploadingCover}
                      title="Upload Cover Image"
                    />
                    <button
                      type="button"
                      disabled={uploadingCover}
                      className="flex items-center justify-center w-full md:w-auto gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all disabled:opacity-50"
                    >
                      {uploadingCover ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                      Upload Cover
                    </button>
                  </div>
                </div>
                {formData.coverImageId && (
                  <img src={formData.coverImageId} alt="Cover Preview" className="mt-4 h-48 w-full object-cover rounded-xl border border-slate-800" />
                )}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-300 mb-2">Excerpt (Brief summary)</label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-orange-500 outline-none resize-none h-24"
                placeholder="A short description of the post..."
              />
            </div>

            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-4">
                <label className="block text-sm font-bold text-slate-300">Content (HTML or Markdown supported)</label>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-initial">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'inline')}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={uploadingInline}
                      title="Insert Inline Image"
                    />
                    <button
                      type="button"
                      disabled={uploadingInline}
                      className="flex items-center justify-center w-full sm:w-auto gap-2 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-lg transition-colors border border-slate-700"
                    >
                      {uploadingInline ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                      Insert Image
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAIModalOpen(true)}
                    className="flex items-center justify-center flex-1 sm:flex-initial gap-2 px-4 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-sm font-semibold rounded-lg transition-colors border border-indigo-500/20"
                  >
                    <Sparkles className="w-4 h-4" />
                    Write with AI
                  </button>
                </div>
              </div>
              <textarea
                required
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-orange-500 outline-none font-mono text-sm min-h-[400px]"
                placeholder="Write your article content here..."
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {saving ? 'Saving...' : 'Save Post'}
              </button>
            </div>
          </div>
        </form>
      </div>
      <AIAssistantModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        type="blog"
        onInsert={(content) => setFormData(prev => ({ ...prev, content: prev.content ? prev.content + '\n\n' + content : content }))}
      />
    </div>
  );
}
