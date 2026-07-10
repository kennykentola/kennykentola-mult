'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { requestAcademicProject } from '../../../../features/academic/academicService';
import toast from 'react-hot-toast';
import { Loader2, ArrowLeft, Lightbulb, Code, UserCheck, CheckCircle2, GraduationCap, UploadCloud } from 'lucide-react';
import Link from 'next/link';

type RequestType = 'Topic Selection' | 'Proposal Development' | 'Chapter Assistance' | 'Full Implementation';

export default function RequestAcademicProjectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultType = searchParams?.get('type');

  const [loading, setLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [initialDocumentUrl, setInitialDocumentUrl] = useState('');
  const [requestType, setRequestType] = useState<RequestType | null>(
    (defaultType === 'topic' ? 'Topic Selection' : 
     defaultType === 'proposal' ? 'Proposal Development' : 
     defaultType === 'chapters' ? 'Chapter Assistance' : 
     defaultType === 'implementation' ? 'Full Implementation' : null)
  );

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    universityName: '',
    department: '',
    degree: 'BSc',
    level: 'Final Year',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestType) return toast.error('Please select what you need help with first.');
    
    try {
      setLoading(true);
      await requestAcademicProject({
        ...formData,
        serviceScope: requestType,
        title: requestType === 'Topic Selection' ? `Topic Selection Request - ${formData.department}` : formData.title,
        initialDocumentUrl,
      });
      toast.success('Request submitted successfully!');
      router.push('/dashboard/academic');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 p-6">
      <Link href="/dashboard/academic" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      <div className="bg-slate-900 border border-white/10 rounded-[3rem] p-8 md:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[100px] pointer-events-none" />
        
        <div className="flex items-center gap-4 mb-10 relative z-10">
          <div className="h-16 w-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <GraduationCap className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white">Start Your Project</h1>
            <p className="text-slate-400 mt-1">Tell us exactly what you need, and we'll connect you with the right expert.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
          
          {/* STEP 1: SELECT SERVICE */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-4">Step 1: What do you need help with?</h3>
            <div className="grid md:grid-cols-2 gap-4">
              
              <div 
                onClick={() => setRequestType('Topic Selection')}
                className={`cursor-pointer rounded-2xl border-2 p-6 transition-all ${requestType === 'Topic Selection' ? 'border-amber-500 bg-amber-500/10' : 'border-white/5 bg-white/5 hover:border-white/20'}`}
              >
                <Lightbulb className={`w-8 h-8 mb-4 ${requestType === 'Topic Selection' ? 'text-amber-500' : 'text-slate-400'}`} />
                <h4 className="font-bold text-white mb-2">Topic Selection</h4>
                <p className="text-sm text-slate-400">Need help choosing a project topic? Request Topic.</p>
                {requestType === 'Topic Selection' && <CheckCircle2 className="absolute top-4 right-4 text-amber-500 w-5 h-5" />}
              </div>

              <div 
                onClick={() => setRequestType('Proposal Development')}
                className={`cursor-pointer rounded-2xl border-2 p-6 transition-all ${requestType === 'Proposal Development' ? 'border-amber-500 bg-amber-500/10' : 'border-white/5 bg-white/5 hover:border-white/20'}`}
              >
                <UploadCloud className={`w-8 h-8 mb-4 ${requestType === 'Proposal Development' ? 'text-amber-500' : 'text-slate-400'}`} />
                <h4 className="font-bold text-white mb-2">Proposal Development</h4>
                <p className="text-sm text-slate-400">Already have a topic? Upload your proposal or request professional guidance.</p>
                {requestType === 'Proposal Development' && <CheckCircle2 className="absolute top-4 right-4 text-amber-500 w-5 h-5" />}
              </div>
              
              <div 
                onClick={() => setRequestType('Chapter Assistance')}
                className={`cursor-pointer rounded-2xl border-2 p-6 transition-all ${requestType === 'Chapter Assistance' ? 'border-amber-500 bg-amber-500/10' : 'border-white/5 bg-white/5 hover:border-white/20'}`}
              >
                <UserCheck className={`w-8 h-8 mb-4 ${requestType === 'Chapter Assistance' ? 'text-amber-500' : 'text-slate-400'}`} />
                <h4 className="font-bold text-white mb-2">Chapter Assistance</h4>
                <p className="text-sm text-slate-400">Receive guidance for Chapters One to Five.</p>
                {requestType === 'Chapter Assistance' && <CheckCircle2 className="absolute top-4 right-4 text-amber-500 w-5 h-5" />}
              </div>

              <div 
                onClick={() => setRequestType('Full Implementation')}
                className={`cursor-pointer rounded-2xl border-2 p-6 transition-all ${requestType === 'Full Implementation' ? 'border-amber-500 bg-amber-500/10' : 'border-white/5 bg-white/5 hover:border-white/20'}`}
              >
                <Code className={`w-8 h-8 mb-4 ${requestType === 'Full Implementation' ? 'text-amber-500' : 'text-slate-400'}`} />
                <h4 className="font-bold text-white mb-2">Full Implementation</h4>
                <p className="text-sm text-slate-400">Software and complete thesis built for you.</p>
                {requestType === 'Full Implementation' && <CheckCircle2 className="absolute top-4 right-4 text-amber-500 w-5 h-5" />}
              </div>
            </div>
          </div>

          {/* STEP 2: DETAILS */}
          {requestType && (
            <div className="space-y-6 bg-black/40 p-6 md:p-8 rounded-3xl border border-white/5 animate-in fade-in slide-in-from-bottom-4">
              <h3 className="text-lg font-bold text-white mb-4">Step 2: Academic Details</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">University / Institution</label>
                  <input required type="text" placeholder="e.g. University of Lagos" value={formData.universityName} onChange={e => setFormData({...formData, universityName: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Department</label>
                  <input required type="text" placeholder="e.g. Computer Science" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Degree Level</label>
                  <select aria-label="Degree" value={formData.degree} onChange={e => setFormData({...formData, degree: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500">
                    <option value="BSc">BSc / BEng</option>
                    <option value="MSc">MSc / MEng</option>
                    <option value="PhD">PhD</option>
                    <option value="ND/HND">ND / HND</option>
                  </select>
                </div>
              </div>

              {requestType === 'Proposal Development' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Approved Project Title</label>
                  <input required type="text" placeholder="Enter your approved topic..." value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
              )}

              {requestType === 'Chapter Assistance' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Project Title</label>
                  <input required type="text" placeholder="Enter your project topic..." value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
              )}

              {requestType === 'Full Implementation' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Approved Project Title</label>
                  <input required type="text" placeholder="Enter your approved project topic..." value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {requestType === 'Topic Selection' && 'Areas of Interest / Preferences'}
                  {requestType === 'Proposal Development' && 'Brief Description of the Topic'}
                  {requestType === 'Chapter Assistance' && 'Which chapters do you need help with?'}
                  {requestType === 'Full Implementation' && 'Full Software & Thesis Requirements'}
                </label>
                <textarea 
                  required 
                  rows={4} 
                  placeholder={
                    requestType === 'Topic Selection' 
                      ? "e.g., I am interested in Artificial Intelligence, Healthcare, or Fintech..." 
                      : requestType === 'Proposal Development'
                      ? "Briefly explain what the project is about and any specific requirements from your supervisor..."
                      : requestType === 'Chapter Assistance'
                      ? "e.g., I need help writing Chapter 3 (Methodology) and analyzing my data..."
                      : "Provide a detailed explanation of what the software should do, core features, etc..."
                  }
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none" 
                />
              </div>

              {/* FILE UPLOAD SECTION */}
              <div className="bg-slate-900 border border-white/10 rounded-xl p-6 relative">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {requestType === 'Topic Selection' && 'Attach University Guidelines (Optional)'}
                  {requestType === 'Proposal Development' && 'Attach Draft Proposal or Guidelines (Optional)'}
                  {requestType === 'Chapter Assistance' && 'Attach Current Work / Chapters (Optional)'}
                  {requestType === 'Full Implementation' && 'Attach Approved Proposal / Guidelines (Optional)'}
                </label>
                <p className="text-xs text-slate-500 mb-4">
                  {requestType === 'Topic Selection' && 'If your department has specific rules for topics, please upload them here.'}
                  {requestType === 'Proposal Development' && 'If you have a draft or specific formats required, upload it here.'}
                  {requestType === 'Chapter Assistance' && 'Upload what you have written so far so we can review it.'}
                  {requestType === 'Full Implementation' && 'Upload your approved proposal, chapter one, or any system design documents.'}
                </p>
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer bg-white/5 hover:bg-white/10 text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border border-white/10">
                    <UploadCloud className="w-4 h-4 text-amber-500" />
                    {uploadingFile ? 'Uploading...' : 'Choose File'}
                    <input 
                      type="file" 
                      className="hidden" 
                      disabled={uploadingFile}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        try {
                          setUploadingFile(true);
                          const cloudFormData = new FormData();
                          cloudFormData.append('file', file);
                          cloudFormData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default');
                          
                          const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`, {
                            method: 'POST',
                            body: cloudFormData
                          });
                          
                          if (!res.ok) throw new Error('Failed to upload document');
                          const data = await res.json();
                          
                          setInitialDocumentUrl(data.secure_url);
                          setUploadedFileName(file.name);
                          toast.success('Document uploaded!');
                        } catch (err: any) {
                          toast.error(err.message || 'Upload failed');
                        } finally {
                          setUploadingFile(false);
                        }
                      }}
                    />
                  </label>
                  {uploadedFileName && (
                    <span className="text-sm text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> {uploadedFileName}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-8 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>

            </div>
          )}
        </form>

      </div>
    </div>
  );
}
