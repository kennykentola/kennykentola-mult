'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { client } from '@/lib/appwrite';
import { Databases, Storage, ID } from 'appwrite';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewAcademicProjectPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Required Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Optional Fields
  const [universityName, setUniversityName] = useState('');
  const [department, setDepartment] = useState('');
  const [degree, setDegree] = useState('');
  const [level, setLevel] = useState('');
  const [extraNotes, setExtraNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !user) {
      alert('Title and Description are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const storage = new Storage(client);
      const databases = new Databases(client);
      const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'multicompany';
      const bucketId = 'academic_files';

      let proposalUrl = '';

      // Upload file if provided
      if (file) {
        const uploadedFile = await storage.createFile(bucketId, ID.unique(), file);
        proposalUrl = storage.getFileDownload(bucketId, uploadedFile.$id).toString();
      }

      // Combine description and extra notes
      const fullDescription = extraNotes 
        ? `${description}\n\n--- Additional Notes ---\n${extraNotes}` 
        : description;

      // Create DB Document
      await databases.createDocument(dbId, 'student_projects', ID.unique(), {
        studentId: user.$id,
        title,
        description: fullDescription,
        universityName,
        department,
        degree,
        level,
        status: 'pending-proposal',
        price: 0,
        proposalUrl: proposalUrl || undefined,
      });

      alert('Project request submitted successfully! Our team will review it and provide a quote.');
      router.push('/dashboard/academic');

    } catch (err: any) {
      console.error('Failed to submit academic project:', err);
      alert('Error submitting request: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <Link href="/dashboard/academic" className="text-sm text-muted hover:text-primary transition-colors flex items-center space-x-1 mb-4">
        <span>&larr;</span> <span>Back to Academic Dashboard</span>
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-primary-foreground tracking-tight">Request Academic Project</h1>
        <p className="text-muted mt-1 text-sm">Submit details for your Capstone, Thesis, or final year project to get a development quote.</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel border border-border rounded-xl p-6 lg:p-10 space-y-8">
        
        {/* Core Requirements */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-primary-foreground border-b border-border pb-2">Core Requirements</h2>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted">Project Title <span className="text-red-500">*</span></label>
            <input 
              required
              type="text" 
              placeholder="e.g., AI-Powered Attendance System"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full p-3 bg-white/5 border border-border rounded-lg text-primary-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted">Project Description & Core Features <span className="text-red-500">*</span></label>
            <textarea 
              required
              rows={5}
              placeholder="Describe the main goal of the project and the key features it must have..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full p-4 bg-white/5 border border-border rounded-lg text-primary-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
            />
          </div>
        </section>

        {/* Academic Details */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-primary-foreground border-b border-border pb-2">Academic Details (Optional)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted">University / Institution Name</label>
              <input 
                type="text" 
                placeholder="e.g., University of Lagos"
                value={universityName}
                onChange={e => setUniversityName(e.target.value)}
                className="w-full p-3 bg-white/5 border border-border rounded-lg text-primary-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted">Department</label>
              <input 
                type="text" 
                placeholder="e.g., Computer Science"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full p-3 bg-white/5 border border-border rounded-lg text-primary-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted">Degree</label>
              <input 
                type="text" 
                placeholder="e.g., BSc, MSc, PhD"
                value={degree}
                onChange={e => setDegree(e.target.value)}
                className="w-full p-3 bg-white/5 border border-border rounded-lg text-primary-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted">Level / Year</label>
              <input 
                type="text" 
                placeholder="e.g., Final Year, 400L"
                value={level}
                onChange={e => setLevel(e.target.value)}
                className="w-full p-3 bg-white/5 border border-border rounded-lg text-primary-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </div>
          </div>
        </section>

        {/* Supporting Documents */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-primary-foreground border-b border-border pb-2">Supporting Documents</h2>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted">Upload Rubric or Requirements Document (Optional)</label>
            <div className="flex items-center gap-4">
              <input 
                type="file" 
                id="file-upload" 
                className="hidden" 
                accept=".pdf,.doc,.docx"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <label 
                htmlFor="file-upload" 
                className="cursor-pointer px-4 py-2 bg-white/5 hover:bg-white/10 text-primary-foreground border border-border font-medium rounded-lg transition-colors inline-block"
              >
                Choose File
              </label>
              <span className="text-sm text-muted line-clamp-1">
                {file ? file.name : 'No file chosen'}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted">Additional Explanations (Optional)</label>
            <textarea 
              rows={3}
              placeholder="If you didn't upload a file, or if you need to explain specific constraints, you can type them here..."
              value={extraNotes}
              onChange={e => setExtraNotes(e.target.value)}
              className="w-full p-4 bg-white/5 border border-border rounded-lg text-primary-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
            />
          </div>
        </section>

        <div className="pt-6 border-t border-border flex justify-end">
          <button 
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(var(--primary),0.3)] disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting Request...' : 'Submit Project Request'}
          </button>
        </div>

      </form>
    </div>
  );
}
