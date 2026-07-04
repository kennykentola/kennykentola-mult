'use client';

import React, { useState, useEffect } from 'react';
import { orchestratorService } from '../../../services/orchestratorService';
import { Bot, Image as ImageIcon, Send, Trash2, RefreshCw, Layers } from 'lucide-react';
import Image from 'next/image';

export default function OrchestratorPage() {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [assets, setAssets] = useState<any[]>([]);
  const [previewAsset, setPreviewAsset] = useState<any | null>(null);

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    const data = await orchestratorService.getAssets();
    setAssets(data);
  };

  const handleGenerate = async () => {
    if (!topic) return;
    setIsGenerating(true);
    try {
      const res = await orchestratorService.generateAsset(topic);
      setPreviewAsset(res.asset);
      await loadAssets(); // Refresh list to include the new preview
    } catch (err) {
      console.error(err);
      alert('Failed to generate. Ensure backend is running and API keys are set.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePost = async (id: string) => {
    try {
      await orchestratorService.postAsset(id);
      setPreviewAsset(null);
      await loadAssets();
      alert('Posted successfully! Zapier will pick it up via RSS.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;
    try {
      await orchestratorService.deleteAsset(id);
      if (previewAsset && previewAsset.$id === id) {
        setPreviewAsset(null);
      }
      await loadAssets();
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
          <h1 className="text-2xl font-bold text-white">AI Media Orchestrator</h1>
          <p className="text-slate-400 text-sm">Generate images and technical explanations for your blog.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Generation Studio */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Layers className="h-5 w-5 text-indigo-400" />
              Generation Studio
            </h2>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Enter a technology topic (e.g., 'Next.js App Router Architecture')"
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

          {/* Preview Section */}
          {previewAsset && (
            <div className="bg-slate-900/50 border border-indigo-500/30 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-purple-400" />
                Preview Result
              </h3>
              
              <div className="space-y-6">
                <div className="relative h-64 w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                  {previewAsset.imageUrl ? (
                    <Image src={previewAsset.imageUrl} alt="Generated" fill className="object-contain" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500">No Image</div>
                  )}
                </div>
                
                <div className="bg-slate-950 rounded-xl p-4 text-sm text-slate-300 border border-slate-800 h-48 overflow-y-auto whitespace-pre-wrap">
                  {previewAsset.contentText || 'No text generated.'}
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-slate-800">
                  <button
                    onClick={() => handlePost(previewAsset.$id)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="h-5 w-5" />
                    Approve & Post
                  </button>
                  <button
                    onClick={handleGenerate}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="h-5 w-5" />
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Asset Library */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 h-[800px] flex flex-col">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center justify-between">
            <span>Asset Library</span>
            <span className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded-full">{assets.length}</span>
          </h2>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {assets.map((asset) => (
              <div key={asset.$id} className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex gap-4 group">
                <div className="w-20 h-20 relative rounded-lg overflow-hidden bg-slate-900 flex-shrink-0">
                  {asset.imageUrl ? (
                    <Image src={asset.imageUrl} alt="Asset" fill className="object-cover" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-slate-700 m-auto mt-6" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      asset.status === 'published' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {asset.status}
                    </span>
                    <button 
                      onClick={() => handleDelete(asset.$id)}
                      className="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete Asset"
                      aria-label="Delete Asset"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">{asset.contentText}</p>
                  <p className="text-[10px] text-slate-600 mt-2 truncate">Providers: {asset.providerUsed}</p>
                </div>
              </div>
            ))}
            {assets.length === 0 && (
              <div className="text-center py-12 text-slate-500 text-sm">
                No assets generated yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
