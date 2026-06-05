'use client';

import React, { useState } from 'react';
import { Users, Search, Edit2, ShieldCheck, UserMinus, Plus } from 'lucide-react';

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState('Student');
  
  const initialUsers = [
    { id: 'usr-1', name: 'John Doe', email: 'john.doe@example.com', role: 'Student', purpose: 'learn', date: 'June 01, 2026' },
    { id: 'usr-2', name: 'Acme Corp Client', email: 'billing@acme.com', role: 'Client', purpose: 'hire', date: 'June 03, 2026' },
    { id: 'usr-3', name: 'Solar Dave', email: 'dave@solarinstall.com', role: 'Electrician', purpose: 'both', date: 'May 28, 2026' },
    { id: 'usr-4', name: 'Kenny Kentola', email: 'admin@kennykentola.com', role: 'Admin', purpose: 'both', date: 'Jan 10, 2026' }
  ];

  const [usersList, setUsersList] = useState(initialUsers);

  const handleEditRole = (userId: string, currentRole: string) => {
    setEditingUserId(userId);
    setSelectedRole(currentRole);
  };

  const handleSaveRole = (userId: string) => {
    const updated = usersList.map(u => {
      if (u.id === userId) {
        return { ...u, role: selectedRole };
      }
      return u;
    });
    setUsersList(updated);
    setEditingUserId(null);
  };

  const filteredUsers = usersList.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white">Platform Users Directory</h1>
        <p className="text-slate-400 text-sm mt-1">Configure user credentials, assign functional roles, and audit access authorization across the monorepo.</p>
      </div>

      {/* Directory Workspace */}
      <div className="glass-panel border border-white/5 bg-slate-900/20 rounded-3xl p-6 lg:p-8 space-y-6">
        {/* Search & Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-900 pb-6">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500/50 transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">Showing {filteredUsers.length} total members</span>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-900 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-4 px-4">Name / Email</th>
                <th className="py-4 px-4">Role</th>
                <th className="py-4 px-4">Workspace Purpose</th>
                <th className="py-4 px-4">Registration Date</th>
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
                        className="bg-slate-950 border border-slate-800 text-xs rounded px-2.5 py-1 text-white focus:outline-none focus:border-rose-500"
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                      >
                        <option value="Student">Student</option>
                        <option value="Client">Client</option>
                        <option value="Electrician">Electrician</option>
                        <option value="Printer Operator">Printer Operator</option>
                        <option value="Admin">Admin</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        user.role === 'Admin' ? 'bg-rose-500/10 text-rose-450 border border-rose-500/20' :
                        user.role === 'Client' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                        user.role === 'Electrician' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-slate-800 text-slate-450 border border-slate-700'
                      } border`}>
                        {user.role}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 capitalize font-semibold text-slate-400">{user.purpose}</td>
                  <td className="py-4 px-4 text-slate-500">{user.date}</td>
                  <td className="py-4 px-4 text-right">
                    {editingUserId === user.id ? (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleSaveRole(user.id)}
                          className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-1 rounded transition-colors text-[10px]"
                        >
                          Save
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
                        onClick={() => handleEditRole(user.id, user.role)}
                        className="text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1.5 ml-auto text-[10px]"
                      >
                        <Edit2 className="h-3 w-3" /> Edit Role
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
