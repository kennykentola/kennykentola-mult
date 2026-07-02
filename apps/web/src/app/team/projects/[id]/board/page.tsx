'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { teamService, TeamSprint, TeamTask } from '../../../../../features/team/teamService';
import { agencyService, AgencyProject } from '../../../../../features/agency/agencyService';
import { useAuth } from '@/lib/auth';
import { Loader2, ArrowLeft, Plus, Clock, LayoutDashboard, Search, ListTodo } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

const BOARD_COLUMNS = [
  { id: 'todo', title: 'To Do', color: 'bg-slate-800 border-slate-700' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-indigo-900/40 border-indigo-500/30' },
  { id: 'review', title: 'Code Review', color: 'bg-yellow-900/30 border-yellow-500/30' },
  { id: 'done', title: 'Done', color: 'bg-emerald-900/30 border-emerald-500/30' }
];

export default function SprintBoardPage() {
  const params = useParams();
  const projectId = params?.id as string;
  const router = useRouter();
  const { user } = useAuth();
  
  const [project, setProject] = useState<AgencyProject | null>(null);
  const [sprints, setSprints] = useState<TeamSprint[]>([]);
  const [activeSprintId, setActiveSprintId] = useState<string>('');
  const [tasks, setTasks] = useState<TeamTask[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  // Modals
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', storyPoints: 0 });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadBoardData();
  }, [user, projectId]);

  const loadBoardData = async () => {
    try {
      // Use existing admin method if admin, or we need a standard getProject method
      // Actually we'll use agencyService.getProject(projectId) which we have!
      const pData = await agencyService.getProject(projectId);
      setProject(pData.project);

      const sps = await teamService.getSprints(projectId);
      setSprints(sps);
      const active = sps.find(s => s.status === 'active') || sps[0];
      if (active) setActiveSprintId(active.$id);

      const tks = await teamService.getTasks(projectId);
      setTasks(tks);
    } catch (err: any) {
      toast.error('Failed to load board data');
      router.push('/team/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId) return;

    const newStatus = destination.droppableId as any;
    const task = tasks.find(t => t.$id === draggableId);
    if (!task) return;

    // Optimistic Update
    setTasks(prev => prev.map(t => t.$id === draggableId ? { ...t, status: newStatus } : t));
    setUpdating(draggableId);

    try {
      await teamService.updateTaskStatus(draggableId, { status: newStatus });
    } catch (err) {
      // Revert
      setTasks(prev => prev.map(t => t.$id === draggableId ? { ...t, status: source.droppableId as any } : t));
      toast.error('Failed to move task');
    } finally {
      setUpdating(null);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title) return;

    try {
      const created = await teamService.createTask({
        projectId,
        sprintId: activeSprintId,
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority as any,
        storyPoints: newTask.storyPoints || 0
      });
      setTasks([created, ...tasks]);
      setShowTaskModal(false);
      setNewTask({ title: '', description: '', priority: 'medium', storyPoints: 0 });
      toast.success('Task created');
    } catch (err) {
      toast.error('Failed to create task');
    }
  };

  const activeTasks = tasks.filter(t => t.sprintId === activeSprintId);

  if (loading) return <div className="p-12 text-center text-slate-400">Loading Sprint Board...</div>;
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
            <div className="text-sm font-bold border-b-2 border-indigo-500 text-indigo-400 pb-2">
              Sprint Board
            </div>
            <Link href={`/team/projects/${project.$id}/tickets`} className="text-sm font-bold border-b-2 border-transparent text-slate-400 hover:text-white pb-2 transition-colors">
              Support Tickets
            </Link>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <select 
              title="Select Sprint"
              value={activeSprintId}
              onChange={(e) => setActiveSprintId(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-white text-sm rounded-lg px-3 py-1.5 focus:border-indigo-500 outline-none"
            >
              <option value="">Backlog (No Sprint)</option>
              {sprints.map(s => (
                <option key={s.$id} value={s.$id}>{s.title} ({s.status})</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => setShowTaskModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex h-full gap-6">
            {BOARD_COLUMNS.map(column => {
              const columnTasks = activeTasks.filter(t => t.status === column.id);
              return (
                <div key={column.id} className={`flex flex-col w-80 shrink-0 rounded-2xl border ${column.color} bg-slate-900/20 backdrop-blur-sm overflow-hidden`}>
                  <div className="p-3 border-b border-inherit bg-black/20 flex justify-between items-center shrink-0">
                    <h3 className="font-bold text-slate-200 text-sm">{column.title}</h3>
                    <span className="bg-black/40 text-slate-400 text-xs px-2 py-0.5 rounded-full">{columnTasks.length}</span>
                  </div>
                  
                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 p-3 overflow-y-auto ${snapshot.isDraggingOver ? 'bg-white/5' : ''}`}
                      >
                        <div className="space-y-3 min-h-[50px]">
                          {columnTasks.map((task, index) => (
                            <Draggable key={task.$id} draggableId={task.$id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-600 transition-colors ${
                                    snapshot.isDragging ? 'shadow-xl shadow-indigo-500/20 rotate-2 z-50' : ''
                                  } ${updating === task.$id ? 'opacity-50' : ''}`}
                                  style={{ ...provided.draggableProps.style }}
                                >
                                  <div className="flex justify-between items-start mb-2 gap-2">
                                    <h4 className="font-semibold text-white text-sm leading-snug">{task.title}</h4>
                                  </div>
                                  
                                  {task.description && (
                                    <p className="text-xs text-slate-500 line-clamp-2 mb-3">{task.description}</p>
                                  )}
                                  
                                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-800/50">
                                    <div className="flex items-center gap-2">
                                      <span className={`w-2 h-2 rounded-full ${
                                        task.priority === 'urgent' ? 'bg-rose-500' :
                                        task.priority === 'high' ? 'bg-orange-500' :
                                        task.priority === 'medium' ? 'bg-blue-500' : 'bg-slate-500'
                                      }`} title={`Priority: ${task.priority}`} />
                                      {task.storyPoints ? (
                                        <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">{task.storyPoints} pt</span>
                                      ) : null}
                                    </div>
                                    
                                    {task.assigneeId && (
                                      <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center text-[10px] text-indigo-300 font-bold" title="Assignee">
                                        DV
                                      </div>
                                    )}
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
          </div>
        </DragDropContext>
      </div>

      {/* Task Creation Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <ListTodo className="w-5 h-5 text-indigo-400" /> New Task
              </h3>
              <button onClick={() => setShowTaskModal(false)} className="text-slate-500 hover:text-white">&times;</button>
            </div>
            
            <form onSubmit={handleCreateTask} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Task Title</label>
                <input 
                  autoFocus required type="text" 
                  value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:border-indigo-500 outline-none" 
                  placeholder="e.g. Implement authentication flow"
                />
              </div>
              
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Description</label>
                <textarea 
                  rows={3}
                  value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:border-indigo-500 outline-none resize-none" 
                  placeholder="Add details, acceptance criteria..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Priority</label>
                  <select 
                    title="Task Priority"
                    value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:border-indigo-500 outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Story Points</label>
                  <input 
                    title="Story Points"
                    placeholder="0"
                    type="number" min="0" step="1"
                    value={newTask.storyPoints} onChange={e => setNewTask({...newTask, storyPoints: Number(e.target.value)})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:border-indigo-500 outline-none" 
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowTaskModal(false)} className="px-4 py-2 text-slate-300 hover:text-white font-medium">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors">
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
