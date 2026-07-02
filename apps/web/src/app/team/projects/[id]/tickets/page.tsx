'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { teamService } from '../../../../../features/team/teamService';
import { ArrowLeft, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { ProjectTickets } from '../../../../../components/agency/ProjectTickets';

export default function TeamProjectTicketsPage() {
  const { id } = useParams() as { id: string };
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const proj = await teamService.getProject(id);
        setProject(proj);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <div className="p-12 text-center text-slate-400">Loading Tickets...</div>;
  if (!project) return <div>Project not found</div>;

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8 flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-2 text-sm">
            <Link href="/team/dashboard" className="text-slate-500 hover:text-white transition-colors flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <LayoutDashboard className="w-6 h-6 text-indigo-400" />
            {project.title}
          </h1>
          <div className="flex items-center gap-6 mt-4 border-b border-slate-800 pb-2">
            <Link href={`/team/projects/${project.$id}/board`} className="text-sm font-bold border-b-2 border-transparent text-slate-400 hover:text-white pb-2 transition-colors">
              Sprint Board
            </Link>
            <div className="text-sm font-bold border-b-2 border-indigo-500 text-indigo-400 pb-2">
              Support Tickets
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <ProjectTickets projectId={id} />
      </div>

    </div>
  );
}
