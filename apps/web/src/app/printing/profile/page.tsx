'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../features/auth/AuthContext';
import { account } from '../../../lib/appwrite';
import { Loader2, Save, User, MapPin, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PrintingProfilePage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadPrefs() {
      if (user) {
        try {
          const appwriteUser = await account.get();
          setFormData({
            name: user.name || '',
            phone: profile?.phoneNumber || appwriteUser.prefs?.phone || '',
            address: appwriteUser.prefs?.address || ''
          });
        } catch (err) {
          console.error('Failed to load preferences', err);
        } finally {
          setLoading(false);
        }
      }
    }
    loadPrefs();
  }, [user, profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');
    setError('');

    try {
      if (formData.name !== user?.name) {
        await account.updateName(formData.name);
      }
      
      const appwriteUser = await account.get();
      const newPrefs = { 
        ...appwriteUser.prefs, 
        phone: formData.phone, 
        address: formData.address 
      };
      
      await account.updatePrefs(newPrefs);
      
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex-1 p-6 lg:p-10">
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Profile Settings</h1>
          <p className="mt-2 text-slate-400">Manage your delivery addresses and contact information here.</p>
        </div>

        <div className="rounded-3xl border border-white/5 bg-slate-900/30 p-8 shadow-xl backdrop-blur-xl">
          {message && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold text-center">
              {message}
            </div>
          )}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-semibold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <User className="h-4 w-4 text-slate-500" /> Full Name
              </label>
              <input
                id="name"
                required
                type="text"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="John Doe"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-500" /> Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+234 801 234 5678"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="address" className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-500" /> Default Delivery Address
              </label>
              <textarea
                id="address"
                name="address"
                rows={3}
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="123 Example Street, Lagos, Nigeria"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
              />
              <p className="text-xs text-slate-500">This address will be used when you select Delivery during checkout.</p>
            </div>

            <div className="border-t border-slate-800 pt-6 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white px-8 py-3 text-sm font-bold transition-all shadow-lg shadow-rose-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                {isSaving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
