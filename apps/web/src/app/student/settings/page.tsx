'use client';

import React, { useState } from 'react';
import { 
  Settings, 
  User, 
  Mail, 
  Lock, 
  Bell, 
  Save, 
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../../features/auth/AuthContext';
import { getSessionJwt } from '../../../lib/sessionJwt';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export default function StudentSettingsPage() {
  const { profile, refreshProfile } = useAuth();
  const [firstName, setFirstName] = useState(profile?.firstName || '');
  const [lastName, setLastName] = useState(profile?.lastName || '');
  const [phone, setPhone] = useState(profile?.phoneNumber || '');
  
  const [emailNotifications, setEmailNotifications] = useState(profile?.emailNotifications ?? true);
  const [smsNotifications, setSmsNotifications] = useState(profile?.smsNotifications ?? false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await getSessionJwt()}`
        },
        body: JSON.stringify({
          firstName,
          lastName,
          phoneNumber: phone,
          emailNotifications,
          smsNotifications
        })
      });

      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload?.error || 'Unable to save settings.');
      }

      await refreshProfile();
      setSuccess('Settings updated successfully!');
    } catch (err: any) {
      setError(err?.message || 'Unable to save settings.');
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
          <Settings className="h-3.5 w-3.5" />
          Settings
        </span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white">
          Workspace Settings
        </h1>
        <p className="mt-2 text-slate-400 text-sm">
          Manage your personal profile, notification preferences, and workspace settings.
        </p>
      </div>

      {success && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300 flex items-center gap-3 animate-in fade-in duration-300">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-300 flex items-center gap-3 animate-in fade-in duration-300">
          <span>{error}</span>
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-[1fr_2.5fr]">
        {/* Navigation Sidebar inside Page */}
        <aside className="space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-left">
            <User className="h-4 w-4" />
            General Profile
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium border border-transparent text-slate-400 hover:text-white hover:bg-slate-900/50 text-left">
            <Bell className="h-4 w-4" />
            Notifications
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium border border-transparent text-slate-400 hover:text-white hover:bg-slate-900/50 text-left">
            <Lock className="h-4 w-4" />
            Security & Login
          </button>
        </aside>

        {/* Content Box */}
        <div className="rounded-3xl border border-white/5 bg-slate-900/20 p-6 lg:p-8 space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            <h3 className="text-lg font-bold text-white border-b border-slate-900 pb-3">
              Profile Details
            </h3>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="firstName" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-slate-950 px-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none transition-colors"
                  placeholder="First name"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-slate-950 px-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none transition-colors"
                  placeholder="Last name"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-white/5 bg-slate-950 px-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none transition-colors"
                placeholder="Phone number"
              />
            </div>

            <h3 className="text-lg font-bold text-white border-b border-slate-900 pb-3 pt-4">
              Communications
            </h3>

            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-0 focus:ring-offset-0 focus:outline-none"
                />
                <div>
                  <span className="block text-sm font-semibold text-white">Email updates</span>
                  <span className="block text-xs text-slate-400">Receive notifications about assignment reviews, courses, and announcements.</span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={smsNotifications}
                  onChange={(e) => setSmsNotifications(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-0 focus:ring-offset-0 focus:outline-none"
                />
                <div>
                  <span className="block text-sm font-semibold text-white">SMS updates</span>
                  <span className="block text-xs text-slate-400">Receive text alerts for immediate updates on deadlines.</span>
                </div>
              </label>
            </div>

            <div className="pt-4 border-t border-slate-900 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
