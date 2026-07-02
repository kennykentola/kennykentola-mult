'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { teamService } from '../../../features/team/teamService';
import { AgencyProject } from '../../../features/agency/agencyService';
import Link from 'next/link';
import { Briefcase, Code, Clock, MapPin, ChevronRight, LayoutDashboard } from 'lucide-react';

export default function TeamDashboardPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<AgencyProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/team/dashboard');
      return;
    }
    
    // Only team members (Admins, PMs, Developers) should be here.
    if (profile?.role === 'Student' || profile?.role === 'Client') {
      router.push('/dashboard');
      return;
    }

    fetchProjects();
  }, [user, profile]);

  const fetchProjects = async () => {
    try {
      const data = await teamService.getProjects();
      setProjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !user) {
    return <div className="p-12 text-center text-slate-400">Loading Workspace...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Code className="w-8 h-8 text-indigo-400" />
          Developer Workspace
        </h1>
        <p className="text-slate-400 mt-2">Projects you are actively assigned to.</p>
      </div>

      {projects.length === 0 ? (
        <div className="glass-panel border border-slate-800 rounded-xl p-12 text-center bg-slate-900/50">
          <h3 className="text-xl font-bold text-white mb-2">No Active Assignments</h3>
          <p className="text-slate-400">You are not currently assigned to any active agency projects.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <Link key={project.$id} href={`/team/projects/${project.$id}/board`} className="group">
              <div className="h-full glass-panel border border-slate-800 rounded-xl p-6 hover:border-indigo-500/50 hover:bg-slate-900 transition-all bg-slate-900/40 relative overflow-hidden flex flex-col">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/50 group-hover:bg-indigo-500 transition-colors" />
                
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded">
                    {project.projectType}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {project.status.replace('-', ' ')}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
                  {project.title}
                </h3>
                
                <p className="text-sm text-slate-400 line-clamp-2 mb-6 flex-1">
                  {project.description}
                </p>
                
                <div className="flex justify-between items-center border-t border-slate-800/50 pt-4 mt-auto">
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Clock className="w-4 h-4" />
                    Deadline: {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'TBD'}
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
