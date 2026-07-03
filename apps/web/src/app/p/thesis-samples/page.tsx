import React from 'react';
import { Navbar } from '../../../components/Navbar';
import { FileText } from 'lucide-react';
import { notFound } from 'next/navigation';
import { SecureViewer } from '../../../components/SecureViewer';

async function getThesisSamples() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/thesis-samples`, {
      cache: 'no-store'
    });
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  } catch (error) {
    console.error('Error fetching thesis samples:', error);
    return [];
  }
}

export const metadata = {
  title: 'Thesis Samples - KennyKentola Digital',
  description: 'Read academic project and thesis samples. Content is read-only and copyright protected.',
};

export default async function ThesisSamplesPage() {
  const samples = await getThesisSamples();

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 lg:px-12 pt-32 pb-24">
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 mb-6">
            <FileText className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-sky-300">Academic Write-ups</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Thesis <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">Samples</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Browse through our curated collection of academic thesis and project write-ups.
          </p>
          <p className="mt-4 text-xs font-semibold text-rose-400 border border-rose-500/20 bg-rose-500/10 px-4 py-2 rounded-lg inline-block">
            Note: All content is copyright protected and provided for reading purposes only.
          </p>
        </div>

        {samples.length === 0 ? (
          <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl">
            <p className="text-slate-400">No thesis samples available at the moment.</p>
          </div>
        ) : (
          <div className="space-y-16">
            {samples.map((item: any) => (
              <div key={item.$id} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="bg-slate-950 px-8 py-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">{item.title}</h2>
                    {item.category && (
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {item.category}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* 
                  Copy Protection Applied Here via SecureViewer component 
                */}
                <SecureViewer>
                  <div 
                    className="p-8 md:p-12 prose prose-invert prose-slate max-w-none"
                    dangerouslySetInnerHTML={{ __html: item.content }}
                  />
                </SecureViewer>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
