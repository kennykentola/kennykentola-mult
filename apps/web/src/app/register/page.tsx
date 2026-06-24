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
      academic: { role: 'University Student', purpose: 'academic' },
      thesis: { role: 'University Student', purpose: 'academic' },
      maintenance: { role: 'IT & Maintenance Client', purpose: 'maintenance' },
      solar: { role: 'IT & Maintenance Client', purpose: 'maintenance' },
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

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={() => {
            try {
              const redirectUrl = `${window.location.origin}/dashboard`;
              import('../../lib/appwrite').then(({ account }) => {
                account.createOAuth2Session('google' as any, redirectUrl, `${window.location.origin}/register`);
              });
            } catch (err: any) {
              setError('Google sign-in is not configured yet. Please sign in with email and password.');
            }
          }}
          className="w-full flex items-center justify-center gap-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 py-3 text-sm font-semibold text-white transition-all mb-4"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs text-slate-500">
            <span className="bg-slate-900/50 px-3">or register with email</span>
          </div>
        </div>


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
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">Middle Name (Optional)</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Middle Name"
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                value={(formData as any).middleName || ''}
                onChange={(e) => setFormData({ ...formData, middleName: e.target.value } as any)}
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
                  else if (role === 'University Student') purpose = 'academic';
                  else if (role === 'Client') purpose = 'hire';
                  else if (role === 'IT & Maintenance Client') purpose = 'maintenance';
                  else if (role === 'Printer Operator') purpose = 'print';
                  setFormData({ ...formData, role, purpose });
                }}
              >
                <option value="Student">Student (Academy Portal)</option>
                <option value="University Student">University Student (CS Thesis/Projects)</option>
                <option value="Client">Client (Software Agency)</option>
                <option value="IT & Maintenance Client">Client (IT Maintenance & Solar)</option>
                <option value="Electrician">Electrician / Technician (Worker)</option>
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
                <option value="academic">University Projects / Thesis Help</option>
                <option value="hire">Project / App Build Portal</option>
                <option value="maintenance">IT Maintenance & Solar Portal</option>
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
