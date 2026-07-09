'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { solarService } from '../../../../features/solar/solarService';
import { UploadCloud, X, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function RequestSolarJobPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    jobType: 'solar-installation',
    description: '',
    address: '',
    scheduledDate: '',
  });
  
  const [images, setImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(prev => [...prev, ...Array.from(e.target.files as FileList)]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    if (images.length === 0) return [];
    setUploading(true);
    const urls: string[] = [];
    
    try {
      for (const file of images) {
        const formData = new FormData();
        formData.append('file', file);
        // Using existing upload route from the platform
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}` + `/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });
        const data = await res.json();
        if (data && data.url) {
          urls.push(data.url);
        }
      }
    } catch (err) {
      console.error('Failed to upload images', err);
      alert('Error uploading one or more images.');
    } finally {
      setUploading(false);
    }
    return urls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      let siteImageUrls: string[] = [];
      if (images.length > 0) {
        siteImageUrls = await uploadImages();
      }

      await solarService.requestJob({
        ...form,
        siteImageUrls
      });
      
      alert('Request submitted successfully!');
      router.push('/dashboard/solar');
    } catch (err) {
      console.error('Failed to submit job request', err);
      alert('Error submitting request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/solar" className="p-2 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Request Installation</h1>
          <p className="text-slate-400 mt-1 text-sm">Tell us what you need and our engineers will provide a quote.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
        <div>
          <label htmlFor="jobType" className="block text-sm font-medium text-slate-400 mb-2">Service Type</label>
          <select
            id="jobType"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-colors"
            value={form.jobType}
            onChange={e => setForm({...form, jobType: e.target.value})}
            required
          >
            <option value="solar-installation">Solar Panel Installation</option>
            <option value="inverter-setup">Inverter / Battery Setup</option>
            <option value="electrical-repair">Electrical Repair / Wiring</option>
            <option value="maintenance">Maintenance Service</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Description of Work</label>
          <textarea
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-colors h-32"
            value={form.description}
            onChange={e => setForm({...form, description: e.target.value})}
            placeholder="E.g., I need a 5KVA inverter installed with 4 solar panels..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Service Address</label>
          <input
            type="text"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-colors"
            value={form.address}
            onChange={e => setForm({...form, address: e.target.value})}
            placeholder="123 Main St, City, State"
            required
          />
        </div>

        <div>
          <label htmlFor="scheduledDate" className="block text-sm font-medium text-slate-400 mb-2">Preferred Date (Optional)</label>
          <input
            id="scheduledDate"
            type="date"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-400 focus:outline-none focus:border-yellow-500 transition-colors"
            value={form.scheduledDate}
            onChange={e => setForm({...form, scheduledDate: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Site Photos (Optional)</label>
          <p className="text-xs text-slate-500 mb-3">Upload photos of your roof, electrical panel, or inverter to help us quote accurately.</p>
          
          <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 flex flex-col items-center justify-center bg-slate-950/50 hover:bg-slate-950 transition-colors relative cursor-pointer group">
            <input 
              type="file" 
              title="Upload site photos"
              multiple 
              accept="image/*"
              onChange={handleImageChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <UploadCloud className="w-10 h-10 text-slate-600 group-hover:text-yellow-500 transition-colors mb-3" />
            <p className="text-sm text-slate-400 font-medium">Click or drag images here</p>
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mt-4">
              {images.map((img, i) => (
                <div key={i} className="relative aspect-square bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={URL.createObjectURL(img)} alt={`Upload ${i}`} className="object-cover w-full h-full opacity-80" />
                  <button 
                    type="button"
                    title="Remove Image"
                    aria-label="Remove Image"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 bg-red-500/80 text-white rounded-full p-1 hover:bg-red-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting || uploading}
          className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3.5 rounded-lg shadow-[0_0_15px_rgba(234,179,8,0.2)] transition-all flex justify-center items-center gap-2"
        >
          {submitting || uploading ? (
            <span className="animate-pulse">Processing...</span>
          ) : (
            'Submit Request'
          )}
        </button>
      </form>
    </div>
  );
}
