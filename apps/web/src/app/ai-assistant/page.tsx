'use client';

import React, { useEffect, useState } from 'react';
import { promptService } from '../../services/promptService';
import { Bot, Sparkles, TerminalSquare, Search, Copy, CheckCircle2 } from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import Link from 'next/link';

export default function AIAssistantPage() {
  const [prompts, setPrompts] = useState<any[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    // Pass true to get only published prompts
    const data = await promptService.getPrompts(true);
    setPrompts(data);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredPrompts = prompts.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-indigo-500/30">
      <Navbar />
      
      <main className="relative pt-32 pb-20 overflow-hidden">
        {/* Decorative Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] opacity-70 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-rose-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 text-center pt-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-slate-800 text-indigo-400 font-semibold text-sm mb-8 backdrop-blur-sm shadow-xl shadow-indigo-900/10">
            <Sparkles className="h-4 w-4" />
            AI Learning Assistant
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-indigo-200 tracking-tight leading-[1.1] mb-8">
            Master AI Prompt<br />
            <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Engineering</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Receive instant explanations and learn how to communicate with AI effectively. We use advanced AI to not just give answers, but to teach our students the underlying concepts.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="/register" 
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5"
            >
              Start Learning Free
            </Link>
            <a 
              href="#examples" 
              className="px-8 py-4 bg-slate-900 border border-slate-800 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
              View Prompt Examples
            </a>
          </div>
        </div>
      </section>

      {/* Showcase Library */}
      <section id="examples" className="py-24 bg-slate-950 relative border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">Prompt Library</h2>
              <p className="text-slate-400 max-w-xl">
                Explore our curated collection of high-quality prompts. Discover how specific framing changes the AI's output from generic to deeply educational.
              </p>
            </div>
            
            <div className="relative w-full md:w-72 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type="text"
                placeholder="Search prompts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {filteredPrompts.length === 0 ? (
            <div className="text-center py-24 bg-slate-900/30 rounded-3xl border border-slate-800/50 backdrop-blur-sm">
              <Bot className="h-16 w-16 mx-auto mb-4 text-slate-700" />
              <h3 className="text-xl font-bold text-white mb-2">No Prompts Found</h3>
              <p className="text-slate-500">We couldn't find any prompts matching your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {filteredPrompts.map((p) => (
                <div key={p.$id} className="group rounded-3xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-sm overflow-hidden hover:border-indigo-500/50 transition-all duration-300 shadow-xl shadow-black/20 flex flex-col h-full">
                  
                  {/* Header */}
                  <div className="p-6 md:p-8 border-b border-slate-800/80">
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {p.title}
                      </h3>
                      <span className="shrink-0 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 rounded-full border border-indigo-500/20">
                        {p.category}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 md:p-8 flex-1 flex flex-col gap-6">
                    {/* Prompt Box */}
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-3">
                        <TerminalSquare className="h-4 w-4 text-indigo-400" />
                        <span className="text-sm font-semibold text-slate-300 uppercase tracking-wide">The Prompt</span>
                      </div>
                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 text-indigo-200/90 font-mono text-sm leading-relaxed relative group/code">
                        {p.promptText}
                        <button
                          onClick={() => handleCopy(p.$id, p.promptText)}
                          className="absolute top-4 right-4 p-2 bg-slate-800/80 hover:bg-indigo-600 text-slate-400 hover:text-white rounded-lg backdrop-blur-md opacity-0 group-hover/code:opacity-100 transition-all shadow-lg"
                          aria-label="Copy prompt"
                        >
                          {copiedId === p.$id ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* AI Response Box */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Bot className="h-4 w-4 text-emerald-400" />
                        <span className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Why it works (AI Explanation)</span>
                      </div>
                      <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-5 text-slate-300 text-sm leading-relaxed h-full">
                        {p.aiResponse}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
