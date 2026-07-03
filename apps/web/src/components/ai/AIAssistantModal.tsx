'use client';

import React, { useState } from 'react';
import { X, Sparkles, Loader2, Wand2, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { generateContent } from '../../features/ai/aiService';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (content: string) => void;
  type: 'blog' | 'newsletter';
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ isOpen, onClose, onInsert, type }) => {
  const [topic, setTopic] = useState('');
  const [instructions, setInstructions] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setLoading(true);
    try {
      const result = await generateContent(topic, type, instructions);
      setGeneratedContent(result);
      toast.success('Content generated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate content');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800/60 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                AI Writer
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold">
                  {type === 'blog' ? 'Blog Post' : 'Newsletter'}
                </span>
              </h2>
              <p className="text-sm text-slate-400">Generate high-quality content on any topic</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            title="Close"
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-6">
          
          {/* Controls Sidebar */}
          <div className="w-full lg:w-1/3 flex flex-col gap-5">
            <div>
              <label htmlFor="topic" className="block text-sm font-semibold text-slate-300 mb-2">
                What should we write about?
              </label>
              <input
                id="topic"
                type="text"
                placeholder={type === 'blog' ? 'e.g., The Future of Remote Learning' : 'e.g., Monthly Platform Updates'}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            
            <div>
              <label htmlFor="instructions" className="block text-sm font-semibold text-slate-300 mb-2">
                Additional Instructions (Optional)
              </label>
              <textarea
                id="instructions"
                placeholder="e.g., Make the tone enthusiastic and include 3 bullet points."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !topic.trim()}
              className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  Generate {type === 'blog' ? 'Post' : 'Draft'}
                </>
              )}
            </button>
          </div>

          {/* Preview Area */}
          <div className="w-full lg:w-2/3 flex flex-col">
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Generated Preview
            </label>
            <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4 min-h-[300px] overflow-y-auto">
              {generatedContent ? (
                <div 
                  className="prose prose-invert max-w-none text-slate-300"
                  dangerouslySetInnerHTML={{ __html: type === 'newsletter' ? generatedContent : generatedContent.replace(/\n/g, '<br />') }}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center">
                  <Sparkles className="w-8 h-8 mb-3 opacity-20" />
                  <p>Your generated content will appear here.</p>
                  <p className="text-sm mt-1">Fill out the topic and click generate to start.</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onInsert(generatedContent);
                  onClose();
                }}
                disabled={!generatedContent || loading}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Insert Content
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
