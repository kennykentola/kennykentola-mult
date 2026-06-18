'use client';

import { useEffect, useState, use } from 'react';
import { useAuth } from '@/lib/auth';
import { client } from '@/lib/appwrite';
import { Databases, Query } from 'appwrite';
import Link from 'next/link';

interface Project {
  $id: string;
  title: string;
  description: string;
  budget: number;
  status: string;
}

interface Milestone {
  $id: string;
  title: string;
  dueDate: string;
  status: string;
}

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && resolvedParams.id) {
      fetchProjectData();
    }
  }, [user, resolvedParams.id]);

  const fetchProjectData = async () => {
    try {
      const databases = new Databases(client);
      const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'multicompany';

      const projectRes = await databases.getDocument(
        databaseId,
        'projects',
        resolvedParams.id
      );
      setProject(projectRes as unknown as Project);

      const milestonesRes = await databases.listDocuments(
        databaseId,
        'project_milestones',
        [Query.equal('projectId', resolvedParams.id)]
      );
      setMilestones(milestonesRes.documents as unknown as Milestone[]);

    } catch (err) {
      console.error('Failed to fetch project details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-muted">Loading project details...</div>;
  if (!project) return <div className="p-8 text-center text-red-400 bg-red-400/10 rounded-xl">Project not found</div>;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/projects" className="text-sm text-muted hover:text-primary transition-colors flex items-center space-x-1 mb-4">
          <span>&larr;</span> <span>Back to Projects</span>
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-primary-foreground tracking-tight">{project.title}</h1>
            <p className="text-muted mt-2 max-w-3xl">{project.description}</p>
          </div>
          <span className={`px-3 py-1 text-xs rounded-full font-medium ${
            project.status === 'completed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
            project.status === 'in-progress' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
            'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
          }`}>
            {project.status.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content: Milestones */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-primary-foreground tracking-tight">Milestones</h2>
          <div className="glass-panel border border-border rounded-xl p-6 space-y-4">
            {milestones.length === 0 ? (
              <p className="text-sm text-muted text-center py-4">No milestones tracked yet.</p>
            ) : (
              milestones.map(m => (
                <div key={m.$id} className="flex justify-between items-center p-4 bg-white/5 border border-border rounded-lg">
                  <div>
                    <h4 className="font-medium text-primary-foreground">{m.title}</h4>
                    <p className="text-xs text-muted mt-1">Due: {new Date(m.dueDate).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                    m.status === 'completed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                    'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                  }`}>
                    {m.status.toUpperCase()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar: Financials & Team */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-primary-foreground tracking-tight">Details</h2>
          <div className="glass-panel border border-border rounded-xl p-6 space-y-6">
            <div>
              <p className="text-xs text-muted uppercase tracking-wider font-semibold">Budget</p>
              <p className="text-2xl font-bold text-primary-foreground mt-1">${project.budget.toLocaleString()}</p>
            </div>
            
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted uppercase tracking-wider font-semibold">Deliverables</p>
              <button className="mt-3 w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-md text-sm font-medium transition-colors">
                View Repository
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
