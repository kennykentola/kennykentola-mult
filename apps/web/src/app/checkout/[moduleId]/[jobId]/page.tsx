'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { client } from '@/lib/appwrite';
import { Databases, Query } from 'appwrite';
import { useAuth } from '@/lib/auth';
import { CreditCard, Building2, UploadCloud, CheckCircle2, ArrowLeft, ShieldCheck } from 'lucide-react';
import { PaystackButton } from 'react-paystack';
import { BankAccount } from '@company/shared';

// You will need to replace this with your actual Paystack Public Key
const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_1234567890';

export default function UniversalCheckoutPage() {
  const params = useParams();
  const moduleId = params?.moduleId as string;
  const jobId = params?.jobId as string;
  const router = useRouter();
  const { user } = useAuth();
  
  const [job, setJob] = useState<any>(null);
  const [bankDetails, setBankDetails] = useState<BankAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState<'card' | 'transfer'>('card');
  
  // Manual Transfer state
  const [receiptUrl, setReceiptUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmittingTransfer, setIsSubmittingTransfer] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const databases = new Databases(client);
        const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'multicompany';
        
        // Fetch Job and Bank Details in parallel
        const [jobDoc, bankRes] = await Promise.all([
          databases.getDocument(dbId, moduleId as string, jobId as string),
          databases.listDocuments(dbId, 'bank_accounts', [Query.limit(1)])
        ]);
        
        setJob(jobDoc);
        if (bankRes.documents.length > 0) {
          setBankDetails(bankRes.documents[0] as unknown as BankAccount);
        }
      } catch (err) {
        console.error('Failed to fetch data for checkout:', err);
      } finally {
        setLoading(false);
      }
    };
    if (moduleId && jobId) fetchData();
  }, [moduleId, jobId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Quote Not Found</h1>
          <p className="text-slate-400">The requested quote could not be loaded.</p>
        </div>
      </div>
    );
  }

  // Handle differences in schema pricing fields
  const price = job.quotePrice ?? job.price ?? 0;
  
  // Paystack Configuration
  const paystackConfig = {
    reference: `REF_${new Date().getTime()}_${jobId}`,
    email: user?.email || 'customer@example.com',
    amount: price * 100, // Paystack amount is in kobo (multiply by 100)
    publicKey: PAYSTACK_PUBLIC_KEY,
  };

  const handlePaystackSuccess = async (reference: any) => {
    try {
      const databases = new Databases(client);
      const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'multicompany';
      
      // Update job to paid
      await databases.updateDocument(dbId, moduleId as string, jobId as string, {
        status: 'paid',
        paymentId: reference.reference
      });
      
      alert('Payment Successful! Your job is now active.');
      router.back();
    } catch (err) {
      console.error('Failed to update job after payment', err);
      alert('Payment succeeded but we failed to update the job. Please contact support.');
    }
  };

  const handlePaystackClose = () => {
    console.log('Payment closed');
  };

  // Cloudinary Receipt Upload
  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default');

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setReceiptUrl(data.secure_url);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload receipt. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const submitManualTransfer = async () => {
    if (!receiptUrl) return alert('Please upload a receipt first.');
    setIsSubmittingTransfer(true);
    try {
      const databases = new Databases(client);
      const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'multicompany';
      
      await databases.updateDocument(dbId, moduleId as string, jobId as string, {
        status: 'pending-verification'
      });

      alert('Receipt uploaded successfully! We will verify it shortly.');
      router.back();
    } catch (err) {
      console.error('Failed to submit transfer:', err);
      alert('Failed to submit receipt.');
    } finally {
      setIsSubmittingTransfer(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-12 text-slate-200">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </button>

        <div className="grid md:grid-cols-5 gap-8">
          
          {/* Left: Invoice Summary */}
          <div className="md:col-span-2 space-y-6">
            <div className="glass-panel border border-white/10 rounded-2xl p-6 bg-slate-900/50">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6 border-b border-white/10 pb-4">Invoice Summary</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-500">Service Category</label>
                  <p className="font-semibold text-white capitalize">{(moduleId as string).replace('_', ' ')}</p>
                </div>
                <div>
                  <label className="text-xs text-slate-500">Job Reference</label>
                  <p className="font-mono text-xs text-slate-300">{jobId}</p>
                </div>
                {job.title && (
                  <div>
                    <label className="text-xs text-slate-500">Description</label>
                    <p className="text-sm text-slate-300">{job.title}</p>
                  </div>
                )}
                
                <div className="pt-4 border-t border-white/10 mt-4">
                  <div className="flex justify-between items-end">
                    <span className="text-sm text-slate-400">Total Amount Due</span>
                    <span className="text-3xl font-extrabold text-emerald-400">${price.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-panel border border-emerald-500/20 bg-emerald-500/5 rounded-2xl p-6 flex items-start gap-4">
              <ShieldCheck className="h-6 w-6 text-emerald-500 shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-emerald-400 text-sm">Secure Payment Process</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Your payments are protected. Digital transactions are secured by Paystack with bank-grade encryption.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Payment Methods */}
          <div className="md:col-span-3 space-y-6">
            <h1 className="text-2xl font-bold text-white">Select Payment Method</h1>

            {/* Method Tabs */}
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setMethod('card')}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all ${
                  method === 'card' 
                    ? 'bg-primary/10 border-primary text-primary shadow-lg shadow-primary/10' 
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <CreditCard className="h-6 w-6" />
                <span className="font-bold text-sm">Pay Online Now</span>
              </button>
              
              <button 
                onClick={() => setMethod('transfer')}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all ${
                  method === 'transfer' 
                    ? 'bg-blue-500/10 border-blue-500 text-blue-400 shadow-lg shadow-blue-500/10' 
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <Building2 className="h-6 w-6" />
                <span className="font-bold text-sm">Bank Transfer</span>
              </button>
            </div>

            {/* Render Selected Method Content */}
            <div className="glass-panel border border-white/10 bg-slate-900/50 rounded-2xl p-6 min-h-[300px] flex flex-col">
              
              {method === 'card' ? (
                <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6">
                  <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center">
                    <CreditCard className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Instant Digital Checkout</h3>
                    <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto">
                      Pay instantly with your debit card, credit card, or via USSD through Paystack. Your job will begin immediately.
                    </p>
                  </div>
                  
                  <div className="pt-4">
                    <PaystackButton 
                      className="px-8 py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-xl shadow-primary/20 transition-all w-full sm:w-auto min-w-[200px]"
                      {...paystackConfig}
                      text={`Pay $${price.toFixed(2)} Securely`}
                      onSuccess={handlePaystackSuccess}
                      onClose={handlePaystackClose}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4">Bank Transfer Details</h3>
                    {bankDetails ? (
                      <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 space-y-3">
                        <div className="flex justify-between border-b border-slate-800 pb-2">
                          <span className="text-xs text-slate-500">Bank Name</span>
                          <span className="text-sm font-bold text-white">{bankDetails.bankName}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-800 pb-2">
                          <span className="text-xs text-slate-500">Account Name</span>
                          <span className="text-sm font-bold text-white">{bankDetails.accountName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-slate-500">Account Number</span>
                          <span className="text-sm font-bold text-emerald-400 font-mono tracking-widest">{bankDetails.accountNumber}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 text-center">
                        <p className="text-sm text-slate-400">Bank details have not been configured by the admin yet.</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-800">
                    <label className="text-sm font-bold text-white">Upload Payment Receipt</label>
                    <p className="text-xs text-slate-400">Please transfer exactly ${price.toFixed(2)} and upload the screenshot here for verification.</p>
                    
                    {!receiptUrl ? (
                      <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:bg-white/5 transition-colors cursor-pointer relative">
                        <input 
                          type="file" 
                          accept="image/*"
                          aria-label="Upload Payment Receipt"
                          onChange={handleReceiptUpload}
                          disabled={isUploading || !bankDetails}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        />
                        {isUploading ? (
                          <div className="flex flex-col items-center">
                            <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
                            <span className="text-sm text-blue-400 font-bold">Uploading to secure vault...</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <UploadCloud className="h-10 w-10 text-slate-500 mb-3" />
                            <span className="text-sm font-bold text-white">Click or drag receipt here</span>
                            <span className="text-xs text-slate-500 mt-1">PNG, JPG up to 5MB</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="border border-emerald-500/30 bg-emerald-500/5 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                          <div>
                            <p className="text-sm font-bold text-emerald-400">Receipt Uploaded Successfully</p>
                            <a href={receiptUrl} target="_blank" rel="noreferrer" className="text-xs text-slate-400 hover:text-white underline">View Receipt</a>
                          </div>
                        </div>
                        <button 
                          onClick={() => setReceiptUrl('')}
                          className="text-xs text-rose-400 hover:text-rose-300 font-bold px-3 py-1 bg-rose-500/10 rounded-lg"
                        >
                          Replace
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button 
                      disabled={!receiptUrl || isSubmittingTransfer || !bankDetails}
                      onClick={submitManualTransfer}
                      className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-xl shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmittingTransfer ? 'Submitting...' : 'Submit Receipt for Verification'}
                    </button>
                  </div>

                </div>
              )}
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
