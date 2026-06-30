'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchLearningPaths, deleteLearningPath, LearningPath } from '../../../features/academy/learningPathsApi';
import { Plus, Edit2, Trash2, Layout, Server, Blocks, Code, MonitorSmartphone, Brush, BrainCircuit } from 'lucide-react';

const ICONS = {
  Layout, Server, Blocks, Code, MonitorSmartphone, Brush, BrainCircuit
};

export default function AdminLearningPaths() {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPaths();
  }, []);

  const loadPaths = async () => {
    try {
      setIsLoading(true);
      const data = await fetchLearningPaths();
      setPaths(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await deleteLearningPath(id);
      setPaths(paths.filter(p => p.$id !== id));
    } catch (err: any) {
      alert(`Error deleting: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Learning Paths</h1>
          <p className="text-slate-400">Manage academy learning paths and curriculum.</p>
        </div>
        <Link 
          href="/admin/learning-paths/new"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" /> Add Path
        </Link>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl">
          {error}
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400">Loading paths...</div>
        ) : paths.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No learning paths found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-medium">Path Title</th>
                  <th className="px-6 py-4 font-medium">Slug</th>
                  <th className="px-6 py-4 font-medium">Duration</th>
                  <th className="px-6 py-4 font-medium">Level</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {paths.map((path) => {
                  const Icon = (ICONS as any)[path.iconName] || Layout;
                  return (
                    <tr key={path.$id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-slate-800 border border-slate-700`}>
                            <Icon className="w-4 h-4 text-slate-300" />
                          </div>
                          <span className="font-medium text-white">{path.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-400 font-mono text-sm">{path.slug}</td>
                      <td className="px-6 py-4 text-slate-300">{path.duration}</td>
                      <td className="px-6 py-4 text-slate-300">
                        <span className="bg-slate-800 px-2 py-1 rounded text-xs">{path.level}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/learning-paths/${path.$id}`}
                            title="Edit Path"
                            aria-label="Edit Path"
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            title="Delete Path"
                            aria-label="Delete Path"
                            onClick={() => handleDelete(path.$id!, path.title)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
