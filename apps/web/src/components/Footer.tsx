'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Loader2, Mail, Phone } from 'lucide-react';

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribing(true);
    // TODO: Connect to backend subscription endpoint
    setTimeout(() => {
      setSubscribing(false);
      setEmail('');
      alert('Successfully subscribed!');
    }, 1000);
  };

  return (
    <footer className="border-t border-white/5 bg-[#050505] pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-16">
          <div className="col-span-1 md:col-span-2 lg:col-span-2">
            <div className="text-xl font-bold text-white mb-6">KennyKentola Digital</div>
            <p className="text-slate-400 text-sm mb-6 max-w-sm">
              Stay Updated: Subscribe to receive project tips, research resources, tutorials, and technology updates.
            </p>
            <form onSubmit={handleSubscribe} className="flex items-center gap-2 mb-8">
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address" 
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500 flex-1 max-w-[200px]" 
              />
              <button 
                type="submit"
                disabled={subscribing}
                className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
              >
                {subscribing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Subscribe
              </button>
            </form>

            <div className="space-y-3 text-sm text-slate-400">
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <div className="flex flex-col">
                  <span>+2348163571677</span>
                  <span>+2349048082076</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <div className="flex flex-col break-all">
                  <a href="mailto:peterkehindeademola9@gmail.com" className="hover:text-amber-500 transition-colors">peterkehindeademola9@gmail.com</a>
                  <a href="mailto:peterkehindeademola@gmail.com" className="hover:text-amber-500 transition-colors">peterkehindeademola@gmail.com</a>
                  <a href="mailto:ademolapeter233@gmail.com" className="hover:text-amber-500 transition-colors">ademolapeter233@gmail.com</a>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-white mb-6">Company</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link href="/about" className="hover:text-amber-500 transition-colors">About Us</Link></li>
              <li><Link href="/p/our-experts" className="hover:text-amber-500 transition-colors">Our Experts</Link></li>
              <li><Link href="/p/careers" className="hover:text-amber-500 transition-colors">Careers</Link></li>
              <li><Link href="/blog" className="hover:text-amber-500 transition-colors">Blog</Link></li>
              <li><Link href="/help-center" className="hover:text-amber-500 transition-colors">Help Center</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6">Services</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link href="/p/academic-guidance" className="hover:text-amber-500 transition-colors">Academic Guidance</Link></li>
              <li><Link href="/p/software-development" className="hover:text-amber-500 transition-colors">Software Development</Link></li>
              <li><Link href="/p/research-assistance" className="hover:text-amber-500 transition-colors">Research Assistance</Link></li>
              <li><Link href="/dashboard/solar/new" className="hover:text-amber-500 transition-colors">Solar / Electrical</Link></li>
              <li><Link href="/printing" className="hover:text-amber-500 transition-colors">Printing & Graphics</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6">Resources</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link href="/p/project-ideas" className="hover:text-amber-500 transition-colors">Project Ideas</Link></li>
              <li><Link href="/p/templates" className="hover:text-amber-500 transition-colors">Templates</Link></li>
              <li><Link href="/p/tutorials" className="hover:text-amber-500 transition-colors">Tutorials</Link></li>
              <li><Link href="/faqs" className="hover:text-amber-500 transition-colors">FAQs</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/5 text-sm text-slate-500">
          <div>© {new Date().getFullYear()} KennyKentola Multi-Company Ecosystem. All rights reserved.</div>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/help-center" className="hover:text-white transition-colors">Help Center</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
