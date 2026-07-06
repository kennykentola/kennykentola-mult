'use client';

import React, { useState } from 'react';
import { X, Sparkles, Loader2, Image as ImageIcon, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { generateAIImage } from '../../features/ai/aiService';

interface AIImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (url: string) => void;
}

export const AIImageModal: React.FC<AIImageModalProps> = ({ isOpen, onClose, onInsert }) => {
  const [prompt, setPrompt] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a description for the image');
      return;
    }

    setLoading(true);
    try {
      const result = await generateAIImage(prompt);
      setGeneratedUrl(result.url);
      toast.success('Image generated successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate image');
    } finally {
      setLoading(false);
    }
  };

  const handleInsert = () => {
    if (generatedUrl) {
      onInsert(generatedUrl);
      onClose();
      // Reset state for next time
      setTimeout(() => {
        setPrompt('');
        setGeneratedUrl('');
      }, 300);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-indigo-400">
            <Sparkles className="w-5 h-5" />
            <h3 className="font-bold">Generate AI Image</h3>
          </div>
          <button 
            onClick={onClose}
            title="Close"
            className="p-1 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              Describe the image you want to generate
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-indigo-500 outline-none resize-none h-24"
              placeholder="e.g. A futuristic learning management system interface on a transparent glass screen with neon blue accents"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating... (This may take a minute)
                </>
              ) : (
                <>
                  <ImageIcon className="w-5 h-5" />
                  Generate Image
                </>
              )}
            </button>
          </div>

          {generatedUrl && (
            <div className="mt-6 border-t border-slate-800 pt-6">
              <h4 className="text-sm font-bold text-slate-300 mb-4">Generated Result</h4>
              <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 aspect-video">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={generatedUrl} 
                  alt={prompt} 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}
        </div>

        {generatedUrl && (
          <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3">
            <button
              onClick={handleInsert}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all"
            >
              <Check className="w-5 h-5" />
              Insert Image
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
