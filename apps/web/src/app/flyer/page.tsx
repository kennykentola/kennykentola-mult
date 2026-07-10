import React from 'react';
import { Code2, GraduationCap, Bot, BookOpenText, Sun, Printer, MapPin, Phone, Globe } from 'lucide-react';

// This is a dedicated 1080x1080 pixel-perfect page designed to be screenshot and used as an Instagram/WhatsApp flyer!
export default function FlyerPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-8">
      
      {/* The Flyer Canvas - Exactly 1080x1080 for Instagram/WhatsApp Square */}
      <div 
        id="flyer-canvas"
        className="relative w-[1080px] h-[1080px] bg-slate-950 text-white overflow-hidden shadow-2xl ring-1 ring-white/10"
        style={{ aspectRatio: '1/1' }}
      >
        {/* Background Ambient Glows */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/30 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-600/20 blur-[120px] pointer-events-none" />
        <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] rounded-full bg-emerald-600/10 blur-[100px] pointer-events-none" />
        
        {/* Subtle Grid Overlay */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10 pointer-events-none"></div>

        <div className="relative h-full flex flex-col justify-between p-16 z-10">
          
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center font-bold text-2xl text-white shadow-lg shadow-indigo-500/30">
                  K
                </div>
                <span className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                  KennyKentola
                </span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/50 bg-indigo-500/10 px-5 py-2 text-sm font-bold text-indigo-300 tracking-widest uppercase">
                The Ultimate Tech Ecosystem
              </div>
            </div>
          </div>

          {/* Main Headline */}
          <div className="mt-8">
            <h1 className="text-7xl font-black tracking-tighter leading-[1.1]">
              Learn. Build.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400">
                Print. Power.
              </span>
            </h1>
            <p className="mt-6 text-2xl text-slate-300 font-medium max-w-2xl leading-relaxed">
              Your all-in-one partner for digital transformation, education, research, and clean energy.
            </p>
          </div>

          {/* 6 Pillars Grid */}
          <div className="grid grid-cols-2 gap-6 mt-12">
            
            {/* Pillar 1 */}
            <div className="flex items-start gap-5 p-6 rounded-3xl bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm">
              <div className="h-14 w-14 shrink-0 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30">
                <Code2 className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1.5">Custom Software Agency</h3>
                <p className="text-slate-400 leading-snug">Websites, Mobile Apps & Enterprise Tech Solutions.</p>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="flex items-start gap-5 p-6 rounded-3xl bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm">
              <div className="h-14 w-14 shrink-0 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
                <GraduationCap className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1.5">Programming Academy</h3>
                <p className="text-slate-400 leading-snug">Master highly-paid programming & design skills.</p>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="flex items-start gap-5 p-6 rounded-3xl bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm">
              <div className="h-14 w-14 shrink-0 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 border border-cyan-500/30">
                <Bot className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1.5">AI Tools & Prompts</h3>
                <p className="text-slate-400 leading-snug">Learn to write clean code & automate workflows with AI.</p>
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="flex items-start gap-5 p-6 rounded-3xl bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm">
              <div className="h-14 w-14 shrink-0 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400 border border-purple-500/30">
                <BookOpenText className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1.5">Academic & Thesis Guidance</h3>
                <p className="text-slate-400 leading-snug">Expert research assistance and project templates.</p>
              </div>
            </div>

            {/* Pillar 5 */}
            <div className="flex items-start gap-5 p-6 rounded-3xl bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm">
              <div className="h-14 w-14 shrink-0 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400 border border-amber-500/30">
                <Sun className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1.5">Solar & Electrical</h3>
                <p className="text-slate-400 leading-snug">Uninterrupted clean energy for homes & businesses.</p>
              </div>
            </div>

            {/* Pillar 6 */}
            <div className="flex items-start gap-5 p-6 rounded-3xl bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm">
              <div className="h-14 w-14 shrink-0 rounded-2xl bg-pink-500/20 flex items-center justify-center text-pink-400 border border-pink-500/30">
                <Printer className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1.5">Printing & Graphics</h3>
                <p className="text-slate-400 leading-snug">Premium branding, ID cards, and document binding.</p>
              </div>
            </div>

          </div>

          {/* Footer Contact Info */}
          <div className="mt-12 flex items-center justify-between pt-8 border-t border-slate-800">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2.5 text-lg font-semibold text-slate-300">
                <Globe className="h-5 w-5 text-indigo-400" />
                kennykentola.dpdns.org
              </div>
              <div className="flex items-center gap-2.5 text-lg font-semibold text-slate-300">
                <Phone className="h-5 w-5 text-emerald-400" />
                +234 816 357 1677
              </div>
            </div>
            <div className="flex items-center gap-2.5 text-lg font-semibold text-slate-300">
              <MapPin className="h-5 w-5 text-rose-400" />
              25 Elebu Rd, Moniya, Ibadan
            </div>
          </div>

        </div>
      </div>
      
      {/* Instructions for the User (Visible on screen, but outside the 1080x1080 box) */}
      <div className="ml-12 max-w-sm text-slate-400">
        <h2 className="text-white text-2xl font-bold mb-4">Your Custom Flyer is Ready!</h2>
        <p className="mb-4">
          This box on the left is exactly <strong>1080x1080 pixels</strong> (the perfect size for Instagram and WhatsApp).
        </p>
        <p className="mb-4">
          <strong>How to save it as a PNG:</strong><br/>
          1. Use a screenshot tool (like Snipping Tool on Windows or Cmd+Shift+4 on Mac).<br/>
          2. Snip exactly around the border of the 1080x1080 box.<br/>
          3. Save and share!
        </p>
        <p>
          Need changes to colors or text? Just ask!
        </p>
      </div>

    </div>
  );
}
