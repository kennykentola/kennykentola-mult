'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, UserPlus, Shield, User, Mail, Lock, Phone, Eye, EyeOff } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    role: 'Student',
    purpose: 'learn'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const portal = params.get('portal') || params.get('purpose');

    if (!portal) {
      return;
    }

    const portalPreset: Record<string, { role: string; purpose: 'learn' | 'hire' | 'print' | 'both' }> = {
      academy: { role: 'Student', purpose: 'learn' },
      learn: { role: 'Student', purpose: 'learn' },
      print: { role: 'Printer Operator', purpose: 'print' },
      printing: { role: 'Printer Operator', purpose: 'print' },
      hire: { role: 'Client', purpose: 'hire' },
      project: { role: 'Client', purpose: 'hire' },
      projects: { role: 'Client', purpose: 'hire' },
      app: { role: 'Client', purpose: 'hire' },
      all: { role: 'Student', purpose: 'both' }
    };

    const preset = portalPreset[portal];
    if (preset) {
      setFormData((current) => ({
        ...current,
        role: preset.role,
        purpose: preset.purpose
      }));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-950 p-6 font-sans">
      {/* Background Glare */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[120px]" />

      <div className="relative z-10 w-full max-w-md glass-panel rounded-2xl p-8 border border-white/10 shadow-2xl bg-slate-900/50 backdrop-blur-md">
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4">
            <UserPlus className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-white">Create your Account</h2>
          <p className="text-sm text-slate-400 mt-2">
            Join the KennyKentola Multi-Company Platform and choose the portal you want first.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
            Account created successfully! Redirecting to login...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">First Name</label>
              <input
                type="text"
                required
                placeholder="John"
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div className="relative">
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">Last Name</label>
              <input
                type="text"
                required
                placeholder="Doe"
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                placeholder="john.doe@example.com"
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
              <input
                type="tel"
                placeholder="+234 80 1234 5678"
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-500 hover:text-slate-300 transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="role-select" className="text-xs font-semibold text-slate-400 block mb-1.5">Register As</label>
              <select
                id="role-select"
                title="Register As"
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                value={formData.role}
                onChange={(e) => {
                  const role = e.target.value;
                  let purpose = formData.purpose;
                  if (role === 'Student') purpose = 'learn';
                  else if (role === 'Client') purpose = 'hire';
                  else if (role === 'Printer Operator') purpose = 'print';
                  setFormData({ ...formData, role, purpose });
                }}
              >
                <option value="Student">Student (Academy Portal)</option>
                <option value="Client">Client (Agency & Solar Contracts)</option>
                <option value="Electrician">Electrician / Technician</option>
                <option value="Printer Operator">Printer Operator (Printing Portal)</option>
              </select>
            </div>
            <div>
              <label htmlFor="purpose-select" className="text-xs font-semibold text-slate-400 block mb-1.5">Primary Purpose</label>
              <select
                id="purpose-select"
                title="Primary Purpose"
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              >
                <option value="learn">Academy Portal</option>
                <option value="hire">Project / App Build Portal</option>
                <option value="print">Printing Portal</option>
                <option value="both">All Services Portal</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-6"
          >
            {loading ? 'Creating Account...' : 'Register'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-slate-400">
          Already have an account?{' '}
          <a href="/login" className="text-indigo-400 font-semibold hover:underline">
            Login
          </a>
        </div>
      </div>
    </div>
  );
}
