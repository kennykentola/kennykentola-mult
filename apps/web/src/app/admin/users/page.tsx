'use client';

import React, { useState, useEffect } from 'react';
import { Users, Search, Edit2, ShieldCheck, UserMinus, Plus, AlertCircle, RefreshCw } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('session_jwt') : null;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(data.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export default function AdminUsersPage() {
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Editing state form
  const [editForm, setEditForm] = useState({
    role: 'Student',
    purpose: 'learn',
    clientType: 'commercial'
  });
  
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchWithAuth(`${API_BASE}/auth/admin/users`);
      setUsersList(data.users || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: any) => {
    setEditingUserId(user.id);
    setEditForm({
      role: user.role,
      purpose: user.purpose || 'learn',
      clientType: user.clientType || 'commercial'
    });
  };

  const handleSave = async (profileId: string) => {
    setSubmitting(true);
    setError('');
    try {
      await fetchWithAuth(`${API_BASE}/auth/admin/users/${profileId}/role`, {
        method: 'PATCH',
        body: JSON.stringify(editForm)
      });
      setEditingUserId(null);
      await loadUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to update user profile.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = usersList.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Platform Users Directory</h1>
          <p className="text-slate-400 text-sm mt-1">Configure user credentials, assign functional roles, and audit access authorization across the monorepo.</p>
        </div>
        <button 
          onClick={loadUsers} 
          disabled={loading}
          className="rounded-xl border border-slate-805 bg-slate-900/60 hover:bg-slate-900 px-4 py-2.5 text-xs text-slate-300 font-semibold flex items-center justify-center gap-2 self-start sm:self-auto transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Directory Workspace */}
      <div className="glass-panel border border-white/5 bg-slate-900/20 rounded-3xl p-6 lg:p-8 space-y-6">
        {/* Search & Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-900 pb-6">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name, email, or role..."
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">Showing {filteredUsers.length} total members</span>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-sm animate-pulse">Loading directory data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-900 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-4 px-4">Name / Email</th>
                  <th className="py-4 px-4">Role</th>
                  <th className="py-4 px-4">Portal Purpose</th>
                  <th className="py-4 px-4">Client Type</th>
                  <th className="py-4 px-4">Registration</th>
                  <th className="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/50">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-900/25 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-semibold text-white">{user.name}</div>
                      <div className="text-slate-500 text-[10px] mt-0.5">{user.email}</div>
                    </td>
                    <td className="py-4 px-4">
                      {editingUserId === user.id ? (
                        <select
                          title="Configure Role"
                          className="bg-slate-950 border border-slate-800 text-xs rounded px-2.5 py-1 text-white focus:outline-none focus:border-indigo-500"
                          value={editForm.role}
                          onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                        >
                          <option value="Student">Student</option>
                          <option value="Instructor">Instructor</option>
                          <option value="Client">Client</option>
                          <option value="Electrician">Electrician</option>
                          <option value="Printer Operator">Printer Operator</option>
                          <option value="Admin">Admin</option>
                          <option value="Super Admin">Super Admin</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          user.role === 'Super Admin' || user.role === 'Admin' ? 'bg-rose-500/10 text-rose-450 border border-rose-500/20' :
                          user.role === 'Instructor' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                          user.role === 'Client' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                          user.role === 'Electrician' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-slate-800 text-slate-450 border border-slate-700'
                        } border`}>
                          {user.role}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {editingUserId === user.id ? (
                        <select
                          title="Configure Purpose"
                          className="bg-slate-950 border border-slate-800 text-xs rounded px-2.5 py-1 text-white focus:outline-none focus:border-indigo-500"
                          value={editForm.purpose}
                          onChange={(e) => setEditForm({ ...editForm, purpose: e.target.value })}
                        >
                          <option value="learn">learn (Academy)</option>
                          <option value="hire">hire (Projects)</option>
                          <option value="print">print (Printing)</option>
                          <option value="both">both (All Portals)</option>
                        </select>
                      ) : (
                        <span className="capitalize font-semibold text-slate-400">{user.purpose}</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {editingUserId === user.id ? (
                        <select
                          title="Configure Client Type"
                          className="bg-slate-950 border border-slate-800 text-xs rounded px-2.5 py-1 text-white focus:outline-none focus:border-indigo-500"
                          value={editForm.clientType}
                          onChange={(e) => setEditForm({ ...editForm, clientType: e.target.value })}
                        >
                          <option value="academic">Academic (Thesis Project)</option>
                          <option value="commercial">Commercial (Enterprise Contract)</option>
                        </select>
                      ) : (
                        <span className={`capitalize font-semibold ${user.clientType === 'academic' ? 'text-indigo-400' : 'text-slate-500'}`}>
                          {user.clientType || 'commercial'}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-slate-500">{user.date}</td>
                    <td className="py-4 px-4 text-right">
                      {editingUserId === user.id ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleSave(user.id)}
                            disabled={submitting}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-1 rounded transition-colors text-[10px]"
                          >
                            {submitting ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={() => setEditingUserId(null)}
                            className="bg-slate-900 border border-slate-800 text-slate-400 hover:text-white font-bold px-3 py-1 rounded transition-colors text-[10px]"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1.5 ml-auto text-[10px]"
                        >
                          <Edit2 className="h-3 w-3" /> Edit Profile
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
