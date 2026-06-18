'use client';

import React, { useState } from 'react';
import { Settings, Bell, Lock, User, Save, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../../features/auth/AuthContext';

export default function InstructorSettingsPage() {
  const { profile, user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [notifications, setNotifications] = useState({
    newEnrollment: true,
    assignmentSubmitted: true,
    courseReview: true,
    payoutProcessed: true,
    liveSessionReminder: true,
  });

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <span className="inline-flex items-center gap-2 rounded-full border border-slate-500/20 bg-slate-500/10 px-3 py-1 text-xs font-semibold text-slate-300">
          <Settings className="h-3.5 w-3.5" />
          Instructor Settings
        </span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white">Settings</h1>
        <p className="mt-2 text-slate-400 text-sm">Manage your instructor preferences and notifications.</p>
      </div>

      {saved && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          Settings saved successfully!
        </div>
      )}

      {/* Profile Info */}
      <div className="rounded-3xl border border-white/5 bg-slate-900/20 p-6 space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-900">
          <User className="h-5 w-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-white">Account Information</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="first-name" className="block text-xs font-semibold text-slate-400 mb-1.5">First Name</label>
            <input
              id="first-name"
              defaultValue={profile?.firstName || ''}
              readOnly
              className="w-full rounded-xl border border-white/5 bg-slate-900/60 px-4 py-3 text-sm text-slate-300 cursor-not-allowed"
            />
          </div>
          <div>
            <label htmlFor="last-name" className="block text-xs font-semibold text-slate-400 mb-1.5">Last Name</label>
            <input
              id="last-name"
              defaultValue={profile?.lastName || ''}
              readOnly
              className="w-full rounded-xl border border-white/5 bg-slate-900/60 px-4 py-3 text-sm text-slate-300 cursor-not-allowed"
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="email" className="block text-xs font-semibold text-slate-400 mb-1.5">Email Address</label>
            <input
              id="email"
              defaultValue={user?.email || ''}
              readOnly
              className="w-full rounded-xl border border-white/5 bg-slate-900/60 px-4 py-3 text-sm text-slate-300 cursor-not-allowed"
            />
          </div>
        </div>
        <p className="text-xs text-slate-600">Contact admin to update your name or email.</p>
      </div>

      {/* Notification Preferences */}
      <div className="rounded-3xl border border-white/5 bg-slate-900/20 p-6 space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-900">
          <Bell className="h-5 w-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-white">Notification Preferences</h2>
        </div>
        <div className="space-y-3">
          {([
            { key: 'newEnrollment', label: 'New Student Enrollment', desc: 'When a student enrolls in your course' },
            { key: 'assignmentSubmitted', label: 'Assignment Submitted', desc: 'When a student submits an assignment for grading' },
            { key: 'courseReview', label: 'Course Review Request', desc: 'When admin requests changes to your course' },
            { key: 'payoutProcessed', label: 'Payout Processed', desc: 'When your monthly earnings are transferred' },
            { key: 'liveSessionReminder', label: 'Live Session Reminder', desc: '1 hour before a scheduled live class' },
          ] as const).map((item) => {
            const checked = notifications[item.key];
            return (
              <div key={item.key} className="flex items-center justify-between py-3 border-b border-slate-900/60 last:border-0">
                <div>
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
                <button
                  id={`toggle-${item.key}`}
                  type="button"
                  role="switch"
                  aria-label={`Toggle ${item.label}`}
                  {...{ 'aria-checked': checked }}
                  onClick={() => setNotifications((n) => ({ ...n, [item.key]: !checked }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    checked ? 'bg-indigo-600' : 'bg-slate-700'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                    checked ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Security */}
      <div className="rounded-3xl border border-white/5 bg-slate-900/20 p-6 space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-900">
          <Lock className="h-5 w-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-white">Security</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label htmlFor="current-password" className="block text-xs font-semibold text-slate-400 mb-1.5">Current Password</label>
            <input
              type="password"
              id="current-password"
              placeholder="••••••••"
              className="w-full rounded-xl border border-white/5 bg-slate-900/60 px-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none transition-all"
            />
          </div>
          <div>
            <label htmlFor="new-password" className="block text-xs font-semibold text-slate-400 mb-1.5">New Password</label>
            <input
              type="password"
              id="new-password"
              placeholder="••••••••"
              className="w-full rounded-xl border border-white/5 bg-slate-900/60 px-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button
          id="btn-save-settings"
          onClick={handleSave}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-6 py-3 text-sm font-bold text-white transition-all shadow-lg shadow-indigo-500/20"
        >
          <Save className="h-4 w-4" />
          Save Settings
        </button>
      </div>
    </div>
  );
}
