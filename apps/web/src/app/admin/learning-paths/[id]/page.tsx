'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchLearningPathBySlug, fetchLearningPaths, createLearningPath, updateLearningPath, LearningPath, CurriculumModule } from '../../../../features/academy/learningPathsApi';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function EditLearningPath({ params }: { params: { id: string } }) {
  const router = useRouter();
  const isNew = params.id === 'new';
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<LearningPath>>({
    title: '', slug: '', description: '', iconName: 'Layout',
    color: 'from-indigo-500/20 to-transparent', borderColor: 'hover:border-indigo-500/50',
    duration: '', level: 'Beginner', prerequisites: '',
    technologies: [], careerOutcomes: []
  });

  const [curriculum, setCurriculum] = useState<CurriculumModule[]>([]);

  useEffect(() => {
    if (!isNew) {
      loadData();
    }
  }, [isNew, params.id]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      // We don't have a fetchById currently, so fetch all and find by ID
      const all = await fetchLearningPaths();
      const path = all.find(p => p.$id === params.id);
      if (!path) throw new Error('Path not found');

      setFormData(path);
      try {
        setCurriculum(JSON.parse(path.curriculum));
      } catch {
        setCurriculum([]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      const payload = {
        ...formData,
        curriculum: JSON.stringify(curriculum)
      };

      if (isNew) {
        await createLearningPath(payload);
        router.push('/admin/learning-paths');
      } else {
        await updateLearningPath(params.id, payload);
        alert('Saved successfully!');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const updateModule = (index: number, key: string, value: any) => {
    const newCurriculum = [...curriculum];
    newCurriculum[index] = { ...newCurriculum[index], [key]: value };
    setCurriculum(newCurriculum);
  };

  const addModule = () => {
    setCurriculum([...curriculum, { title: '', description: '', duration: '', topics: [] }]);
  };

  const removeModule = (index: number) => {
    setCurriculum(curriculum.filter((_, i) => i !== index));
  };

  const updateTopic = (modIndex: number, topicIndex: number, value: string) => {
    const newCurriculum = [...curriculum];
    newCurriculum[modIndex].topics[topicIndex] = value;
    setCurriculum(newCurriculum);
  };

  const addTopic = (modIndex: number) => {
    const newCurriculum = [...curriculum];
    newCurriculum[modIndex].topics.push('');
    setCurriculum(newCurriculum);
  };

  const removeTopic = (modIndex: number, topicIndex: number) => {
    const newCurriculum = [...curriculum];
    newCurriculum[modIndex].topics = newCurriculum[modIndex].topics.filter((_, i) => i !== topicIndex);
    setCurriculum(newCurriculum);
  };

  if (isLoading) return <div className="p-8 text-slate-400">Loading...</div>;

  return (
    <div className="space-y-6 max-w-4xl pb-24">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/admin/learning-paths" className="text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-white">{isNew ? 'Create Path' : 'Edit Path'}</h1>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          <Save className="w-5 h-5" /> {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
        <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-2">Basic Info</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Title</label>
            <input type="text" title="Title" placeholder="Enter path title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Slug (URL friendly)</label>
            <input type="text" title="Slug" placeholder="e.g. frontend-engineering" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-sm font-mono" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
            <textarea title="Description" placeholder="Enter path description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-sm" rows={3} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Icon Name (Lucide)</label>
            <input type="text" title="Icon Name" placeholder="e.g. Layout" value={formData.iconName} onChange={e => setFormData({ ...formData, iconName: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Level</label>
            <input type="text" title="Level" placeholder="e.g. Beginner" value={formData.level} onChange={e => setFormData({ ...formData, level: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Duration (e.g. 12 Weeks)</label>
            <input type="text" title="Duration" placeholder="e.g. 12 Weeks" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-sm" />
          </div>
        </div>
      </div>

      {/* Arrays */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
        <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-2">Tags & Arrays</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Technologies (comma separated)</label>
            <textarea 
              title="Technologies"
              placeholder="React, Node, etc."
              value={formData.technologies?.join(', ')} 
              onChange={e => setFormData({ ...formData, technologies: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} 
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-sm" rows={3} 
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Career Outcomes (comma separated)</label>
            <textarea 
              title="Career Outcomes"
              placeholder="Developer, Engineer, etc."
              value={formData.careerOutcomes?.join(', ')} 
              onChange={e => setFormData({ ...formData, careerOutcomes: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} 
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-sm" rows={3} 
            />
          </div>
        </div>
      </div>

      {/* Curriculum */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
          <h2 className="text-lg font-bold text-white">Curriculum Modules</h2>
          <button onClick={addModule} className="text-xs flex items-center gap-1 bg-indigo-600/20 text-indigo-400 px-3 py-1.5 rounded-lg hover:bg-indigo-600/40">
            <Plus className="w-3 h-3" /> Add Module
          </button>
        </div>

        <div className="space-y-8">
          {curriculum.map((mod, modIdx) => (
            <div key={modIdx} className="bg-slate-950 border border-slate-800 rounded-lg p-4 relative">
              <button title="Remove Module" aria-label="Remove Module" onClick={() => removeModule(modIdx)} className="absolute top-4 right-4 text-slate-500 hover:text-red-400">
                <Trash2 className="w-4 h-4" />
              </button>
              
              <div className="grid grid-cols-2 gap-4 mb-4 pr-8">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Module Title</label>
                  <input type="text" title="Module Title" placeholder="Module Title" value={mod.title} onChange={e => updateModule(modIdx, 'title', e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Duration</label>
                  <input type="text" title="Module Duration" placeholder="Module Duration" value={mod.duration} onChange={e => updateModule(modIdx, 'duration', e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-slate-500 mb-1">Description</label>
                  <input type="text" title="Module Description" placeholder="Module Description" value={mod.description} onChange={e => updateModule(modIdx, 'description', e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white text-sm" />
                </div>
              </div>

              {/* Topics */}
              <div className="pl-4 border-l-2 border-slate-800 space-y-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-400">Topics</span>
                  <button onClick={() => addTopic(modIdx)} className="text-[10px] uppercase tracking-wider text-emerald-400 hover:text-emerald-300">
                    + Add Topic
                  </button>
                </div>
                {mod.topics.map((topic, topicIdx) => (
                  <div key={topicIdx} className="flex gap-2">
                    <input 
                      type="text" 
                      title="Topic Name"
                      placeholder="Topic Name"
                      value={topic} 
                      onChange={e => updateTopic(modIdx, topicIdx, e.target.value)} 
                      className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white text-sm" 
                    />
                    <button title="Remove Topic" aria-label="Remove Topic" onClick={() => removeTopic(modIdx, topicIdx)} className="text-slate-500 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {curriculum.length === 0 && (
            <div className="text-center text-slate-500 py-4">No modules added yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
