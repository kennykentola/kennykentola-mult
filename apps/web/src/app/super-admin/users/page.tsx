'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../features/auth/AuthContext';
import { getSessionJwt } from '../../../lib/sessionJwt';
import { 
  Users, 
  ShieldAlert, 
  CheckCircle2, 
  Loader2,
  X,
  Search,
  MoreVertical,
  Edit2
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

type UserProfile = {
  $id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  $createdAt: string;
};

export default function SuperAdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // For the modal
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [newRole, setNewRole] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const jwt = await getSessionJwt();
      const res = await fetch(`${API_BASE}/super-admin/users`, {
        headers: { Authorization: `Bearer ${jwt}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUsers(data.users || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateRole = async () => {
    if (!selectedUser) return;
    setUpdatingId(selectedUser.userId);
    setError('');
    
    try {
      const jwt = await getSessionJwt();
      const res = await fetch(`${API_BASE}/super-admin/users/${selectedUser.userId}/role`, {
        method: 'PATCH',
        headers: { 
          Authorization: `Bearer ${jwt}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setSuccess(`Role updated to ${newRole} for ${selectedUser.firstName}`);
      setSelectedUser(null);
      fetchUsers();
      
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter(u => 
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
            <Users className="h-3.5 w-3.5" />
            Access Control
          </span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white">User Management</h1>
          <p className="mt-2 text-slate-400 text-sm">
            View all registered users and manage their platform roles.
          </p>
        </div>
        
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search users by name or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-300 flex items-center gap-3">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto" aria-label="Close error"><X className="h-4 w-4" /></button>
        </div>
      )}

      {success && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="rounded-3xl border border-white/5 bg-slate-900/30 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs font-bold uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">User ID</th>
                <th className="px-6 py-4">Current Role</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-500 mb-4" />
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.$id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white shrink-0">
                          {user.firstName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-white">{user.firstName} {user.lastName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">
                      {user.userId}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border
                        ${user.role === 'Super Admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : ''}
                        ${user.role === 'Admin' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : ''}
                        ${user.role === 'Instructor' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : ''}
                        ${user.role === 'Student' ? 'bg-slate-800 text-slate-300 border-slate-700' : ''}
                        ${!['Super Admin', 'Admin', 'Instructor', 'Student'].includes(user.role) ? 'bg-slate-800 text-slate-400 border-slate-700' : ''}
                      `}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(user.$createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => { setSelectedUser(user); setNewRole(user.role); }}
                        className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                        title="Edit Role"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Role Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl p-6 relative">
            <button 
              onClick={() => setSelectedUser(null)}
              className="absolute right-4 top-4 p-2 text-slate-500 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-full transition-colors"
              aria-label="Close modal"
              title="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
            
            <h2 className="text-xl font-bold text-white mb-2">Update User Role</h2>
            <p className="text-sm text-slate-400 mb-6">
              Changing the role for <span className="font-bold text-white">{selectedUser.firstName} {selectedUser.lastName}</span> will immediately affect their platform access.
            </p>

            <div className="space-y-4">
              <div>
                <label htmlFor="role-select" className="block text-xs font-semibold text-slate-400 mb-2">Select New Role</label>
                <select
                  id="role-select"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                  aria-label="Select user role"
                >
                  <option value="Student">Student (Default)</option>
                  <option value="Instructor">Instructor</option>
                  <option value="Printer Operator">Printer Operator</option>
                  <option value="Admin">Admin</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              </div>

              <button
                onClick={handleUpdateRole}
                disabled={updatingId === selectedUser.userId || newRole === selectedUser.role}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {updatingId === selectedUser.userId && <Loader2 className="h-4 w-4 animate-spin" />}
                Confirm Change
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
