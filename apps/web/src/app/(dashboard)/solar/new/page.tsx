'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { client } from '@/lib/appwrite';
import { Databases, ID } from 'appwrite';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const getProgressWidthClass = (progress: number) => {
  const rounded = Math.round((progress || 0) / 5) * 5;
  switch (rounded) {
    case 5: return 'w-[5%]';
    case 10: return 'w-[10%]';
    case 15: return 'w-[15%]';
    case 20: return 'w-[20%]';
    case 25: return 'w-[25%]';
    case 30: return 'w-[30%]';
    case 35: return 'w-[35%]';
    case 40: return 'w-[40%]';
    case 45: return 'w-[45%]';
    case 50: return 'w-[50%]';
    case 55: return 'w-[55%]';
    case 60: return 'w-[60%]';
    case 65: return 'w-[65%]';
    case 70: return 'w-[70%]';
    case 75: return 'w-[75%]';
    case 80: return 'w-[80%]';
    case 85: return 'w-[85%]';
    case 90: return 'w-[90%]';
    case 95: return 'w-[95%]';
    case 100: return 'w-full';
    default: return 'w-0';
  }
};

export default function NewSolarJobPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [jobType, setJobType] = useState('solar-installation');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  
  // Image Upload State
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (selectedFiles.length > 3) {
        alert('You can only upload up to 3 images.');
        return;
      }
      setFiles(selectedFiles);
    }
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error('Cloudinary environment variables are missing. Please configure NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      throw new Error('Failed to upload image to Cloudinary.');
    }

    const data = await res.json();
    return data.secure_url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !address || !user) {
      alert('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(10);
    try {
      const uploadedUrls: string[] = [];

      // Upload images to Cloudinary first
      if (files.length > 0) {
        setUploadProgress(30);
        for (const file of files) {
          const url = await uploadToCloudinary(file);
          uploadedUrls.push(url);
          setUploadProgress(prev => prev + (50 / files.length)); // increment up to ~80%
        }
      }

      setUploadProgress(90);

      // Create DB Document
      const databases = new Databases(client);
      const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'multicompany';

      await databases.createDocument(dbId, 'solar_jobs', ID.unique(), {
        clientId: user.$id,
        jobType,
        description,
        address,
        status: 'pending-quote',
        quotePrice: 0,
        siteImageUrls: uploadedUrls,
      });

      setUploadProgress(100);
      alert('Installation request submitted successfully! Our engineers will review it and provide a quote.');
      router.push('/dashboard/solar');

    } catch (err: any) {
      console.error('Failed to submit solar request:', err);
      alert('Error submitting request: ' + err.message);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <Link href="/dashboard/solar" className="text-sm text-muted hover:text-primary transition-colors flex items-center space-x-1 mb-4">
        <span>&larr;</span> <span>Back to Dashboard</span>
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-primary-foreground tracking-tight">Request Installation / Repair</h1>
        <p className="text-muted mt-1 text-sm">Get a quote for solar panels, inverter setups, or electrical wiring.</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel border border-border rounded-xl p-6 lg:p-10 space-y-8">
        
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-primary-foreground border-b border-border pb-2">Service Details</h2>
          
          <div className="space-y-2">
            <label htmlFor="jobType" className="text-sm font-medium text-muted">Service Type <span className="text-red-500">*</span></label>
            <select 
              id="jobType"
              title="Service Type"
              value={jobType}
              onChange={e => setJobType(e.target.value)}
              className="w-full p-3 bg-white/5 border border-border rounded-lg text-primary-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            >
              <option value="solar-installation">Solar Panel Installation</option>
              <option value="inverter-setup">Inverter / Battery Setup</option>
              <option value="electrical-repair">Electrical Repair</option>
              <option value="home-wiring">Home Wiring</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="address" className="text-sm font-medium text-muted">Physical Address <span className="text-red-500">*</span></label>
            <input 
              id="address"
              title="Installation Address"
              required
              type="text" 
              placeholder="e.g., 123 Tech Avenue, Lagos"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full p-3 bg-white/5 border border-border rounded-lg text-primary-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-muted">Description of Work Needed <span className="text-red-500">*</span></label>
            <textarea 
              id="description"
              required
              rows={5}
              placeholder="Detail your requirements (e.g., I need a 5kVA inverter setup with 4 solar panels to power my home office...)"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full p-4 bg-white/5 border border-border rounded-lg text-primary-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
            />
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex justify-between items-end border-b border-border pb-2">
            <h2 className="text-xl font-bold text-primary-foreground">Site Photos (Optional)</h2>
            <span className="text-xs text-yellow-500/80 bg-yellow-500/10 px-2 py-1 rounded">Powered by Cloudinary</span>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted">Upload photos of the installation site, roof, or electrical box (Max 3)</label>
            <div className="flex items-center gap-4">
              <input 
                type="file" 
                id="site-images" 
                title="Site Images"
                className="hidden" 
                accept="image/*"
                multiple
                onChange={handleFileChange}
              />
              <label 
                htmlFor="site-images" 
                className="cursor-pointer px-4 py-2 bg-white/5 hover:bg-white/10 text-primary-foreground border border-border font-medium rounded-lg transition-colors inline-block"
              >
                Choose Photos
              </label>
              <span className="text-sm text-muted line-clamp-1">
                {files.length > 0 ? `${files.length} file(s) selected` : 'No photos chosen'}
              </span>
            </div>
            {files.length > 0 && (
              <div className="flex gap-2 mt-4">
                {files.map((f, i) => (
                  <div key={i} className="text-xs px-2 py-1 bg-white/5 border border-border rounded text-muted">
                    {f.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {isSubmitting && (
          <div className="space-y-2">
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-yellow-500 transition-all duration-300 ease-out ${getProgressWidthClass(uploadProgress)}`}
              />
            </div>
            <p className="text-xs text-center text-muted">Processing request... {Math.round(uploadProgress)}%</p>
          </div>
        )}

        <div className="pt-6 border-t border-border flex justify-end">
          <button 
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(234,179,8,0.3)] disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting Request...' : 'Submit Request'}
          </button>
        </div>

      </form>
    </div>
  );
}
