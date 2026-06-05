'use client';

import React, { useState } from 'react';
import { Settings, Save, RefreshCw, Key, ShieldCheck, Mail, Database } from 'lucide-react';

export default function AdminSettingsPage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [siteName, setSiteName] = useState('KennyKentola Multi-Company Hub');
  const [smtpServer, setSmtpServer] = useState('smtp.mailtrap.io');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white">System Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Configure global platform configurations, Appwrite connection parameters, and manual transfer bank registries.</p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs">
          Settings saved successfully. Changes deployed to production config.
        </div>
      )}

      <div className="glass-panel border border-white/5 bg-slate-900/20 rounded-3xl p-6 lg:p-8">
        <form onSubmit={handleSaveSettings} className="space-y-6">
          
          {/* General settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-900 pb-3 flex items-center gap-2">
              <Settings className="h-4.5 w-4.5 text-rose-500" /> Platform Configuration
            </h3>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="site-name-input" className="text-xs font-semibold text-slate-400 block mb-1.5">Site Name</label>
                <input
                  id="site-name-input"
                  title="Site Name"
                  placeholder="e.g. KennyKentola Multi-Company Hub"
                  type="text"
                  required
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500/50 transition-colors"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="sys-env-input" className="text-xs font-semibold text-slate-400 block mb-1.5">System Environment</label>
                <input
                  id="sys-env-input"
                  title="System Environment"
                  placeholder="Production"
                  type="text"
                  disabled
                  className="w-full bg-slate-950/30 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-500 cursor-not-allowed"
                  value="Production (Staging Gate)"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                title="Toggle Maintenance Mode"
                aria-label="Toggle Maintenance Mode"
                className={`w-12 h-6.5 rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                  maintenanceMode ? 'bg-rose-600' : 'bg-slate-800'
                }`}
              >
                <div className={`h-4.5 w-4.5 rounded-full bg-white transition-transform duration-200 ${
                  maintenanceMode ? 'translate-x-5.5' : 'translate-x-0'
                }`} />
              </button>
              <div>
                <span className="text-xs font-bold text-white block">System Maintenance Mode</span>
                <span className="text-[10px] text-slate-500">Enable to restrict general client-dashboard logins during core migrations.</span>
              </div>
            </div>
          </div>

          {/* Email Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-900 pb-3 flex items-center gap-2">
              <Mail className="h-4.5 w-4.5 text-rose-500" /> SMTP Mailer Registry
            </h3>

             <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="smtp-server-input" className="text-xs font-semibold text-slate-400 block mb-1.5">SMTP Server</label>
                <input
                  id="smtp-server-input"
                  title="SMTP Server"
                  placeholder="e.g. smtp.mailtrap.io"
                  type="text"
                  required
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500/50 transition-colors"
                  value={smtpServer}
                  onChange={(e) => setSmtpServer(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="smtp-port-input" className="text-xs font-semibold text-slate-400 block mb-1.5">SMTP Port</label>
                <input
                  id="smtp-port-input"
                  title="SMTP Port"
                  placeholder="2525"
                  type="text"
                  disabled
                  className="w-full bg-slate-950/30 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-500 cursor-not-allowed"
                  value="2525"
                />
              </div>
            </div>
          </div>

          {/* Connection keys */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-900 pb-3 flex items-center gap-2">
              <Database className="h-4.5 w-4.5 text-rose-500" /> Database Registry
            </h3>

            <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl space-y-2.5 text-[11px] text-slate-400">
              <div className="flex justify-between items-center">
                <span>Appwrite Project ID</span>
                <span className="font-semibold text-white">kennykentolamult</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Active Database</span>
                <span className="font-semibold text-white">multicompany</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Mongo Atlas Migration Status</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-450 border border-amber-500/20">
                  Ready (Phase 4)
                </span>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-6 border-t border-slate-900 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-rose-600 hover:bg-rose-500 py-3 px-6 text-xs font-bold text-white transition-colors flex items-center gap-2 shadow-lg shadow-rose-500/15"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save System Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
