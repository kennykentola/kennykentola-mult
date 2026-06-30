'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAcademicProjectById, createProjectPayment, sendAcademicMessage, fetchProjectTasks, fetchProjectPayments, AcademicProjectDto, AcademicMessageDto, AcademicTaskDto, AcademicPaymentDto } from '../../../../features/academic/academicService';
import { 
  GraduationCap, Loader2, ArrowLeft, CheckCircle2, 
  Code, FileText, Upload, Download, MessageSquare, Send, Check
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function AcademicProjectDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [project, setProject] = useState<AcademicProjectDto | null>(null);
  const [messages, setMessages] = useState<AcademicMessageDto[]>([]);
  const [tasks, setTasks] = useState<AcademicTaskDto[]>([]);
  const [payments, setPayments] = useState<AcademicPaymentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  
  // Tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'chat' | 'deliverables'>('overview');

  // Chat state
  const [messageContent, setMessageContent] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      
      const [tasksData, paymentsData] = await Promise.all([
        fetchProjectTasks(params.id),
        fetchProjectPayments(params.id)
      ]);
      setTasks(tasksData);
      setPayments(paymentsData);
    } catch (err: any) {
      toast.error('Failed to load project details');
      console.error(err);
    } finally {
      setLoading(false);
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!paymentAmount || isNaN(Number(paymentAmount)) || Number(paymentAmount) <= 0) {
      toast.error('Please enter a valid payment amount first.');
      return;
    }
    
    if (payments.length >= 3) {
      toast.error('You have reached the maximum of 3 installment payments.');
      return;
    }

    try {
      setUploading(true);
      const cloudFormData = new FormData();
      cloudFormData.append('file', file);
      cloudFormData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default');

      const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`, {
        method: 'POST',
        body: cloudFormData,
      });

      if (!res.ok) throw new Error('Cloudinary upload failed');
      const uploadData = await res.json();
      const url = uploadData.secure_url;

      await createProjectPayment(params.id, Number(paymentAmount), url);
      toast.success('Payment receipt uploaded successfully!');
      setPaymentAmount('');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload receipt');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (!project) {
    return <div className="p-8 text-center text-slate-400">Project not found.</div>;
  }

  // Define Milestone stages based on the project status
  const milestones = [
    { id: 'pending-proposal', label: 'Proposal Review', done: true },
    { id: 'proposal-approved', label: 'Approved & Payment', done: project.status !== 'pending-proposal' && project.status !== 'pending' },
    { id: 'in_progress', label: 'Development/Drafting', done: ['in_progress', 'review', 'completed'].includes(project.status) },
    { id: 'review', label: 'Testing & Review', done: ['review', 'completed'].includes(project.status) },
    { id: 'completed', label: 'Delivered', done: project.status === 'completed' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="flex flex-col gap-4">
        <button onClick={() => router.back()} className="w-max flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to My Projects
        </button>
        <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 blur-[100px] pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-400 mb-4">
                <GraduationCap className="w-4 h-4" />
                {project.serviceScope}
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">{project.title}</h1>
              <p className="text-slate-400 max-w-3xl line-clamp-2">{project.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Overview', icon: FileText },
          { id: 'chat', label: 'Messages', icon: MessageSquare },
          { id: 'deliverables', label: 'Deliverables', icon: Download }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-white/10 text-white border border-white/10' 
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-transparent'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Left Column: Milestones & Details */}
            <div className="md:col-span-2 space-y-6">
              
              {/* Tasks / Milestone Tracker */}
              <div className="bg-slate-900 border border-white/10 rounded-3xl p-8">
                <h3 className="text-xl font-bold text-white mb-2">My Tasks</h3>
                <p className="text-sm text-slate-400 mb-8">Track the detailed progress of your project</p>
                
                {tasks.length === 0 ? (
                  <div className="text-slate-500 text-sm py-4">No tasks assigned yet. Your mentor will update this soon.</div>
                ) : (
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-white/5" />
                    <div className="space-y-6">
                      {tasks.map((task) => (
                        <div key={task.$id} className="relative flex items-center gap-6">
                          <div className={`w-8 h-8 rounded-full border-4 flex items-center justify-center shrink-0 z-10 transition-colors ${
                            task.completed ? 'bg-amber-500 border-slate-900 text-white' : 'bg-slate-800 border-slate-900 text-transparent'
                          }`}>
                            {task.completed && <Check className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className={`font-bold ${task.completed ? 'text-white' : 'text-slate-500'}`}>{task.title}</div>
                            <div className="text-xs text-slate-500 mt-1">{task.completed ? 'Completed' : 'Pending'}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Section (Part by Part Support) */}
              <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 relative overflow-hidden">
                <h3 className="text-xl font-bold text-white mb-6">Payment History</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <div className="text-xs text-slate-500 mb-1">Total Quoted Price</div>
                    <div className="font-black text-white text-xl">
                      {project.price ? `₦${project.price.toLocaleString()}` : 'Awaiting Quote'}
                    </div>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
                    <div className="text-xs text-emerald-500/70 mb-1">Total Amount Paid</div>
                    <div className="font-black text-emerald-400 text-xl">
                      ₦{(project.amountPaid || 0).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Uploaded Receipts (New System) */}
                {payments.length > 0 && (
                  <div className="mb-6 space-y-3">
                    <h4 className="text-sm font-bold text-slate-300">Installment Receipts ({payments.length} / 3)</h4>
                    <div className="grid gap-2">
                      {payments.map((p) => (
                         <div key={p.$id} className="flex flex-col gap-2 p-3 bg-white/5 border border-white/5 rounded-xl">
                           <div className="flex items-center justify-between">
                             <div className="flex items-center gap-3">
                               {p.status === 'approved' ? (
                                 <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                               ) : p.status === 'rejected' ? (
                                 <div className="w-4 h-4 rounded-full bg-red-500 shrink-0" />
                               ) : (
                                 <div className="w-4 h-4 rounded-full bg-amber-500 animate-pulse shrink-0" />
                               )}
                               <span className="text-sm text-slate-300">Payment {p.installmentNumber} - ₦{p.amount.toLocaleString()}</span>
                             </div>
                             <div className="flex items-center gap-4">
                               <span className={`text-xs px-2 py-1 rounded-full ${p.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' : p.status === 'rejected' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                 {p.status.toUpperCase()}
                               </span>
                               <a href={p.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-amber-500 hover:underline">View Receipt</a>
                             </div>
                           </div>
                         </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload New Receipt */}
                {(project.price || 0) > (project.amountPaid || 0) && project.price > 0 && payments.length < 3 && (
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <p className="text-slate-400 text-sm mb-4">
                      Balance: ₦{((project.price || 0) - (project.amountPaid || 0)).toLocaleString()}. You can make up to 3 installment payments.
                    </p>
                    <div className="flex flex-col gap-4">
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-2">
                        <label className="text-xs text-slate-400">Amount Paid (₦)</label>
                        <input 
                          type="number" 
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          placeholder="Enter amount..."
                          className="bg-transparent text-white border-b border-white/10 focus:border-amber-500 outline-none pb-2"
                        />
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <input type="file" accept="image/*,.pdf" id="receipt-upload" className="hidden" onChange={handleFileUpload} disabled={uploading || !paymentAmount} />
                        <label htmlFor="receipt-upload" className={`w-full text-center inline-flex justify-center items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl font-medium transition-colors cursor-pointer ${uploading || !paymentAmount ? 'opacity-50 pointer-events-none' : ''}`}>
                          {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                          Upload Payment Receipt
                        </label>
                      </div>
                    </div>
                  </div>
                )}
                {payments.length >= 3 && (project.price || 0) > (project.amountPaid || 0) && (
                  <div className="mt-6 pt-6 border-t border-white/10 text-red-400 text-sm">
                    Maximum of 3 installments reached. Please contact support to clear your remaining balance.
                  </div>
                )}
              </div>

            </div>

            {/* Right Column: Metadata */}
            <div className="space-y-4">
              
              {project.initialDocumentUrl && (
                <div className="bg-white/5 border border-amber-500/30 rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[50px] pointer-events-none" />
                  <div className="text-xs text-amber-500 font-bold uppercase tracking-wider mb-2 relative z-10">Initial Document</div>
                  <div className="text-sm text-slate-300 mb-4 relative z-10">You attached a document when requesting this project.</div>
                  <a href={project.initialDocumentUrl} target="_blank" rel="noopener noreferrer" className="relative z-10 w-full flex items-center justify-center gap-2 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-500 rounded-lg transition-colors font-medium text-sm">
                    <Download className="w-4 h-4" /> Download Document
                  </a>
                </div>
              )}

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="text-xs text-slate-500 mb-1">Degree Level</div>
                <div className="font-semibold text-white">{project.degree} - {project.level}</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="text-xs text-slate-500 mb-1">Institution</div>
                <div className="font-semibold text-white">{project.universityName}</div>
                <div className="text-xs text-slate-400 mt-1">{project.department}</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="text-xs text-slate-500 mb-1">Total Quoted Price</div>
                <div className="font-black text-amber-400 text-2xl">
                  {project.price ? `₦${project.price.toLocaleString()}` : 'Awaiting Quote'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CHAT TAB */}
        {activeTab === 'chat' && (
          <div className="bg-slate-900 border border-white/10 rounded-3xl h-[600px] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-white/5 bg-black/20">
              <h3 className="text-lg font-bold text-white">Project Chat</h3>
              <p className="text-sm text-slate-400">Communicate directly with your assigned mentor or developer.</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500">
                  <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                  <p>No messages yet. Send a message to start the conversation.</p>
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
                  placeholder="Type a message..."
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

        {/* DELIVERABLES TAB */}
        {activeTab === 'deliverables' && (
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Project Deliverables</h3>
            
            {(!project.sourceCodeUrl && !project.documentationUrl) ? (
              <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-black/20">
                <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-white mb-1">No Deliverables Yet</h4>
                <p className="text-slate-400 text-sm">Your files will appear here once they are uploaded by the team.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-6">
                {project.sourceCodeUrl && (
                  <div className="bg-black/40 border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all flex items-start justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center">
                        <Code className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-bold text-white">Source Code</div>
                        <div className="text-sm text-slate-500">ZIP Archive</div>
                      </div>
                    </div>
                    <a href={project.sourceCodeUrl} title="Download Source Code" aria-label="Download Source Code" target="_blank" rel="noopener noreferrer" className="p-3 text-slate-400 hover:text-white bg-white/5 hover:bg-indigo-500 rounded-xl transition-colors">
                      <Download className="w-5 h-5" />
                    </a>
                  </div>
                )}

                {project.documentationUrl && (
                  <div className="bg-black/40 border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all flex items-start justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-bold text-white">Thesis Document</div>
                        <div className="text-sm text-slate-500">PDF / Word</div>
                      </div>
                    </div>
                    <a href={project.documentationUrl} title="Download Thesis Document" aria-label="Download Thesis Document" target="_blank" rel="noopener noreferrer" className="p-3 text-slate-400 hover:text-white bg-white/5 hover:bg-emerald-500 rounded-xl transition-colors">
                      <Download className="w-5 h-5" />
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
