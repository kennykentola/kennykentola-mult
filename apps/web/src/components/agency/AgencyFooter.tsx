'use client';
import Link from 'next/link';
import { Twitter, Linkedin, Github, Mail } from 'lucide-react';

export function AgencyFooter() {
  return (
    <footer className="bg-[#020202] pt-24 pb-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          <div className="lg:col-span-2">
            <Link href="/agency" className="text-2xl font-extrabold tracking-tighter text-white block mb-6">
              kennykentola<span className="text-indigo-500">.agency</span>
            </Link>
            <p className="text-slate-400 mb-8 max-w-sm">
              We engineer scalable enterprise software, mobile applications, and high-conversion SaaS platforms.
            </p>
            <div className="flex gap-4">
              <a href="#" title="Twitter" aria-label="Twitter" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all"><Twitter className="w-5 h-5" /></a>
              <a href="#" title="LinkedIn" aria-label="LinkedIn" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all"><Linkedin className="w-5 h-5" /></a>
              <a href="#" title="GitHub" aria-label="GitHub" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all"><Github className="w-5 h-5" /></a>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6">Services</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><Link href="#services" className="hover:text-indigo-400 transition-colors">Web Development</Link></li>
              <li><Link href="#services" className="hover:text-indigo-400 transition-colors">Mobile Apps</Link></li>
              <li><Link href="#services" className="hover:text-indigo-400 transition-colors">UI/UX Design</Link></li>
              <li><Link href="#services" className="hover:text-indigo-400 transition-colors">AI Integration</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><Link href="/about" className="hover:text-indigo-400 transition-colors">About Us</Link></li>
              <li><Link href="/careers" className="hover:text-indigo-400 transition-colors">Careers</Link></li>
              <li><Link href="#portfolio" className="hover:text-indigo-400 transition-colors">Portfolio</Link></li>
              <li><Link href="/contact" className="hover:text-indigo-400 transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Newsletter</h4>
            <p className="text-sm text-slate-400 mb-4">Get the latest insights in software engineering.</p>
            <form className="flex gap-2">
              <input title="Email Address" aria-label="Email Address" type="email" placeholder="Email address" className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-indigo-500 outline-none transition-colors" />
              <button title="Subscribe" aria-label="Subscribe" type="submit" className="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors">
                <Mail className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <div>&copy; {new Date().getFullYear()} KennyKentola Software Agency. All rights reserved.</div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
