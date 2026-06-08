'use client';

import React, { useState } from 'react';
import { 
  Settings, 
  Save, 
  Loader2,
  CheckCircle2,
  Globe,
  Mail,
  CreditCard
} from 'lucide-react';

export default function SuperAdminSettingsPage() {
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSuccess('Settings updated successfully.');
      setTimeout(() => setSuccess(''), 4000);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
          <Settings className="h-3.5 w-3.5" />
          System Configuration
        </span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white">Global Settings</h1>
        <p className="mt-2 text-slate-400 text-sm">
          Manage platform-wide settings, integrations, and email configurations.
        </p>
      </div>

      {success && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Settings Grid */}
      <div className="space-y-6">
        {/* General Settings */}
        <div className="rounded-3xl border border-white/5 bg-slate-900/30 p-8 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Globe className="h-5 w-5 text-indigo-400" /> General Platform Settings
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="platform-name" className="block text-sm font-semibold text-slate-400 mb-2">Platform Name</label>
              <input 
                id="platform-name"
                type="text" 
                defaultValue="KennyKentola Multi-Company"
                className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500" 
              />
            </div>
            <div>
              <label htmlFor="platform-fee" className="block text-sm font-semibold text-slate-400 mb-2">Platform Fee / Commission (%)</label>
              <input 
                id="platform-fee"
                type="number" 
                defaultValue={30}
                className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500" 
              />
              <p className="text-xs text-slate-500 mt-2">Percentage deducted from instructor course sales.</p>
            </div>
          </div>
        </div>

        {/* Email / SMTP */}
        <div className="rounded-3xl border border-white/5 bg-slate-900/30 p-8 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Mail className="h-5 w-5 text-indigo-400" /> SMTP / Mail Configuration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="smtp-host" className="block text-sm font-semibold text-slate-400 mb-2">SMTP Host</label>
              <input 
                id="smtp-host"
                type="text" 
                defaultValue="smtp.mailgun.org"
                className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500" 
              />
            </div>
            <div>
              <label htmlFor="smtp-port" className="block text-sm font-semibold text-slate-400 mb-2">SMTP Port</label>
              <input 
                id="smtp-port"
                type="text" 
                defaultValue="587"
                className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500" 
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="smtp-user" className="block text-sm font-semibold text-slate-400 mb-2">SMTP Username</label>
              <input 
                id="smtp-user"
                type="text" 
                defaultValue="postmaster@mg.kennykentola.com"
                className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500" 
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="smtp-pass" className="block text-sm font-semibold text-slate-400 mb-2">SMTP Password</label>
              <input 
                id="smtp-pass"
                type="password" 
                defaultValue="**********"
                className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500" 
              />
            </div>
          </div>
        </div>

        {/* Payment Gateways */}
        <div className="rounded-3xl border border-white/5 bg-slate-900/30 p-8 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-indigo-400" /> Payment Gateways
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="paystack-key" className="block text-sm font-semibold text-slate-400 mb-2">Paystack Secret Key</label>
              <input 
                id="paystack-key"
                type="password" 
                defaultValue="sk_test_********************************"
                className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500" 
              />
            </div>
            <div>
              <label htmlFor="flw-key" className="block text-sm font-semibold text-slate-400 mb-2">Flutterwave Secret Key</label>
              <input 
                id="flw-key"
                type="password" 
                defaultValue="FLWSECK_TEST-************************"
                className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500" 
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-6 py-3 text-sm font-bold text-white transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Saving Changes...' : 'Save Configuration'}
        </button>
      </div>
    </div>
  );
}
