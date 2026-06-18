'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { client } from '@/lib/appwrite';
import { Databases, ID } from 'appwrite';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type ServiceType = 'Software Development' | 'Printing Services' | 'Solar & Electrical' | 'Other';

export default function RequestServicePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [service, setService] = useState<ServiceType>('Software Development');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to submit a request. Please sign in.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const databases = new Databases(client);
      const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'multicompany';

      await databases.createDocument(
        databaseId,
        'tickets',
        ID.unique(),
        {
          userId: user.$id,
          subject: `[${service}] ${subject}`,
          description: description,
          priority: 'medium',
          status: 'open'
        }
      );

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);

    } catch (err: any) {
      console.error('Failed to submit request:', err);
      setError(err.message || 'An error occurred while submitting your request.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="max-w-md p-8 text-center glass-panel rounded-2xl border border-green-500/20 bg-green-500/5">
          <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
          <h2 className="text-2xl font-bold text-primary-foreground mb-2">Request Submitted</h2>
          <p className="text-muted mb-6">Our team will review your request and contact you shortly.</p>
          <p className="text-sm text-muted">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-primary-foreground">Request a Service</h1>
          <p className="mt-2 text-muted">Select a category and provide details about your project.</p>
        </div>

        <div className="glass-panel p-8 rounded-2xl border border-border">
          {error && (
            <div className="mb-6 p-4 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-md">
              {error}
              {!user && (
                <Link href="/login" className="ml-2 font-bold underline hover:text-red-300">
                  Go to Login
                </Link>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-primary-foreground">Service Category</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['Software Development', 'Printing Services', 'Solar & Electrical'].map((opt) => (
                  <label 
                    key={opt}
                    className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all ${
                      service === opt 
                        ? 'border-primary bg-primary/10 text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.2)]' 
                        : 'border-border bg-card text-muted hover:border-muted/50'
                    }`}
                  >
                    <input 
                      type="radio" 
                      className="sr-only"
                      name="serviceType"
                      value={opt}
                      checked={service === opt}
                      onChange={(e) => setService(e.target.value as ServiceType)}
                    />
                    <span className="text-sm font-medium">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-primary-foreground">Project Title / Subject</label>
              <input 
                type="text" 
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Need a mobile app for my store"
                className="w-full px-4 py-3 bg-card border border-border rounded-lg text-primary-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-primary-foreground">Detailed Description</label>
              <textarea 
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe your requirements, timeline, and any specific details..."
                className="w-full px-4 py-3 bg-card border border-border rounded-lg text-primary-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-bold transition-all shadow-[0_0_20px_rgba(var(--primary),0.3)] disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
