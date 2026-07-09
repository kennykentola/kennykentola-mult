import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '../../../components/Navbar';
import { footerPagesData } from '../../../data/footerPages';
import { ArrowRight } from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const pageData = footerPagesData[resolvedParams.slug];
  if (!pageData) {
    return { title: 'Page Not Found' };
  }
  return {
    title: `${pageData.title} — KennyKentola Digital`,
    description: pageData.subtitle,
  };
}

export default async function DynamicFooterPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const pageData = footerPagesData[resolvedParams.slug];

  if (!pageData) {
    notFound();
  }

  let content = pageData.content;

  if (resolvedParams.slug === 'project-ideas') {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}` + `/academic-ideas`, { cache: 'no-store' });
      if (res.ok) {
        const dynamicIdeas = await res.json();
        if (dynamicIdeas && dynamicIdeas.length > 0) {
          content = dynamicIdeas.map((idea: any) => ({
            heading: idea.title,
            body: idea.description
          }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch dynamic project ideas', err);
    }
  }

  const Icon = pageData.icon;

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 lg:px-12 pt-32 pb-24">
        <div className="flex flex-col items-center text-center mb-16">
          <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-8">
            <Icon className="w-10 h-10 text-amber-500" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
            {pageData.title}
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            {pageData.subtitle}
          </p>
        </div>

        <div className="space-y-12">
          {content.map((section: any, idx: number) => (
            <div key={idx} className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12">
              <h2 className="text-2xl font-bold text-white mb-4">{section.heading}</h2>
              <p className="text-slate-300 leading-relaxed text-lg whitespace-pre-wrap">
                {section.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link 
            href={pageData.ctaLink}
            className="inline-flex items-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold transition-all hover:scale-105"
          >
            {pageData.ctaText}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </main>
    </div>
  );
}
