import React from 'react';
import { AIVideoGenerator } from '../../components/AIVideoGenerator';
import Link from 'next/link';

export const metadata = {
  title: 'AI Code Explanation Video Generator | KennyKentola',
  description: 'Generate code explanation videos automatically using Hugging Face AI',
};

export default function AIVideoPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white pt-24 pb-12 font-sans relative">
      <div className="absolute top-0 left-0 w-[40%] h-[40%] rounded-full bg-indigo-900/20 blur-[100px] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <Link href="/" className="inline-block mb-8 text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
          ← Back to Home
        </Link>
        
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">Video Generator</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl">
            Describe what you want to build or explain, and our AI will generate a dynamic coding video with a voiceover explanation—all rendered live in your browser using free open-source models!
          </p>
        </div>

        <AIVideoGenerator />
      </div>
    </div>
  );
}
