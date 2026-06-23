'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { client } from '@/lib/appwrite';
import { Databases, Query } from 'appwrite';
import Link from 'next/link';

// Assuming shared types exist in the package, we'll mock the interface here for the page context
interface Project {
  $id: string;
  title: string;
  budget: number;
  status: string;
}

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      const databases = new Databases(client);
      const role = (user?.prefs as any)?.role || 'Client';
      const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'multicompany';

      let queries = [];
      // Clients only see their projects. Admins see all.
      if (role === 'Client') {
        queries.push(Query.equal('clientId', user!.$id));
      }

      const response = await databases.listDocuments(
        databaseId,
        'projects',
        queries
      );

      setProjects(response.documents as unknown as Project[]);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary-foreground tracking-tight">Agency Projects</h1>
          <p className="text-muted mt-1 text-sm">Manage and track active software development cycles.</p>
        </div>
        {((user?.prefs as any)?.role === 'Super Admin' || (user?.prefs as any)?.role === 'Project Manager') && (
          <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition-colors">
            New Project
          </button>
        )}
      </div>

      <div className="glass-panel border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="p-8 text-center text-muted">No projects found.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-white/5">
                <th className="px-6 py-4 text-sm font-semibold text-primary-foreground">Project Title</th>
                <th className="px-6 py-4 text-sm font-semibold text-primary-foreground">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-primary-foreground">Budget</th>
                <th className="px-6 py-4 text-sm font-semibold text-primary-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {projects.map((p) => (
                <tr key={p.$id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-medium text-primary-foreground">{p.title}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                      p.status === 'completed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                      p.status === 'in-progress' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                      'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                    }`}>
                      {p.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted">
                    ${p.budget.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/dashboard/projects/${p.$id}`} className="text-sm font-medium text-primary hover:underline">
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
