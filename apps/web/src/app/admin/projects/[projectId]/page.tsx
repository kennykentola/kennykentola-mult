'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../features/auth/AuthContext';
import { 
  getProject, sendProjectMessage, uploadProjectAsset, 
  createAdminMilestone, updateAdminMilestoneStatus, updateAdminProjectStatus 
} from '../../../../features/projects/projectsService';
import { 
  ArrowLeft, CheckCircle2, Clock, MessageSquare, 
  FileText, Send, Paperclip, CreditCard, User, UploadCloud, Plus, Settings
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

export default function AdminProjectDetailsPage() {
  const params = useParams() as Record<string, string>;
  const router = useRouter();
  const { user } = useAuth();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'messages' | 'assets' | 'settings'>('overview');

  const [messageContent, setMessageContent] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  // Milestone Form
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [mTitle, setMTitle] = useState('');
  const [mDesc, setMDesc] = useState('');
  const [mDate, setMDate] = useState('');

  // Settings Form
  const [sStatus, setSStatus] = useState('');
  const [sBudget, setSBudget] = useState(0);
  const [sPmName, setSPmName] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [uploadingAsset, setUploadingAsset] = useState(false);

  useEffect(() => {
    fetchData();
  }, [params.projectId]);

  const fetchData = async () => {
    try {
      const result = await getProject(params.projectId);
      if (result && result.project) {
        setData(result);
        setSStatus(result.project.status);
        setSBudget(result.project.budget);
        setSPmName(result.project.pmName || '');
      } else {
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
      await fetchData(); 
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

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mTitle || !mDate) return;
    try {
      await createAdminMilestone(params.projectId, mTitle, mDesc, new Date(mDate).toISOString());
      setShowMilestoneForm(false);
      setMTitle(''); setMDesc(''); setMDate('');
      await fetchData();
    } catch (err) {
      alert('Failed to create milestone');
    }
  };

  const handleToggleMilestone = async (milestoneId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    try {
      await updateAdminMilestoneStatus(milestoneId, newStatus);
      await fetchData();
    } catch (err) {
      alert('Failed to update milestone');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await updateAdminProjectStatus(params.projectId, {
        status: sStatus,
        budget: Number(sBudget),
        pmName: sPmName
      });
      alert('Project settings saved!');
      await fetchData();
    } catch (err) {
      alert('Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-400">Loading admin project...</div>;
  if (!data?.project) return <div className="p-12 text-center text-rose-400">Project not found.</div>;

  const { project, milestones, messages, assets, payments } = data;

  const completedMilestones = milestones?.filter((m: any) => m.status === 'completed').length || 0;
  const totalMilestones = milestones?.length || 0;
  const progressPercent = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <Link href="/admin/projects" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Project Pipeline
        </Link>
        <div className="px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">
          Admin View
        </div>
      </div>

      <div className="glass-panel border border-white/5 rounded-3xl p-8 bg-slate-900 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-white">{project.title}</h1>
            <p className="text-slate-400 mt-2 max-w-2xl">{project.description}</p>
            <div className="mt-4 flex items-center gap-4 text-xs font-bold text-slate-500">
              <span className="bg-slate-800 px-3 py-1 rounded-full text-indigo-400">{project.status}</span>
              <span>Client ID: {project.clientId.slice(0,8)}...</span>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Budget Setup</div>
            <div className="text-2xl font-black text-emerald-400">
              NGN {project.budget?.toLocaleString() || 0}
            </div>
            {project.pmName && (
              <div className="mt-2 text-sm font-semibold text-slate-300">
                Lead: {project.pmName}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-white/5 overflow-x-auto pb-px">
        {[
          { id: 'overview', label: 'Milestones', icon: Clock },
          { id: 'messages', label: `Messages (${messages?.length || 0})`, icon: MessageSquare },
          { id: 'assets', label: `Files & Deliverables`, icon: FileText },
          { id: 'settings', label: 'Manage Settings', icon: Settings }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id 
                ? 'border-rose-500 text-rose-400 bg-rose-500/5' 
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
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Project Milestones</h3>
              <button 
                onClick={() => setShowMilestoneForm(!showMilestoneForm)}
                className="flex items-center gap-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" /> Add Milestone
              </button>
            </div>

            {showMilestoneForm && (
              <form onSubmit={handleCreateMilestone} className="mb-8 p-6 rounded-xl border border-indigo-500/30 bg-indigo-500/5 space-y-4">
                <h4 className="font-bold text-white text-sm">Create New Milestone</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input required type="text" title="Milestone Title" aria-label="Milestone Title" placeholder="Milestone Title" value={mTitle} onChange={e => setMTitle(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" />
                  <input required type="date" title="Milestone Date" aria-label="Milestone Date" value={mDate} onChange={e => setMDate(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" />
                </div>
                <input type="text" title="Milestone Description" aria-label="Milestone Description" placeholder="Description (Optional)" value={mDesc} onChange={e => setMDesc(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" />
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowMilestoneForm(false)} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">Cancel</button>
                  <button type="submit" className="px-4 py-2 text-xs font-bold bg-indigo-600 text-white rounded-lg">Save Milestone</button>
                </div>
              </form>
            )}
            
            <div className="mb-8">
              <div className="flex justify-between text-sm font-bold mb-2">
                <span className="text-indigo-400">{progressPercent}% Completed</span>
                <span className="text-slate-500">{completedMilestones} of {totalMilestones} Milestones</span>
              </div>
              <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
                <div className={`h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all ${getProgressWidthClass(progressPercent)}`} />
              </div>
            </div>

            <div className="space-y-4">
              {milestones && milestones.length > 0 ? milestones.map((m: any) => {
                const isCompleted = m.status === 'completed';
                return (
                  <div key={m.$id} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-slate-950/50">
                    <div>
                      <h4 className={`text-sm font-bold ${isCompleted ? 'text-white line-through opacity-50' : 'text-white'}`}>{m.title}</h4>
                      <div className="text-xs text-slate-500 mt-1">Due: {new Date(m.dueDate).toLocaleDateString()}</div>
                    </div>
                    <button 
                      onClick={() => handleToggleMilestone(m.$id, m.status)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                        isCompleted ? 'bg-emerald-500/20 text-emerald-400 hover:bg-slate-800 hover:text-slate-300' : 'bg-slate-800 text-slate-300 hover:bg-emerald-500/20 hover:text-emerald-400'
                      }`}
                    >
                      <CheckCircle2 className="h-4 w-4" /> {isCompleted ? 'Completed' : 'Mark Complete'}
                    </button>
                  </div>
                );
              }) : (
                <div className="text-slate-500 text-sm">No milestones have been created.</div>
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
                    {msg.senderName} {isMine && '(You)'} • {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                  <div className={`max-w-[80%] rounded-2xl px-5 py-3 text-sm ${
                    isMine 
                      ? 'bg-rose-600 text-white rounded-tr-sm' 
                      : 'bg-slate-800 text-slate-200 border border-white/5 rounded-tl-sm'
                  }`}>
                    {msg.content}
                    {msg.fileUrl && (
                      <a href={msg.fileUrl} target="_blank" rel="noreferrer" className="block mt-2 text-rose-300 underline font-semibold flex items-center gap-1">
                        <Paperclip className="h-3 w-3" /> Attachment
                      </a>
                    )}
                  </div>
                </div>
              );
            }) : (
              <div className="h-full flex items-center justify-center text-slate-500">
                Send a message to the client.
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-white/5 bg-slate-950/50">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <input
                type="text"
                value={messageContent}
                onChange={e => setMessageContent(e.target.value)}
                placeholder="Reply to client..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              />
              <button 
                type="submit" 
                title="Send Message"
                aria-label="Send Message"
                disabled={sendingMsg || !messageContent.trim()}
                className="h-12 w-12 flex items-center justify-center rounded-xl bg-rose-600 text-white hover:bg-rose-500 transition-colors disabled:opacity-50"
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
                className="flex items-center gap-2 text-xs font-bold bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                <UploadCloud className="h-4 w-4" /> 
                {uploadingAsset ? 'Uploading...' : 'Upload Deliverable'}
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
                <div className="h-12 w-12 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 mb-4 group-hover:scale-110 transition-transform">
                  <FileText className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-bold text-white truncate">{asset.fileName}</h4>
                <div className="text-xs text-slate-500 mt-1">Uploaded by {asset.uploaderName}</div>
              </a>
            )) : (
              <div className="col-span-full py-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                No deliverables uploaded.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="glass-panel border border-white/5 rounded-2xl p-8 bg-slate-900/30 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-lg font-bold text-white mb-6">Manage Project Profile</h3>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">Project Status</label>
              <select title="Project Status" aria-label="Project Status" value={sStatus} onChange={e => setSStatus(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white">
                <option value="requested">Requested</option>
                <option value="quoted">Quoted / Awaiting Payment</option>
                <option value="in-progress">In Progress</option>
                <option value="in-qa">In QA</option>
                <option value="completed">Completed / Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">Assigned Project Manager Name</label>
              <input type="text" title="Assigned Project Manager Name" aria-label="Assigned Project Manager Name" value={sPmName} onChange={e => setSPmName(e.target.value)} placeholder="e.g. David Miller" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">Quote Budget (NGN)</label>
              <input type="number" title="Quote Budget" aria-label="Quote Budget" placeholder="0" value={sBudget} onChange={e => setSBudget(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white" />
              <p className="text-xs text-slate-500">Setting this &gt; 0 allows the client to pay.</p>
            </div>
            
            <div className="pt-4 border-t border-slate-800">
              <button disabled={savingSettings} type="submit" className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors disabled:opacity-50">
                {savingSettings ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </form>
      )}

    </div>
  );
}
