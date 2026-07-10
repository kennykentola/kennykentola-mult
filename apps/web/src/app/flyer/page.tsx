import React from 'react';

// This is a dedicated 1080x1080 pixel-perfect page designed to be screenshot and used as an Instagram/WhatsApp flyer!
export default function FlyerPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-8">
      
      {/* The Flyer Canvas - Exactly 1080x1080 for Instagram/WhatsApp Square */}
      <div 
        id="flyer-canvas"
        className="relative w-[1080px] h-[1080px] bg-[#121b26] text-white overflow-hidden shadow-2xl ring-1 ring-white/10 flex flex-col font-sans"
        style={{ aspectRatio: '1/1' }}
      >
        {/* TOP HALF: Logo & Illustration */}
        <div className="relative h-[55%] w-full flex p-12 pb-0">
          {/* Subtle Background Glow */}
          <div className="absolute top-0 left-0 w-[80%] h-[80%] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
          
          {/* Left: Logo Area */}
          <div className="relative z-10 flex-1 pt-8">
            <div className="flex flex-col items-start gap-4 mb-4">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-[#38bdf8] to-[#818cf8] flex items-center justify-center font-bold text-5xl text-white shadow-[0_0_30px_rgba(56,189,248,0.4)]">
                K
              </div>
              <span className="text-5xl font-black tracking-widest text-white uppercase drop-shadow-lg">
                KennyKentola
              </span>
            </div>
            <div className="flex items-center gap-4 text-[#94a3b8]">
              <div className="h-[1px] w-8 bg-[#94a3b8]"></div>
              <span className="text-2xl tracking-wide font-light">Tech Skills for Tomorrow</span>
              <div className="h-[1px] w-8 bg-[#94a3b8]"></div>
            </div>
          </div>

          {/* Right: Illustration Placeholder */}
          <div className="relative z-10 flex-1 flex items-end justify-center">
             {/* You can replace this div with: <img src="/your-3d-image.png" className="w-full h-auto object-contain" /> */}
             <div className="w-[110%] h-[110%] bg-gradient-to-t from-cyan-500/20 to-transparent rounded-t-full border border-cyan-500/30 flex items-center justify-center text-cyan-200/50 text-center p-8 backdrop-blur-sm border-b-0 translate-y-8">
               [ Insert 3D Illustration Here ]<br/><br/>
               Save the image you generated as "illustration.png" in the "public" folder, and replace this box with an &lt;img&gt; tag!
             </div>
          </div>
        </div>

        {/* BOTTOM HALF: 6 Cards & Footer */}
        <div className="relative h-[45%] w-full bg-[#1e293b]/50 backdrop-blur-xl border-t border-white/10 px-10 pt-10 pb-8 flex flex-col justify-between">
          
          {/* 6 Pillars Grid (3 columns, 2 rows) */}
          <div className="grid grid-cols-3 gap-6">
            
            {/* Card 1 */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
              <h3 className="text-2xl font-bold text-white mb-2 leading-tight">Custom Software<br/>Agency</h3>
              <p className="text-[#cbd5e1] text-[15px] leading-snug">Websites, Mobile Apps & Enterprise Tech Solutions.</p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
              <h3 className="text-2xl font-bold text-white mb-2 leading-tight">Programming<br/>Academy</h3>
              <p className="text-[#cbd5e1] text-[15px] leading-snug">Master highly-paid programming & design skills.</p>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
              <h3 className="text-2xl font-bold text-white mb-2 leading-tight">AI Tools &<br/>Prompts</h3>
              <p className="text-[#cbd5e1] text-[15px] leading-snug">Learn to write clean code & automate workflows with AI.</p>
            </div>

            {/* Card 4 */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
              <h3 className="text-2xl font-bold text-white mb-2 leading-tight">Academic Thesis<br/>Guidance</h3>
              <p className="text-[#cbd5e1] text-[15px] leading-snug">Expert research assistance and project templates.</p>
            </div>

            {/* Card 5 */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
              <h3 className="text-2xl font-bold text-white mb-2 leading-tight">Solar &<br/>Electrical</h3>
              <p className="text-[#cbd5e1] text-[15px] leading-snug">Uninterrupted clean energy for homes & businesses.</p>
            </div>

            {/* Card 6 */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
              <h3 className="text-2xl font-bold text-white mb-2 leading-tight">Printing &<br/>Graphics</h3>
              <p className="text-[#cbd5e1] text-[15px] leading-snug">Premium branding, ID cards, and document binding.</p>
            </div>

          </div>

          {/* Footer Contact Info */}
          <div className="mt-8 flex items-end justify-between border-t border-white/10 pt-6">
            <div className="flex flex-col gap-1">
              <span className="font-bold text-white text-[15px]">Website:</span>
              <span className="text-[#cbd5e1] text-[15px]">kennykentola.dpdns.org</span>
            </div>
            
            <div className="flex flex-col gap-1 text-center">
              <span className="font-bold text-white text-[15px]">Email:</span>
              <span className="text-[#cbd5e1] text-[14px]">peterkehindeademola9@gmail.com<br/>peterkehindeademola@gmail.com<br/>ademolapeter233@gmail.com</span>
            </div>

            <div className="flex flex-col gap-1 text-right">
              <span className="text-white text-[15px]"><span className="font-bold">Phone:</span> +234 816 357 1677</span>
              <span className="text-white text-[15px]"><span className="font-bold">Location:</span> House 25, Elebu Rd,<br/>Moniya, Ibadan</span>
            </div>
          </div>

        </div>
      </div>
      
      {/* Instructions for the User (Visible on screen, but outside the 1080x1080 box) */}
      <div className="ml-12 max-w-sm text-slate-400">
        <h2 className="text-white text-2xl font-bold mb-4">Your Custom Flyer is Ready!</h2>
        <p className="mb-4">
          I have updated the code to perfectly match the layout of the PNG you provided! It has a 3-column layout at the bottom and the exact colors.
        </p>
        <p className="mb-4 text-emerald-400">
          <strong>Next Step:</strong> Save the 3D illustration from your AI generator, name it <code>illustration.png</code>, put it inside <code>apps/web/public/</code>, and replace the placeholder in the code with an image tag!
        </p>
      </div>

    </div>
  );
}
