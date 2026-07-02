import React from 'react';
import { Navbar } from '../../components/Navbar';
import Link from 'next/link';
import { 
  PenTool, 
  Layers, 
  MonitorPlay, 
  Image as ImageIcon, 
  Star, 
  CheckCircle,
  Briefcase,
  Monitor,
  Printer,
  ChevronRight
} from 'lucide-react';

async function getDesignPortfolio() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/design-portfolio`, {
      cache: 'no-store'
    });
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  } catch (error) {
    console.error('Error fetching design portfolio:', error);
    return [];
  }
}

export default async function DesignLandingPage() {
  const portfolioItems = await getDesignPortfolio();

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 lg:px-12 pt-20 pb-32">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider mb-6">
            <PenTool className="w-4 h-4" />
            kennykentola-digital Designs
          </div>
          <h1 className="text-5xl lg:text-7xl font-black tracking-tight text-white leading-[1.1] mb-6">
            Your One-Stop <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-500">
              Creative Hub.
            </span>
          </h1>
          <p className="text-xl text-slate-400 mb-8">
            We deliver clean, modern, and high-quality designs that help your brand stand out. From premium graphic design solutions to high-fidelity printing.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/printing"
              className="w-full sm:w-auto h-12 px-8 flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-400 text-black font-bold rounded-xl transition-colors"
            >
              Place Your Order
              <ChevronRight className="w-5 h-5" />
            </Link>
            <a 
              href="#portfolio"
              className="w-full sm:w-auto h-12 px-8 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 transition-colors"
            >
              View Our Work
            </a>
          </div>
        </div>

        {/* Services Grid */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">We Specialize In</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Elevate your brand with our comprehensive suite of design and printing services.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Layers />, title: "Flyers & Posters", desc: "Eye-catching promotional materials for any event or campaign." },
              { icon: <Star />, title: "Social Media Designs", desc: "Engaging graphics optimized for Instagram, Twitter, and Facebook." },
              { icon: <Briefcase />, title: "Logos & Brand Identity", desc: "Memorable visual identities that tell your company's story." },
              { icon: <Printer />, title: "Bulk Photocopying & Printing", desc: "High-speed document photocopying, binding, and premium business cards." },
              { icon: <ImageIcon />, title: "Banners & Signage", desc: "Large-format designs and prints for physical storefronts and exhibitions." },
              { icon: <Star />, title: "Event Graphics", desc: "Cohesive visual themes for conferences, parties, and corporate events." },
              { icon: <Monitor />, title: "Website Design", desc: "Stunning, high-converting UI/UX design for web platforms." },
              { icon: <MonitorPlay />, title: "Motion Graphics", desc: "Dynamic animations to bring your brand assets to life." },
            ].map((service, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-rose-500/30 transition-colors group cursor-default">
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4 text-rose-400 group-hover:scale-110 transition-transform">
                  {service.icon}
                </div>
                <h3 className="font-bold text-white mb-2">{service.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Portfolio / Showcase Area */}
        <div id="portfolio" className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Portfolio Showcase</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">A glimpse into the digital and physical assets we've crafted for our clients.</p>
          </div>

          {portfolioItems.length === 0 ? (
            <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl">
              <p className="text-slate-400">Portfolio showcase is empty. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {portfolioItems.map((item: any) => (
                <div key={item.$id} className="group relative aspect-square rounded-3xl overflow-hidden bg-white/5 border border-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <h4 className="text-white font-bold text-lg">{item.title}</h4>
                    {item.subtitle && <p className="text-rose-400 text-sm">{item.subtitle}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Call to Action & Info */}
        <div className="relative overflow-hidden bg-[#0A0A0A] rounded-[2rem] border border-white/10 p-8 md:p-12 text-center shadow-2xl">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-2xl bg-rose-500/10 blur-[100px] pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-6">Ready to elevate your brand?</h2>
            <p className="text-slate-400 mb-8">
              Follow us on our social media platforms to get design updates, exclusive offers & discounts, design tips, and easy access to place your orders. Send a message and let's create something amazing together.
            </p>
            
            <Link 
              href="/printing"
              className="inline-flex items-center justify-center gap-2 h-14 px-8 bg-rose-500 hover:bg-rose-400 text-black font-black rounded-xl transition-colors shadow-[0_0_40px_rgba(244,63,94,0.3)] hover:shadow-[0_0_60px_rgba(244,63,94,0.5)]"
            >
              Start Your Design Project
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}
