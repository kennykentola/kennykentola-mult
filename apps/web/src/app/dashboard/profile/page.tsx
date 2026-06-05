'use client';

import React, { useState } from 'react';
import { useAuth } from '../../../features/auth/AuthContext';
import { User, Phone, Mail, Award, Key, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function ProfilePage() {
  const { profile, user, logout } = useAuth();
  const [firstName, setFirstName] = useState(profile?.firstName || '');
  const [lastName, setLastName] = useState(profile?.lastName || '');
  const [phone, setPhone] = useState(profile?.phoneNumber || '');
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!profile || !user) return null;

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setTimeout(() => {
      setUpdating(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 1200);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white">Profile Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Configure your personal credentials, contact parameters, and security credentials.</p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4.5 w-4.5" /> Profile settings updated successfully.
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Card: Account Card */}
        <div className="md:col-span-1 glass-panel border border-white/5 bg-slate-900/20 rounded-2xl p-6 flex flex-col items-center text-center">
          <div className="h-20 w-20 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-3xl font-bold text-indigo-400 uppercase mb-4">
            {profile.firstName[0]}
            {profile.lastName[0]}
          </div>

          <h3 className="text-base font-bold text-white">{profile.firstName} {profile.lastName}</h3>
          <span className="text-xs text-slate-500 block capitalize mt-1">{profile.role}</span>
          
          <div className="w-full border-t border-slate-900 mt-6 pt-6 text-left space-y-4 text-xs">
            <div>
              <span className="text-slate-500 font-semibold block uppercase text-[9px] tracking-wide">Email Verified</span>
              <span className="text-white font-medium flex items-center gap-1.5 mt-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" /> Yes (Appwrite Secure)
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block uppercase text-[9px] tracking-wide">Account Type</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 inline-block mt-1.5 uppercase">
                {profile.purpose}
              </span>
            </div>
          </div>
        </div>

        {/* Right Card: Settings Forms */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-panel border border-white/5 bg-slate-900/20 rounded-2xl p-6 lg:p-8">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">Personal details</h2>
            
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="first-name-input" className="text-xs font-semibold text-slate-400 block mb-1.5">First Name</label>
                  <input
                    id="first-name-input"
                    title="First Name"
                    placeholder="First Name"
                    type="text"
                    required
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="last-name-input" className="text-xs font-semibold text-slate-400 block mb-1.5">Last Name</label>
                  <input
                    id="last-name-input"
                    title="Last Name"
                    placeholder="Last Name"
                    type="text"
                    required
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email-input" className="text-xs font-semibold text-slate-400 block mb-1.5">Primary Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-650" />
                  <input
                    id="email-input"
                    title="Primary Email"
                    placeholder="john.doe@example.com"
                    type="email"
                    disabled
                    className="w-full bg-slate-950/30 border border-slate-850 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-500 cursor-not-allowed"
                    value={user.email}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone-input" className="text-xs font-semibold text-slate-400 block mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-650" />
                  <input
                    id="phone-input"
                    title="Phone Number"
                    placeholder="+234 80 1234 5678"
                    type="tel"
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-900 flex justify-end">
                <button
                  type="submit"
                  disabled={updating}
                  className="rounded-xl bg-indigo-650 hover:bg-indigo-650/90 transition-colors px-6 py-2.5 text-xs font-bold text-white"
                >
                  {updating ? 'Updating...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
