'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../features/auth/AuthContext';
import { LogIn, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const { profile, login, error: authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const getPostLoginRoute = (userPurpose?: string) => {
    if (userPurpose === 'learn' || userPurpose === 'both') {
      return '/student/dashboard';
    }

    if (userPurpose === 'print') {
      return '/dashboard/printing';
    }

    if (userPurpose === 'hire') {
      return '/dashboard/projects';
    }

    return '/dashboard';
  };

  useEffect(() => {
    if (profile) {
      router.push(getPostLoginRoute(profile.purpose));
    }
  }, [profile, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const signedInProfile = await login(email, password);
      router.push(getPostLoginRoute(signedInProfile?.purpose || profile?.purpose));
    } catch (err: any) {
      console.error('[Login Flow] Error:', err.message);
      setError(err.message || 'Authentication failed. Please check your credentials.');
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
            <LogIn className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
          <p className="text-sm text-slate-400 mt-2">Sign in to your dashboard</p>
        </div>

        {(error || authError) && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
            {error || authError}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                placeholder="john.doe@example.com"
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-6"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-slate-400">
          Don't have an account?{' '}
          <a href="/register" className="text-indigo-400 font-semibold hover:underline">
            Register
          </a>
        </div>
      </div>
    </div>
  );
}
