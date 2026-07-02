'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { agencyService, AgencyProject } from '../../../../features/agency/agencyService';
import { getBankAccounts, submitPayment, uploadReceipt } from '../../../../features/payments/paymentsService';
import { teamService, TeamSprint, TeamTask } from '../../../../features/team/teamService';
import { Loader2, ArrowLeft, Briefcase, CheckCircle2, Clock, MapPin, Receipt, UploadCloud, Building, FileText, ListTodo, KanbanSquare, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ProjectTickets } from '../../../../components/agency/ProjectTickets';

export default function AgencyProjectDashboard() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  
  const [project, setProject] = useState<AgencyProject | null>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [banks, setBanks] = useState<any[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [selectedBank, setSelectedBank] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [refNumber, setRefNumber] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // Tabs & Team Board state
  const [activeTab, setActiveTab] = useState<'overview' | 'board' | 'tickets'>('overview');
  const [sprints, setSprints] = useState<TeamSprint[]>([]);
  const [tasks, setTasks] = useState<TeamTask[]>([]);
  const [activeSprintId, setActiveSprintId] = useState<string>('');

  useEffect(() => {
    async function loadData() {
      try {
        const [data, banksData, sps, tks] = await Promise.all([
          agencyService.getProject(id),
          getBankAccounts(),
          teamService.getSprints(id).catch(() => []),
          teamService.getTasks(id).catch(() => [])
        ]);
        setProject(data.project);
        setMilestones(data.milestones);
        setInvoices(data.invoices);
        setBanks(banksData);
        setSprints(sps);
        setTasks(tks);
        const active = sps.find(s => s.status === 'active') || sps[0];
        if (active) setActiveSprintId(active.$id);
      } catch (err: any) {
        toast.error('Failed to load project details');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptFile(e.target.files[0]);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBank || !receiptFile || !selectedInvoice) {
      toast.error('Please fill all payment fields and select a receipt');
      return;
    }

    setSubmittingPayment(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(receiptFile);
      reader.onload = async () => {
        const base64 = reader.result as string;
        
        // 1. Upload Receipt
        const receiptUrl = await uploadReceipt(base64, receiptFile.name);
        
        // 2. Submit Payment mapped to this Invoice
        await submitPayment({
          type: 'agency',
          referenceId: selectedInvoice.$id, // we map payment to invoice ID
          bankAccountId: selectedBank,
          amount: selectedInvoice.amount,
          receiptImage: receiptUrl,
          referenceNumber: refNumber || `INV-${selectedInvoice.$id.slice(-6)}`
        });

        toast.success('Payment proof submitted for review!');
        setSelectedInvoice(null);
        setReceiptFile(null);
        setRefNumber('');
        // Reload project data
        const data = await agencyService.getProject(id);
        setInvoices(data.invoices);
      };
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit payment proof');
    } finally {
      setSubmittingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-5xl mx-auto p-8 text-center text-slate-400">
        Project not found.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/agency" className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Briefcase className="w-8 h-8 text-indigo-400" />
            {project.title}
          </h1>
          <p className="text-slate-400 mt-1">Client Dashboard & Roadmap</p>
        </div>
      </div>

      <div className="border-b border-slate-800 mb-8 flex gap-8">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`pb-4 text-sm font-bold transition-colors border-b-2 ${activeTab === 'overview' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'}`}
        >
          <div className="flex items-center gap-2"><FileText className="w-4 h-4" /> Overview & Billing</div>
        </button>
        <button 
          onClick={() => setActiveTab('board')}
          className={`pb-4 text-sm font-bold transition-colors border-b-2 ${activeTab === 'board' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'}`}
        >
          <div className="flex items-center gap-2"><KanbanSquare className="w-4 h-4" /> Active Sprint Board</div>
        </button>
        <button 
          onClick={() => setActiveTab('tickets')}
          className={`pb-4 text-sm font-bold transition-colors border-b-2 ${activeTab === 'tickets' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'}`}
        >
          <div className="flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Support Tickets</div>
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Col: Project Details & Invoices */}
          <div className="lg:col-span-1 space-y-8">
          
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              Project Overview
            </h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800/50">
                <span className="text-slate-400">Status</span>
                <span className="uppercase text-xs font-bold text-indigo-400 px-2 py-0.5 bg-indigo-500/10 rounded-full border border-indigo-500/20">
                  {project.status.replace('-', ' ')}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-800/50">
                <span className="text-slate-400">Type</span>
                <span className="text-white font-medium">{project.projectType}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-800/50">
                <span className="text-slate-400">Quoted Price</span>
                <span className="text-emerald-400 font-bold">
                  {project.quotePrice ? `$${project.quotePrice.toLocaleString()}` : 'Pending Estimation'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Target Deadline</span>
                <span className="text-white font-medium">
                  {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'Flexible'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-400" />
              Invoices & Billing
            </h3>
            
            {invoices.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No invoices generated yet.</p>
            ) : (
              <div className="space-y-4">
                {invoices.map(invoice => (
                  <div key={invoice.$id} className={`border rounded-xl p-4 ${invoice.status === 'paid' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-950 border-slate-800'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-xs text-slate-500">Invoice #{invoice.$id.slice(-6).toUpperCase()}</span>
                        <div className="font-bold text-white mt-1">${invoice.amount.toLocaleString()}</div>
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        invoice.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
                        invoice.paymentId ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {invoice.status === 'paid' ? 'Paid' : invoice.paymentId ? 'Verifying' : 'Unpaid'}
                      </span>
                    </div>

                    {!invoice.paymentId && invoice.status !== 'paid' && (
                      <button 
                        onClick={() => setSelectedInvoice(invoice)}
                        className="mt-3 w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors"
                      >
                        Upload Bank Transfer Receipt
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Col: Milestones */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-6">
            Project Roadmap
          </h2>

          {milestones.length === 0 ? (
            <div className="border border-slate-800 border-dashed rounded-2xl p-12 text-center bg-slate-900/20">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">No milestones set yet</h3>
              <p className="text-slate-400 text-sm">Your dedicated project manager will break down the project into deliverable milestones shortly after the quote is approved.</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-800 ml-4 space-y-8 pb-4">
              {milestones.map((ms, idx) => (
                <div key={ms.$id} className="relative pl-8">
                  {/* Timeline Dot */}
                  <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-4 border-slate-950 ${
                    ms.status === 'completed' ? 'bg-emerald-500' : 
                    ms.status === 'in-progress' ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.6)]' : 
                    'bg-slate-600'
                  }`} />
                  
                  <div className={`border rounded-2xl p-6 transition-all ${
                    ms.status === 'in-progress' 
                      ? 'bg-slate-900/80 border-indigo-500/50 shadow-lg shadow-indigo-500/10' 
                      : 'bg-slate-900/30 border-slate-800'
                  }`}>
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-3">
                      <h4 className="text-lg font-bold text-white">{ms.title}</h4>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                        ms.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                        ms.status === 'in-progress' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 
                        'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {ms.status.replace('-', ' ')}
                      </span>
                    </div>
                    
                    <p className="text-slate-400 text-sm mb-4 leading-relaxed">{ms.description || 'No description provided.'}</p>
                    
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                      <Clock className="w-4 h-4" />
                      Target: {new Date(ms.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      )}

      {activeTab === 'board' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-xl border border-slate-800">
            <div>
              <h3 className="font-bold text-white">Sprint Progress</h3>
              <p className="text-xs text-slate-400">View real-time updates from your development team.</p>
            </div>
            <select 
              title="Select Sprint"
              value={activeSprintId}
              onChange={(e) => setActiveSprintId(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-white text-sm rounded-lg px-3 py-1.5 focus:border-indigo-500 outline-none"
            >
              <option value="">Backlog (No Sprint)</option>
              {sprints.map(s => (
                <option key={s.$id} value={s.$id}>{s.title} ({s.status})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { id: 'todo', title: 'To Do', color: 'border-slate-700 bg-slate-800/30' },
              { id: 'in-progress', title: 'In Progress', color: 'border-indigo-500/30 bg-indigo-900/20' },
              { id: 'review', title: 'Code Review', color: 'border-yellow-500/30 bg-yellow-900/20' },
              { id: 'done', title: 'Done', color: 'border-emerald-500/30 bg-emerald-900/20' }
            ].map(col => {
              const colTasks = tasks.filter(t => t.sprintId === activeSprintId && t.status === col.id);
              return (
                <div key={col.id} className={`rounded-xl border ${col.color} p-4 flex flex-col`}>
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-inherit">
                    <h4 className="font-bold text-white text-sm">{col.title}</h4>
                    <span className="text-xs text-slate-400 bg-black/20 px-2 py-0.5 rounded-full">{colTasks.length}</span>
                  </div>
                  
                  <div className="space-y-3 flex-1 overflow-y-auto min-h-[300px]">
                    {colTasks.length === 0 && (
                      <div className="text-xs text-slate-500 text-center py-4">No tasks in this column</div>
                    )}
                    {colTasks.map(task => (
                      <div key={task.$id} className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                        <h5 className="font-semibold text-white text-sm leading-snug mb-2">{task.title}</h5>
                        {task.description && (
                          <p className="text-xs text-slate-500 line-clamp-2 mb-3">{task.description}</p>
                        )}
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            task.priority === 'urgent' ? 'bg-rose-500' :
                            task.priority === 'high' ? 'bg-orange-500' :
                            task.priority === 'medium' ? 'bg-blue-500' : 'bg-slate-500'
                          }`} title={`Priority: ${task.priority}`} />
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider">{task.priority}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'tickets' && (
        <ProjectTickets projectId={id} />
      )}

      {/* Payment Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedInvoice(null)} />
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 w-full max-w-md relative z-10">
            <h3 className="text-xl font-bold text-white mb-2">Upload Payment Receipt</h3>
            <p className="text-sm text-slate-400 mb-6">Invoice #{selectedInvoice.$id.slice(-6).toUpperCase()} • <span className="font-bold text-emerald-400">${selectedInvoice.amount.toLocaleString()}</span></p>

            <form onSubmit={handlePaymentSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Select Our Bank Account</label>
                <select 
                  title="Select Bank Account"
                  required
                  value={selectedBank}
                  onChange={e => setSelectedBank(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                >
                  <option value="">-- Choose Account --</option>
                  {banks.map(bank => (
                    <option key={bank.$id} value={bank.$id}>
                      {bank.bankName} - {bank.accountNumber} ({bank.accountName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Transfer Reference Number (Optional)</label>
                <input 
                  type="text"
                  placeholder="e.g. TR-123456"
                  value={refNumber}
                  onChange={e => setRefNumber(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Receipt / Screenshot</label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl cursor-pointer bg-slate-900/50 hover:bg-slate-900 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                    <p className="text-sm text-slate-400 font-medium">
                      {receiptFile ? receiptFile.name : 'Click to upload receipt image'}
                    </p>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} required />
                </label>
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setSelectedInvoice(null)}
                  className="flex-1 py-3 px-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submittingPayment}
                  className="flex-1 py-3 px-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition-colors disabled:opacity-50"
                >
                  {submittingPayment ? 'Uploading...' : 'Submit Proof'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
