/* eslint-disable react/forbid-dom-props */
'use client';

import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { agencyService, AgencyProject } from '../../../../features/agency/agencyService';
import { useAuth } from '../../../../features/auth/AuthContext';
import { Loader2, Briefcase, Mail, CheckCircle2, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const PIPELINE_STAGES = ['Lead', 'Contacted', 'Proposal', 'Negotiation', 'Won', 'Lost'];

export default function AgencyCRMPage() {
  const { profile } = useAuth();
  const [projects, setProjects] = useState<AgencyProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    async function loadProjects() {
      try {
        const data = await agencyService.getAllProjectsAdmin();
        setProjects(data);
      } catch (err: any) {
        toast.error('Failed to load projects');
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, []);

  const getProjectsByStage = (stage: string) => {
    return projects.filter(p => (p.pipelineStage || 'Lead') === stage);
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const newStage = destination.droppableId;
    const project = projects.find(p => p.$id === draggableId);
    
    if (!project || project.pipelineStage === newStage) return;

    // Optimistic UI update
    setProjects(prev => prev.map(p => p.$id === draggableId ? { ...p, pipelineStage: newStage } : p));
    setUpdating(draggableId);

    try {
      await agencyService.updateProjectAdmin(draggableId, { pipelineStage: newStage });
      toast.success(`Moved to ${newStage}`);
    } catch (err: any) {
      // Revert on failure
      setProjects(prev => prev.map(p => p.$id === draggableId ? { ...p, pipelineStage: source.droppableId } : p));
      toast.error(err.message || 'Failed to update pipeline stage');
    } finally {
      setUpdating(null);
    }
  };

  if (!profile || (profile.role !== 'Admin' && profile.role !== 'Super Admin')) {
    return <div>Unauthorized</div>;
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <Briefcase className="w-8 h-8 text-indigo-400" />
          Agency CRM Pipeline
        </h1>
        <p className="text-slate-400 mt-2">Drag and drop leads through the sales pipeline.</p>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-8 snap-x">
        <DragDropContext onDragEnd={handleDragEnd}>
          {PIPELINE_STAGES.map(stage => {
            const stageProjects = getProjectsByStage(stage);
            return (
              <div key={stage} className="flex-shrink-0 w-80 flex flex-col snap-start">
                <div className="flex items-center justify-between mb-4 px-2">
                  <h3 className="font-semibold text-slate-300 uppercase tracking-wider text-sm">{stage}</h3>
                  <span className="bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full font-medium">
                    {stageProjects.length}
                  </span>
                </div>
                
                <Droppable droppableId={stage}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 rounded-2xl p-3 transition-colors min-h-[500px] border ${
                        snapshot.isDraggingOver 
                          ? 'bg-indigo-500/10 border-indigo-500/30' 
                          : 'bg-slate-900/40 border-slate-800/50'
                      }`}
                    >
                      <div className="space-y-3">
                        {stageProjects.map((project, index) => (
                          <Draggable key={project.$id} draggableId={project.$id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`bg-slate-950 border rounded-xl p-4 transition-all shadow-xl ${
                                    snapshot.isDragging 
                                      ? 'border-indigo-500/50 shadow-indigo-500/10 scale-105 z-50' 
                                      : 'border-slate-800 hover:border-slate-700'
                                  } ${updating === project.$id ? 'opacity-50' : ''}`}
                                  style={{ ...provided.draggableProps.style }} // NOSONAR
                                >
                                <div className="flex justify-between items-start mb-2">
                                  <span className="text-[10px] font-bold tracking-wider uppercase bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                                    {project.projectType}
                                  </span>
                                  {project.budget ? (
                                    <span className="text-xs font-semibold text-emerald-400">
                                      ${project.budget.toLocaleString()}
                                    </span>
                                  ) : null}
                                </div>
                                <h4 className="font-semibold text-white text-sm mb-2">{project.title}</h4>
                                
                                <div className="bg-slate-900/50 rounded-lg p-2 mb-3 border border-slate-800/50">
                                  <div className="text-xs text-slate-300 font-medium">{project.clientName || 'Unknown Client'}</div>
                                  <div className="text-[10px] text-slate-500 truncate">{project.clientEmail || 'No email provided'}</div>
                                </div>
                                
                                <div className="flex items-center justify-between mt-4 text-xs text-slate-500">
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    {new Date(project.$createdAt).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </DragDropContext>
      </div>
    </div>
  );
}
