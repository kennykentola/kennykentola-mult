'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  fetchAcademicProjectById, updateMentorProject, sendAcademicMessage,
  fetchProjectTasks, createProjectTask, updateProjectTask, deleteProjectTask,
  AcademicProjectDto, AcademicMessageDto, AcademicTaskDto
} from '../../../../features/academic/academicService';
import { 
  GraduationCap, Loader2, ArrowLeft, CheckCircle2, 
  Code, FileText, Upload, Download, MessageSquare, Send, Settings
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function MentorAcademicProjectDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [project, setProject] = useState<AcademicProjectDto | null>(null);
  const [messages, setMessages] = useState<AcademicMessageDto[]>([]);
  const [tasks, setTasks] = useState<AcademicTaskDto[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Task state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [creatingTask, setCreatingTask] = useState(false);
  
  // Tabs
  const [activeTab, setActiveTab] = useState<'management' | 'chat'>('management');

  // Chat state
  const [messageContent, setMessageContent] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Upload states
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadingCode, setUploadingCode] = useState(false);

  useEffect(() => {
    loadData();
  }, [params.id]);

  useEffect(() => {
    if (activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchAcademicProjectById(params.id);
      setProject(data.project);
      setMessages(data.messages);
      
      const tasksData = await fetchProjectTasks(params.id);
      setTasks(tasksData);
    } catch (err: any) {
      toast.error('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      await updateMentorProject(params.id, { status: newStatus });
      toast.success('Status updated');
      loadData();
    } catch (err: any) {
      toast.error('Failed to update status');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      setCreatingTask(true);
      await createProjectTask(params.id, newTaskTitle.trim());
      setNewTaskTitle('');
      toast.success('Task created');
      loadData();
    } catch (err: any) {
      toast.error('Failed to create task');
    } finally {
      setCreatingTask(false);
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
    try {
      await updateProjectTask(params.id, taskId, !currentStatus);
      loadData();
    } catch (err: any) {
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Delete this task?')) return;
    try {
      await deleteProjectTask(params.id, taskId);
      toast.success('Task deleted');
      loadData();
    } catch (err: any) {
      toast.error('Failed to delete task');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim()) return;
    try {
      setSendingMsg(true);
      const newMsg = await sendAcademicMessage(params.id, messageContent);
      setMessages(prev => [...prev, newMsg]);
      setMessageContent('');
    } catch (err: any) {
      toast.error('Failed to send message');
    } finally {
      setSendingMsg(false);
    }
  };

  const uploadToCloudinary = async (file: File) => {
    const cloudFormData = new FormData();
    cloudFormData.append('file', file);
    cloudFormData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default');

    const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`, {
      method: 'POST',
      body: cloudFormData,
    });
    if (!res.ok) throw new Error('Cloudinary upload failed');
    const uploadData = await res.json();
    return uploadData.secure_url;
  };

  const handleUploadDoc = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingDoc(true);
      const url = await uploadToCloudinary(file);
      await updateMentorProject(params.id, { documentationUrl: url });
      toast.success('Thesis document uploaded');
      loadData();
    } catch (err: any) {
      toast.error('Failed to upload document');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleUploadCode = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingCode(true);
      const url = await uploadToCloudinary(file);
      await updateMentorProject(params.id, { sourceCodeUrl: url });
      toast.success('Source code uploaded');
      loadData();
    } catch (err: any) {
      toast.error('Failed to upload code');
    } finally {
      setUploadingCode(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (!project) return <div className="p-8 text-center">Project not found.</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 text-slate-200">
      
      {/* HEADER */}
      <div className="flex flex-col gap-4">
        <button onClick={() => router.back()} className="w-max flex items-center gap-2 text-sm text-slate-400 hover:text-amber-500 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Mentor Dashboard
        </button>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900 border border-white/10 rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 blur-[100px] pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-400 mb-4 uppercase">
              <GraduationCap className="w-4 h-4" />
              {project.serviceScope}
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-2">{project.title}</h1>
            <p className="text-slate-400 text-sm">{project.degree} • {project.universityName}</p>
          </div>
          
          <div className="relative z-10 flex gap-4">
            <select
              title="Project Status"
              aria-label="Project Status"
              className="bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/50 appearance-none pr-10"
              value={project.status}
              onChange={(e) => handleUpdateStatus(e.target.value)}
            >
              <option value="in_progress">In Progress</option>
              <option value="review">Under Review</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
        <button onClick={() => setActiveTab('management')} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'management' ? 'bg-amber-500 text-white' : 'text-slate-500 hover:bg-white/5'}`}>
          <Settings className="w-4 h-4" /> Management & Files
        </button>
        <button onClick={() => setActiveTab('chat')} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'chat' ? 'bg-amber-500 text-white' : 'text-slate-500 hover:bg-white/5'}`}>
          <MessageSquare className="w-4 h-4" /> Client Chat
        </button>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* MANAGEMENT TAB */}
        {activeTab === 'management' && (
          <div className="grid md:grid-cols-2 gap-8">
            
            {/* Left Col: Project Brief */}
            <div className="space-y-8">
              <div className="bg-slate-900 border border-white/10 rounded-3xl p-8">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-500" />
                  Project Brief
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">{project.description}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/50 p-4 rounded-xl border border-white/5">
                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Department</div>
                    <div className="font-semibold">{project.department}</div>
                  </div>
                  <div className="bg-black/50 p-4 rounded-xl border border-white/5">
                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Level</div>
                    <div className="font-semibold">{project.level}</div>
                  </div>
                </div>

                {project.initialDocumentUrl && (
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <div className="text-xs text-amber-500 font-bold uppercase tracking-wider mb-2">Initial Document Attached</div>
                    <div className="text-sm text-slate-400 mb-4">The student attached a document (proposal, guidelines, etc.) during the request.</div>
                    <a href={project.initialDocumentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 py-2 px-4 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-500 rounded-lg transition-colors font-medium text-sm">
                      <Download className="w-4 h-4" /> Download Document
                    </a>
                  </div>
                )}
              </div>

              {/* Tasks Management */}
              <div className="bg-slate-900 border border-white/10 rounded-3xl p-8">
                <h3 className="text-xl font-bold text-white mb-6">Project Tasks</h3>
                <form onSubmit={handleCreateTask} className="flex gap-2 mb-6">
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="E.g., Submit Proposal, Approve UI..."
                    className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
                  />
                  <button type="submit" disabled={creatingTask} className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-50">
                    {creatingTask ? 'Adding...' : 'Add'}
                  </button>
                </form>
                
                <div className="space-y-3">
                  {tasks.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">No tasks added yet.</p>
                  ) : (
                    tasks.map(task => (
                      <div key={task.$id} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl hover:border-white/10 transition-colors group">
                        <div className="flex items-center gap-3">
                          <button 
                            title="Toggle Task"
                            aria-label="Toggle Task"
                            onClick={() => handleToggleTask(task.$id, task.completed)} 
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${task.completed ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-500 text-transparent hover:border-amber-500'}`}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <span className={`font-medium ${task.completed ? 'text-slate-400 line-through' : 'text-white'}`}>{task.title}</span>
                        </div>
                        <button onClick={() => handleDeleteTask(task.$id)} className="text-xs text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">Delete</button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Col: Deliverables */}
            <div className="space-y-8">
              <div className="bg-slate-900 border border-white/10 rounded-3xl p-8">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-amber-500" />
                  Deliverables Upload
                </h3>
                <p className="text-sm text-slate-400 mb-8">
                  Upload the completed files here. The student will instantly be able to download them from their dashboard.
                </p>

                <div className="space-y-6">
                  
                  {/* Source Code */}
                  <div className="bg-black/40 border border-white/5 p-6 rounded-2xl relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg"><Code className="w-5 h-5" /></div>
                        <div className="font-bold text-white">Source Code</div>
                      </div>
                      {project.sourceCodeUrl && (
                        <a href={project.sourceCodeUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold flex items-center gap-1">
                          <Download className="w-4 h-4" /> Download
                        </a>
                      )}
                    </div>
                    
                    <input type="file" accept=".zip,.rar" id="code-upload" className="hidden" onChange={handleUploadCode} disabled={uploadingCode} />
                    <label htmlFor="code-upload" className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-white/20 text-slate-300 hover:bg-white/5 cursor-pointer transition-colors ${uploadingCode ? 'opacity-50 pointer-events-none' : ''}`}>
                      {uploadingCode ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      {project.sourceCodeUrl ? 'Replace ZIP Archive' : 'Upload ZIP Archive'}
                    </label>
                  </div>

                  {/* Thesis Document */}
                  <div className="bg-black/40 border border-white/5 p-6 rounded-2xl relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg"><FileText className="w-5 h-5" /></div>
                        <div className="font-bold text-white">Thesis Document</div>
                      </div>
                      {project.documentationUrl && (
                        <a href={project.documentationUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 text-sm font-semibold flex items-center gap-1">
                          <Download className="w-4 h-4" /> Download
                        </a>
                      )}
                    </div>
                    
                    <input type="file" accept=".pdf,.doc,.docx" id="doc-upload" className="hidden" onChange={handleUploadDoc} disabled={uploadingDoc} />
                    <label htmlFor="doc-upload" className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-white/20 text-slate-300 hover:bg-white/5 cursor-pointer transition-colors ${uploadingDoc ? 'opacity-50 pointer-events-none' : ''}`}>
                      {uploadingDoc ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      {project.documentationUrl ? 'Replace PDF/Word Document' : 'Upload PDF/Word Document'}
                    </label>
                  </div>

                </div>
              </div>
            </div>

          </div>
        )}

        {/* CHAT TAB */}
        {activeTab === 'chat' && (
          <div className="bg-slate-900 border border-white/10 rounded-3xl h-[600px] flex flex-col overflow-hidden max-w-4xl mx-auto shadow-2xl">
            <div className="p-6 border-b border-white/5 bg-black/20 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white">Mentorship Chat</h3>
                <p className="text-sm text-slate-400">Student sees these messages directly in their dashboard.</p>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500">
                  <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                  <p>No messages yet.</p>
                </div>
              ) : (
                messages.map(msg => {
                  const isMe = msg.senderId === user?.$id;
                  return (
                    <div key={msg.$id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className="text-xs text-slate-500 mb-1 px-1">
                        {msg.senderName} • {format(new Date(msg.$createdAt), 'h:mm a')}
                      </div>
                      <div className={`px-5 py-3 rounded-2xl max-w-[80%] ${
                        isMe 
                          ? 'bg-amber-500 text-white rounded-br-sm' 
                          : 'bg-white/10 text-white border border-white/5 rounded-bl-sm'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 bg-black/20">
              <div className="flex items-center gap-3 bg-black/50 border border-white/10 rounded-2xl p-2 focus-within:border-amber-500/50 transition-colors">
                <input
                  type="text"
                  value={messageContent}
                  onChange={e => setMessageContent(e.target.value)}
                  placeholder="Type a message to the student..."
                  className="flex-1 bg-transparent px-4 py-2 text-white outline-none"
                  disabled={sendingMsg}
                />
                <button
                  type="submit"
                  disabled={sendingMsg || !messageContent.trim()}
                  className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center disabled:opacity-50 hover:bg-amber-600 transition-colors shrink-0"
                >
                  {sendingMsg ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
