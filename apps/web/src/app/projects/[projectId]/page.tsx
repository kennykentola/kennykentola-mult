'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../features/auth/AuthContext';
import { getProject, sendProjectMessage, uploadProjectAsset } from '../../../features/projects/projectsService';
import { 
  ArrowLeft, CheckCircle2, Circle, Clock, MessageSquare, 
  FileText, Send, Paperclip, CreditCard, User, UploadCloud
} from 'lucide-react';
import Link from 'next/link';

const getProgressWidthClass = (progress: number) => {
  const rounded = Math.round((progress || 0) / 5) * 5;
  switch (rounded) {
    case 5: return 'w-[5%]';
    case 10: return 'w-[10%]';
    case 15: return 'w-[15%]';
    case 20: return 'w-[20%]';
    case 25: return 'w-[25%]';
    case 30: return 'w-[30%]';
    case 35: return 'w-[35%]';
    case 40: return 'w-[40%]';
    case 45: return 'w-[45%]';
    case 50: return 'w-[50%]';
    case 55: return 'w-[55%]';
    case 60: return 'w-[60%]';
    case 65: return 'w-[65%]';
    case 70: return 'w-[70%]';
    case 75: return 'w-[75%]';
    case 80: return 'w-[80%]';
    case 85: return 'w-[85%]';
    case 90: return 'w-[90%]';
    case 95: return 'w-[95%]';
    case 100: return 'w-full';
    default: return 'w-0';
  }
};

