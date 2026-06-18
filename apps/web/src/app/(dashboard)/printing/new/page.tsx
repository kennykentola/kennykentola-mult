'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { client } from '@/lib/appwrite';
import { Databases, Storage, ID } from 'appwrite';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewPrintOrderPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [file, setFile] = useState<File | null>(null);
  const [printingType, setPrintingType] = useState('photocopy');
  const [colorMode, setColorMode] = useState('mono');
  const [paperSize, setPaperSize] = useState('A4');
  const [doubleSided, setDoubleSided] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [shippingAddress, setShippingAddress] = useState('');

  const handleNext = () => {
    if (step === 1 && !file) {
      alert('Please select a file to upload.');
      return;
    }
    setStep(s => s + 1);
  };

  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) return;
    
    setIsSubmitting(true);
    try {
      const storage = new Storage(client);
      const databases = new Databases(client);
      const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'multicompany';
      
      // Note: Make sure you created the 'print_orders' bucket in Appwrite
      const bucketId = 'print_orders'; 

      // 1. Upload File
      const uploadedFile = await storage.createFile(bucketId, ID.unique(), file);
      
      // Get File URL
      const fileUrl = storage.getFileDownload(bucketId, uploadedFile.$id).toString();

      // 2. Create Print Order Document
      await databases.createDocument(dbId, 'print_orders', ID.unique(), {
        userId: user.$id,
        fileUrl: fileUrl,
        fileType: file.type || 'application/octet-stream',
        printingType,
        colorMode,
        paperSize,
        doubleSided,
        quantity: Number(quantity),
        status: 'pending', // Pending quote and review
        quotePrice: 0,
        shippingAddress
      });

      alert('Print Order submitted successfully! An admin will review it and provide a quote shortly.');
      router.push('/dashboard/printing');

    } catch (err: any) {
      console.error('Failed to submit print order:', err);
      alert('Error submitting order: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <Link href="/dashboard/printing" className="text-sm text-muted hover:text-primary transition-colors flex items-center space-x-1 mb-4">
        <span>&larr;</span> <span>Back to Orders</span>
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-primary-foreground tracking-tight">Request Print Quote</h1>
        <p className="text-muted mt-1 text-sm">Upload your document and configure your printing preferences. You will pay later upon quote approval or physical pickup.</p>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${s <= step ? 'bg-primary' : 'bg-transparent'}`} 
            />
          </div>
        ))}
      </div>

      <div className="glass-panel border border-border rounded-xl p-8">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl font-bold text-primary-foreground">Step 1: Upload Document</h2>
            <div className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-primary/50 transition-colors bg-white/5">
              <span className="text-4xl block mb-4">📄</span>
              <input 
                type="file" 
                id="file-upload" 
                className="hidden" 
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <label 
                htmlFor="file-upload" 
                className="cursor-pointer px-6 py-2.5 bg-primary/20 text-primary hover:bg-primary/30 font-medium rounded-lg transition-colors inline-block mb-2"
              >
                Choose File
              </label>
              <p className="text-sm text-muted mt-2">
                {file ? <span className="text-primary-foreground font-medium">{file.name}</span> : 'PDF, DOCX, or Images up to 50MB'}
              </p>
            </div>
            <div className="flex justify-end">
              <button 
                onClick={handleNext}
                className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg transition-all"
              >
                Next Step
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl font-bold text-primary-foreground mb-6">Step 2: Print Specifications</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted">Printing Type</label>
                <select 
                  title="Printing Type"
                  value={printingType} 
                  onChange={e => setPrintingType(e.target.value)}
                  className="w-full p-3 bg-white/5 border border-border rounded-lg text-primary-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                >
                  <option value="photocopy">Photocopy</option>
                  <option value="book-printing">Book Printing</option>
                  <option value="id-card">ID Card</option>
                  <option value="flyer">Flyer</option>
                  <option value="poster">Poster</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted">Paper Size</label>
                <select 
                  title="Paper Size"
                  value={paperSize} 
                  onChange={e => setPaperSize(e.target.value)}
                  className="w-full p-3 bg-white/5 border border-border rounded-lg text-primary-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                >
                  <option value="A4">A4 (Standard)</option>
                  <option value="A3">A3 (Large)</option>
                  <option value="A5">A5 (Small)</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted">Color Mode</label>
                <select 
                  title="Color Mode"
                  value={colorMode} 
                  onChange={e => setColorMode(e.target.value)}
                  className="w-full p-3 bg-white/5 border border-border rounded-lg text-primary-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                >
                  <option value="mono">Black & White (Mono)</option>
                  <option value="color">Full Color</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="quantity" className="text-sm font-medium text-muted">Copies</label>
                <input 
                  id="quantity"
                  title="Quantity"
                  type="number" 
                  min="1"
                  value={quantity} 
                  onChange={e => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full p-3 bg-white/5 border border-border rounded-lg text-primary-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>

              <div className="col-span-1 md:col-span-2 flex items-center space-x-3 p-4 bg-white/5 border border-border rounded-lg mt-2">
                <input 
                  type="checkbox" 
                  id="doubleSided"
                  checked={doubleSided}
                  onChange={e => setDoubleSided(e.target.checked)}
                  className="w-5 h-5 accent-primary rounded cursor-pointer"
                />
                <label htmlFor="doubleSided" className="text-sm font-medium text-primary-foreground cursor-pointer">
                  Double Sided Printing (Duplex)
                </label>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button 
                onClick={handleBack}
                className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-primary-foreground font-medium rounded-lg transition-all"
              >
                Back
              </button>
              <button 
                onClick={handleNext}
                className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg transition-all"
              >
                Next Step
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl font-bold text-primary-foreground mb-6">Step 3: Delivery Details</h2>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted">Shipping Address (Optional for Physical Pickup)</label>
              <textarea 
                rows={3}
                placeholder="Enter full delivery address or leave blank if you intend to pick it up at the shop..."
                value={shippingAddress} 
                onChange={e => setShippingAddress(e.target.value)}
                className="w-full p-4 bg-white/5 border border-border rounded-xl text-primary-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
              />
            </div>

            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
              <p className="text-sm text-blue-400">
                <strong>Info:</strong> Your file will be securely uploaded and placed in our quoting queue. Once our staff reviews the document specs, you will receive a notification with the final price. You can choose to pay digitally or in-person.
              </p>
            </div>

            <div className="flex justify-between mt-8">
              <button 
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-primary-foreground font-medium rounded-lg transition-all disabled:opacity-50"
              >
                Back
              </button>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(var(--primary),0.3)] disabled:opacity-50"
              >
                {isSubmitting ? 'Uploading...' : 'Submit Order'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
