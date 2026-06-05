'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { account } from '../../lib/appwrite';

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
  role: string;
  purpose: 'learn' | 'hire' | 'print' | 'both';
  avatarUrl?: string;
  enrollments?: string[];
  activeProjects?: string[];
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
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

      const res = await fetch('http://localhost:5000/api/v1/auth/profile', {
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
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setUser(null);
      setProfile(null);
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
      await account.createEmailPasswordSession(email, password);
      await fetchProfile();
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
