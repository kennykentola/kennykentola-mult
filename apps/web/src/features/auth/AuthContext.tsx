'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { account } from '../../lib/appwrite';
import { clearSessionJwt, setSessionJwt } from '../../lib/sessionJwt';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Profile {
  $id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role?: 'Super Admin' | 'Admin' | 'Instructor' | 'Printer Operator' | 'Mentor' | null;
  purpose: 'learn' | 'hire' | 'print' | 'both' | 'academic' | 'maintenance';
  avatarUrl?: string;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  enrollments?: string[];
  activeProjects?: string[];
  clientType?: 'academic' | 'commercial';
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<Profile | null>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<Profile | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      const jwtSession = await account.createJWT();
      const jwt = jwtSession.jwt;
      setSessionJwt(jwt);

      // Sync JWT with Next.js httpOnly cookie
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jwt })
      });

      const res = await fetch(`${API_BASE}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const data = await res.json();
      setUser(data.user);
      setProfile(data.profile);
      return data.profile as Profile;
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      clearSessionJwt();
      setUser(null);
      setProfile(null);
      return null;
    }
  };

  const checkUserSession = async () => {
    try {
      setLoading(true);
      setError(null);
      // Check if session exists in Appwrite
      const currentAccount = await account.get();
      if (currentAccount) {
        await fetchProfile();
      }
    } catch (err: any) {
      // No active session
      clearSessionJwt();
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUserSession();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      try {
        await account.createEmailPasswordSession(email, password);
      } catch (err: any) {
        if (err.code === 400 || err.code === 401 || err.message?.includes('active') || err.message?.includes('guests')) {
          try {
            await account.deleteSession('current');
          } catch (deleteErr) {
            // Ignore error from session deletion
          }
          // Now that old session is deleted, try creating again
          await account.createEmailPasswordSession(email, password);
        } else {
          throw err;
        }
      }
      return await fetchProfile();
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await account.deleteSession('current');
      
      // Clear Next.js cookie
      await fetch('/api/auth/session', { method: 'DELETE' });

      clearSessionJwt();
      setUser(null);
      setProfile(null);
    } catch (err: any) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        error,
        login,
        logout,
        refreshProfile: fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
