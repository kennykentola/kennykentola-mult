import Link from 'next/link';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SearchX, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="relative min-h-screen bg-[#050505] font-sans text-slate-200 flex flex-col">
      <Navbar />

      <main className="flex-grow flex flex-col items-center justify-center px-6 text-center py-24 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 space-y-6 max-w-2xl mx-auto flex flex-col items-center">
          <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center shadow-2xl mb-4 shadow-indigo-500/10">
            <SearchX className="w-12 h-12 text-indigo-400" />
          </div>
          
          <h1 className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-600 tracking-tighter">
            404
          </h1>
          
          <div className="space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold text-white">Page not found</h2>
            <p className="text-slate-400 text-lg">
              Sorry, the page you are looking for doesn't exist or has been moved.
            </p>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row gap-4">
            <Link 
              href="/"
              className="flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-all"
            >
              <Home className="w-5 h-5" />
              Back to Home
            </Link>
            <button 
              onClick={() => window.history.back()}
              className="flex items-center justify-center gap-2 px-8 py-3.5 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
