'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { client } from '@/lib/appwrite';
import { Databases, Query } from 'appwrite';
import Link from 'next/link';
import { StudentProject } from '@company/shared';

export default function AcademicDashboardPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<StudentProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      const databases = new Databases(client);
      const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'multicompany';

      const res = await databases.listDocuments(dbId, 'student_projects', [
        Query.equal('studentId', user!.$id),
        Query.orderDesc('$createdAt')
      ]);

      setProjects(res.documents as unknown as StudentProject[]);
    } catch (err) {
      console.error('Failed to fetch student projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = (status: StudentProject['status']) => {
    switch (status) {
      case 'pending-proposal': return { label: 'Proposal Review', color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' };
      case 'proposal-approved': return { label: 'Approved / Quoting', color: 'bg-blue-500/20 text-blue-500 border-blue-500/30' };
      case 'document-drafting': return { label: 'Drafting Docs', color: 'bg-purple-500/20 text-purple-500 border-purple-500/30' };
      case 'code-development': return { label: 'Development Phase', color: 'bg-indigo-500/20 text-indigo-500 border-indigo-500/30' };
      case 'completed': return { label: 'Completed', color: 'bg-green-500/20 text-green-500 border-green-500/30' };
      default: return { label: 'Unknown', color: 'bg-white/10 text-muted border-white/20' };
    }
  };

  if (loading) return <div className="p-8 text-center text-muted">Loading Academic Dashboard...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary-foreground tracking-tight">Academic Projects</h1>
          <p className="text-muted mt-1 text-sm">Request capstone development, thesis assistance, or assignment help.</p>
        </div>
        <Link 
          href="/dashboard/academic/new" 
          className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(var(--primary),0.3)]"
        >
          + Request Project
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {projects.length === 0 ? (
          <div className="glass-panel border border-border rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">🎓</div>
            <h3 className="text-xl font-bold text-primary-foreground mb-2">No active academic projects</h3>
            <p className="text-muted mb-6">Submit your project requirements and let our experts assist you with the development.</p>
            <Link 
              href="/dashboard/academic/new" 
              className="text-primary hover:underline font-medium"
            >
              Start a Request &rarr;
            </Link>
          </div>
        ) : (
          projects.map(project => {
            const statusInfo = getStatusDisplay(project.status);
            return (
              <div key={project.$id} className="glass-panel border border-border rounded-xl p-6 hover:border-primary/30 transition-colors">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-primary-foreground">{project.title}</h3>
                    <div className="text-sm text-muted mt-1">
                      {(project as any).universityName ? `${(project as any).universityName} • ` : ''}
                      {(project as any).department || 'General'}
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusInfo.color}`}>
                    {statusInfo.label}
                  </div>
                </div>

                <p className="text-sm text-muted line-clamp-2 mb-6">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-4 items-center justify-between border-t border-border pt-4">
                  <div className="text-sm">
                    <span className="text-muted">Price Quote: </span>
                    <span className="font-semibold text-primary-foreground">
                      {project.price > 0 ? `$${project.price.toFixed(2)}` : 'Pending'}
                    </span>
                  </div>

                  <div className="flex gap-3">
                    {project.proposalUrl && (
                      <a href={project.proposalUrl} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">
                        View Proposal
                      </a>
                    )}
                    {project.sourceCodeUrl && (
                      <a href={project.sourceCodeUrl} target="_blank" rel="noreferrer" className="text-sm text-green-500 hover:underline">
                        Download Code
                      </a>
                    )}
                    {(project as any).deliverableUrl && (
                      <a href={(project as any).deliverableUrl} target="_blank" rel="noreferrer" className="text-sm text-indigo-400 hover:underline font-bold px-3 py-1 bg-indigo-500/10 rounded-md border border-indigo-500/20">
                        View Final Deliverable
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
