'use client';

import React, { useState, useEffect } from 'react';
import { promptService } from '../../../services/promptService';
import { Bot, Trash2, RefreshCw, Layers, CheckCircle, XCircle } from 'lucide-react';

export default function AdminPromptsPage() {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompts, setPrompts] = useState<any[]>([]);

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    const data = await promptService.getPrompts();
    setPrompts(data);
  };

  const handleGenerate = async () => {
    if (!topic) return;
    setIsGenerating(true);
    try {
      await promptService.generatePrompt(topic);
      setTopic('');
      await loadPrompts();
    } catch (err) {
      console.error(err);
      alert('Failed to generate prompt. Ensure backend is running and API keys are set.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this prompt?')) return;
    try {
      await promptService.deletePrompt(id);
      await loadPrompts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      await promptService.togglePublish(id, currentStatus);
      await loadPrompts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-indigo-500/10 rounded-xl">
          <Bot className="h-6 w-6 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">AI Prompt Generator</h1>
          <p className="text-slate-400 text-sm">Generate educational AI coding prompts for the Learning Assistant.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Generation Studio */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Layers className="h-5 w-5 text-indigo-400" />
              Generate New Prompt
            </h2>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Enter a topic (e.g., 'React Hooks' or 'Python Data Structures')"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                disabled={isGenerating}
              />
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !topic}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Bot className="h-5 w-5" />}
                Generate
              </button>
            </div>
          </div>
        </div>

        {/* Existing Prompts */}
        <div className="lg:col-span-3">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 overflow-hidden">
            <h2 className="text-lg font-semibold text-white mb-6">Generated Prompts Library</h2>
            
            {prompts.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No prompts generated yet. Try generating one above.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {prompts.map((p) => (
                  <div key={p.$id} className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-semibold text-white">{p.title}</h3>
                          <span className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded bg-indigo-500/10 text-indigo-400">
                            {p.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">Generated on {new Date(p.$createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleTogglePublish(p.$id, p.isPublished)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            p.isPublished 
                              ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' 
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {p.isPublished ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                          {p.isPublished ? 'Published' : 'Draft'}
                        </button>
                        <button
                          onClick={() => handleDelete(p.$id)}
                          title="Delete Prompt"
                          aria-label="Delete Prompt"
                          className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Prompt Setup</h4>
                        <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-indigo-300">
                          {p.promptText}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">AI Explanation</h4>
                        <div className="bg-slate-900 rounded-lg p-4 text-sm text-slate-300 whitespace-pre-wrap">
                          {p.aiResponse}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