export default function ClientProjectDetailsPage() {
  const params = useParams() as Record<string, string>;
  const router = useRouter();
  const { profile, user } = useAuth();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'messages' | 'assets' | 'invoices'>('overview');

  const [messageContent, setMessageContent] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [uploadingAsset, setUploadingAsset] = useState(false);

  useEffect(() => {
    fetchData();
  }, [params.projectId]);

  const fetchData = async () => {
    try {
      const result = await getProject(params.projectId);
      if (result && result.project) {
        setData(result);
      } else {
        // Fallback for old route response
        setData({ project: result, milestones: [], messages: [], assets: [], payments: [] });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim()) return;
    setSendingMsg(true);
    try {
      await sendProjectMessage(params.projectId, messageContent);
      setMessageContent('');
      await fetchData(); // Refresh data to get new messages
    } catch (err) {
      console.error(err);
      alert('Failed to send message');
    } finally {
      setSendingMsg(false);
    }
  };

  const handleUploadAsset = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploadingAsset(true);
    try {
      const cloudFormData = new FormData();
      cloudFormData.append('file', file);
      cloudFormData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default');

      const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`, {
        method: 'POST',
        body: cloudFormData,
      });

      if (!res.ok) throw new Error('Failed to upload file to cloud');
      const uploadData = await res.json();

      await uploadProjectAsset(params.projectId, file.name, uploadData.secure_url);
      await fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to add asset');
    } finally {
      setUploadingAsset(false);
      // Reset input
      e.target.value = '';
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-400">Loading project details...</div>;
  if (!data?.project) return <div className="p-12 text-center text-rose-400">Project not found.</div>;

  const { project, milestones, messages, assets, payments } = data;

  const completedMilestones = milestones?.filter((m: any) => m.status === 'completed').length || 0;
  const totalMilestones = milestones?.length || 0;
  const progressPercent = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Projects
      </Link>

      <div className="glass-panel border border-white/5 rounded-3xl p-8 bg-slate-950/40 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {project.status.replace('-', ' ')}
            </span>
            <h1 className="text-3xl font-black text-white mt-4">{project.title}</h1>
            <p className="text-slate-400 mt-2 max-w-2xl">{project.description}</p>
          </div>
          
          <div className="shrink-0 text-right">
            <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Total Budget</div>
            <div className="text-3xl font-black text-white">
              {project.budget > 0 ? `NGN ${project.budget.toLocaleString()}` : 'Pending Quote'}
            </div>
            
            {project.pmName && (
              <div className="mt-4 flex items-center justify-end gap-2 text-sm text-slate-300">
                <div className="h-6 w-6 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center">
                  <User className="h-3 w-3" />
                </div>
                <span>Lead: <strong className="text-white">{project.pmName}</strong></span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-white/5 overflow-x-auto pb-px">
        {[
          { id: 'overview', label: 'Overview & Milestones', icon: Clock },
          { id: 'messages', label: `Messages (${messages?.length || 0})`, icon: MessageSquare },
          { id: 'assets', label: `Files & Assets (${assets?.length || 0})`, icon: FileText },
          { id: 'invoices', label: `Invoices (${payments?.length || 0})`, icon: CreditCard }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id 
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5' 
                : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon className="h-4 w-4" /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="glass-panel border border-white/5 rounded-2xl p-8 bg-slate-900/30">
            <h3 className="text-lg font-bold text-white mb-6">Project Progress</h3>
            
            <div className="mb-8">
              <div className="flex justify-between text-sm font-bold mb-2">
                <span className="text-indigo-400">{progressPercent}% Completed</span>
                <span className="text-slate-500">{completedMilestones} of {totalMilestones} Milestones</span>
              </div>
              <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
                <div 
                  className={`h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000 ease-out ${getProgressWidthClass(progressPercent)}`}
                />
              </div>
            </div>

            <div className="space-y-6">
              {milestones && milestones.length > 0 ? milestones.map((m: any, idx: number) => {
                const isCompleted = m.status === 'completed';
                return (
                  <div key={m.$id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 border-2 ${
                        isCompleted ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400' : 'bg-slate-950 border-slate-700 text-slate-600'
                      }`}>
                        {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <span className="text-xs">{idx + 1}</span>}
                      </div>
                      {idx < totalMilestones - 1 && (
                        <div className={`w-0.5 h-full my-2 ${isCompleted ? 'bg-indigo-500/30' : 'bg-slate-800'}`} />
                      )}
                    </div>
                    <div className="pb-6">
                      <h4 className={`text-base font-bold ${isCompleted ? 'text-white' : 'text-slate-300'}`}>{m.title}</h4>
                      {m.description && <p className="text-sm text-slate-500 mt-1">{m.description}</p>}
                      <div className="text-xs font-semibold text-slate-600 mt-2">
                        Due: {new Date(m.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="text-slate-500 text-sm">No milestones have been set by the project manager yet.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="glass-panel border border-white/5 rounded-2xl bg-slate-900/30 flex flex-col h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages && messages.length > 0 ? messages.map((msg: any) => {
              const isMine = msg.senderId === user?.id;
              return (
                <div key={msg.$id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] uppercase font-bold text-slate-500 mb-1 px-1">
                    {msg.senderName} • {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                  <div className={`max-w-[80%] rounded-2xl px-5 py-3 text-sm ${
                    isMine 
                      ? 'bg-indigo-600 text-white rounded-tr-sm' 
                      : 'bg-slate-800 text-slate-200 border border-white/5 rounded-tl-sm'
                  }`}>
                    {msg.content}
                    {msg.fileUrl && (
                      <a href={msg.fileUrl} target="_blank" rel="noreferrer" className="block mt-2 text-indigo-300 underline font-semibold flex items-center gap-1">
                        <Paperclip className="h-3 w-3" /> Attachment
                      </a>
                    )}
                  </div>
                </div>
              );
            }) : (
              <div className="h-full flex items-center justify-center text-slate-500">
                Send a message to your project manager to get started.
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-white/5 bg-slate-950/50">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <input
                type="text"
                value={messageContent}
                onChange={e => setMessageContent(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              <button 
                type="submit" 
                title="Send Message"
                aria-label="Send Message"
                disabled={sendingMsg || !messageContent.trim()}
                className="h-12 w-12 flex items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-colors disabled:opacity-50"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'assets' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">Project Files & Deliverables</h3>
            <div className="relative">
              <input 
                type="file" 
                onChange={handleUploadAsset} 
                disabled={uploadingAsset}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
                title="Upload File"
              />
              <button 
                disabled={uploadingAsset}
                className="flex items-center gap-2 text-xs font-bold bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                <UploadCloud className="h-4 w-4" /> 
                {uploadingAsset ? 'Uploading...' : 'Add File'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {assets && assets.length > 0 ? assets.map((asset: any) => (
              <a 
                key={asset.$id} 
                href={asset.fileUrl} 
                target="_blank" 
                rel="noreferrer"
                className="glass-panel border border-white/5 rounded-xl p-5 bg-slate-900/30 hover:bg-slate-800/50 transition-all group block"
              >
                <div className="h-12 w-12 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                  <FileText className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-bold text-white truncate">{asset.fileName}</h4>
                <div className="text-xs text-slate-500 mt-1">Uploaded by {asset.uploaderName}</div>
                <div className="text-xs text-slate-600 mt-0.5">{new Date(asset.createdAt).toLocaleDateString()}</div>
              </a>
            )) : (
              <div className="col-span-full py-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                No files or deliverables have been uploaded yet.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'invoices' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-lg font-bold text-white">Payment History</h3>
          <div className="space-y-4">
            {payments && payments.length > 0 ? payments.map((payment: any) => (
              <div key={payment.$id} className="glass-panel border border-white/5 rounded-xl p-6 bg-slate-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                      payment.status === 'verified' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                      payment.status === 'rejected' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                      'bg-amber-500/10 border-amber-500/20 text-amber-400'
                    }`}>
                      {payment.status}
                    </span>
                    <span className="text-xs font-bold text-slate-500 font-mono">{payment.referenceNumber}</span>
                  </div>
                  <h4 className="text-base font-bold text-white">NGN {payment.amount.toLocaleString()}</h4>
                  <div className="text-xs text-slate-400 mt-1">Submitted on {new Date(payment.submittedAt).toLocaleDateString()}</div>
                </div>
                {payment.receiptImage && (
                  <a 
                    href={payment.receiptImage} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 underline"
                  >
                    View Receipt
                  </a>
                )}
              </div>
            )) : (
              <div className="py-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                No payment records found for this project.
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
